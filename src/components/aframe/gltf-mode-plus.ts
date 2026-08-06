import { BaseComponent, component } from 'aframe-typescript-class-components';
import type { Entity, Schema } from 'aframe';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import {
  BufferGeometry,
  Group,
  LoadingManager,
  Material,
  MathUtils,
  Mesh,
  Texture,
  type Object3D,
} from 'three';
import nextTick from '#/utils/next-tick';
import { cloneObject3D, isMorphable } from '#/utils/three-utils';
import { MeshBVH } from 'three-mesh-bvh';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { mapMaterials } from '#/utils/material-utils';

export interface GLTFModelPlusComponentData {
  src: string;
  contentType: string;
  useCache: boolean;
  inflate: boolean;
  modelToWorldScale: number;
}
type JSONPreprocessor = (gltf: GLTF) => GLTF;
type OnProgressCallback = (event: ProgressEvent) => void;

class GLTFCache {
  cache = new Map();

  set(src: string, gltf: GLTF) {
    gltf.scene.userData.gltfCacheKey = src;
    this.cache.set(src, {
      gltf,
      count: 0,
    });
    return this.retain(src);
  }

  has(src: string) {
    return this.cache.has(src);
  }

  get(src: string) {
    return this.cache.get(src);
  }

  retain(src: string) {
    const cacheItem = this.cache.get(src);
    cacheItem.count++;
    return cacheItem;
  }

  release(src: string) {
    const cacheItem = this.cache.get(src);

    if (!cacheItem) {
      console.error(`Releasing uncached gltf ${src}`);
      return;
    }

    cacheItem.count--;
    if (cacheItem.count <= 0) {
      cacheItem.gltf.scene.dispose();
      this.cache.delete(src);
    }
  }
}

export const gltfCache = new GLTFCache();
const inflightGltfs = new Map<string, Promise<GLTF>>();

// REIMP
function getHubsComponents(node: any) {
  return null;
}

// REIMP
function getHubsComponentsFromMaterial(node: any) {
  return null;
}

/// Walks the tree of three.js objects starting at the given node, using the GLTF data
/// and template data to construct A-Frame entities and components when necessary.
/// (It's unnecessary to construct entities for subtrees that have no component data
/// or templates associated with any of their nodes.)
///
/// Returns the A-Frame entity associated with the given node, if one was constructed.
function inflateEntities(
  indexToEntityMap: Record<number, Entity>,
  node: Object3D,
  templates: Record<string, HTMLTemplateElement>,
  isRoot?: boolean,
  modelToWorldScale = 1,
) {
  // inflate subtrees first so that we can determine whether or not this node needs to be inflated
  const childEntities = [];
  // setObject3D mutates the node's parent, so we have to copy
  for (const child of node.children) {
    const el = inflateEntities(indexToEntityMap, child, templates);
    if (el) {
      childEntities.push(el);
    }
  }

  const entityComponents = getHubsComponents(node);
  const materialComponents = getHubsComponentsFromMaterial(node);

  const nodeHasBehavior =
    !!entityComponents || !!materialComponents || node.name in templates;
  if (!nodeHasBehavior && !childEntities.length && !isRoot) {
    return null; // we don't need an entity for this node
  }

  const el = document.createElement('a-entity');
  el.append.apply(el, childEntities);

  // Remove invalid CSS class name characters.
  const className = (node.name || node.uuid).replace(/[^\w-]/g, '');
  el.classList.add(className);

  // AFRAME rotation component expects rotations in YXZ, convert it
  if (node.rotation.order !== 'YXZ') {
    node.rotation.setFromQuaternion(node.quaternion, 'YXZ');
  }

  // Copy over the object's transform to the Group and reset the actual transform of the Object3D
  // all updates to the object should be done through the Group wrapper
  el.object3D.position.copy(node.position);
  el.object3D.rotation.copy(node.rotation);
  el.object3D.scale.copy(node.scale).multiplyScalar(modelToWorldScale);
  el.object3D.matrixNeedsUpdate = true;

  node.matrixAutoUpdate = false;
  node.matrix.identity();
  node.matrix.decompose(node.position, node.quaternion, node.scale);

  el.setObject3D(node.type.toLowerCase(), node);
  if (entityComponents && 'nav-mesh' in entityComponents) {
    el.setObject3D('mesh', node);
  }

  // Set the name of the `Group` to match the name of the node,
  // so that templates can be attached to the correct AFrame entity.
  el.object3D.name = node.name;

  // Set the uuid of the `Group` to match the uuid of the node,
  // so that `PropertyBinding` will find (and later animate)
  // the group. See `PropertyBinding.findNode`:
  // https://github.com/mrdoob/three.js/blob/dev/src/animation/PropertyBinding.js#L211
  el.object3D.uuid = node.uuid;
  node.uuid = MathUtils.generateUUID();

  if (node.animations) {
    // Pass animations up to the group object so that when we can pass the group as
    // the optional root in `AnimationMixer.clipAction` and use the hierarchy
    // preserved under the group (but not the node). Otherwise `clipArray` will be
    // `null` in `AnimationClip.findByName`.
    if (node.parent) node.parent.animations = node.animations;
  }

  if (isMorphable(node) && node.parent && isMorphable(node.parent)) {
    node.parent.morphTargetInfluences = node.morphTargetInfluences;
  }

  const gltfIndex = node.userData.gltfIndex;
  if (gltfIndex !== undefined) {
    indexToEntityMap[gltfIndex] = el;
  }

  return el;
}

function generateMeshBVH(object3D: Object3D) {
  object3D.traverse((obj) => {
    // note that we might already have a bounds tree if this was a clone of an object with one
    const hasBufferGeometry =
      obj instanceof Mesh && obj.geometry instanceof BufferGeometry;
    const hasBoundsTree = hasBufferGeometry && obj.geometry.boundsTree;
    if (
      hasBufferGeometry &&
      !hasBoundsTree &&
      obj.geometry.attributes.position
    ) {
      const geo = obj.geometry;

      if (
        geo.attributes.position.isInterleavedBufferAttribute ||
        (geo.index && geo.index.isInterleavedBufferAttribute)
      ) {
        console.warn(
          'Skipping generaton of MeshBVH for interleaved geoemtry as it is not supported',
        );
        return;
      }

      const triCount = geo.index
        ? geo.index.count / 3
        : geo.attributes.position.count / 3;
      // only bother using memory and time making a BVH if there are a reasonable number of tris,
      // and if there are too many it's too painful and large to tolerate doing it (at least until
      // we put this in a web worker)

      if (triCount > 1000 && triCount < 1000000) {
        // note that bounds tree construction creates an index as a side effect if one doesn't already exist
        geo.boundsTree = new MeshBVH(obj.geometry, {
          strategy: 0,
          maxDepth: 30,
        });
      }
    }
  });
}

function resolveAsset(src: string) {
  // If the src attribute is a selector, get the url from the asset item.
  if (src && src.charAt(0) === '#') {
    const assetEl = document.getElementById(src.substring(1));
    if (assetEl) {
      return assetEl.getAttribute('src');
    }
  }
  return src;
}

function attachTemplate(root: Entity, name: string, templateRoot: HTMLElement) {
  const targetEls = root.querySelectorAll('.' + name);
  for (const el of targetEls) {
    const root = templateRoot.cloneNode(true) as HTMLElement;
    // Merge root element attributes with the target element
    for (const { name, value } of root.attributes) {
      el.setAttribute(name, value);
    }

    // Append all child elements
    while (root.children.length > 0) {
      el.appendChild(root.children[0]);
    }
  }
}

interface ObjectInflation {
  promise?: Promise<void>;
  resolve?: () => void;
}
async function inflateComponents(
  inflatedEntity: Entity,
  indexToEntityMap: Record<number, Entity>,
) {
  let isFirstInflation = true;
  const objectInflations: ObjectInflation[] = [];

  inflatedEntity.object3D.traverse(async (object3D) => {
    const objectInflation: ObjectInflation = {};
    objectInflation.promise = new Promise(
      (resolve) => (objectInflation.resolve = resolve),
    );
    objectInflations.push(objectInflation);

    if (!isFirstInflation) {
      await objectInflations.shift()?.promise;
    }
    isFirstInflation = false;

    const entityComponents = getHubsComponents(object3D);
    const el = object3D.el;

    // HACK: ANY
    function resolveNodeRefs(componentData: Record<string, any>) {
      for (const propName in componentData) {
        const value = componentData[propName];
        const type = value?.__mhc_link_type;
        if (type === 'node' && value.index !== undefined) {
          if (indexToEntityMap[value.index]) {
            componentData[propName] = indexToEntityMap[value.index].object3D;
          } else {
            console.warn('inflateComponents: invalid node reference', propName);
            componentData[propName] = null;
          }
        }
      }
      return componentData;
    }

    // if (entityComponents && el) {
    //   for (const prop in entityComponents) {
    //     if (
    //       Object.prototype.hasOwnProperty.call(entityComponents, prop) &&
    //       Object.prototype.hasOwnProperty.call(
    //         AFRAME.GLTFModelPlus.components,
    //         prop,
    //       )
    //     ) {
    //       const { componentName, inflator } =
    //         AFRAME.GLTFModelPlus.components[prop];
    //       await inflator(
    //         el,
    //         componentName,
    //         resolveNodeRefs(entityComponents[prop]),
    //         entityComponents,
    //         indexToEntityMap,
    //       );
    //     }
    //   }
    // }

    const materialComponents = getHubsComponentsFromMaterial(object3D);

    // if (materialComponents && el) {
    //   for (const prop in materialComponents) {
    //     if (
    //       Object.prototype.hasOwnProperty.call(materialComponents, prop) &&
    //       Object.prototype.hasOwnProperty.call(
    //         AFRAME.GLTFModelPlus.components,
    //         prop,
    //       )
    //     ) {
    //       const { componentName, inflator } =
    //         AFRAME.GLTFModelPlus.components[prop];
    //       await inflator(
    //         el,
    //         componentName,
    //         resolveNodeRefs(materialComponents[prop]),
    //         materialComponents,
    //         indexToEntityMap,
    //       );
    //     }
    //   }
    // }

    if (objectInflation?.resolve) objectInflation.resolve();
  });

  const nextInflation = objectInflations.shift();
  if (nextInflation?.promise) await nextInflation.promise;
}

function cloneGltf(gltf: GLTF) {
  const scene = cloneObject3D(gltf.scene);
  return {
    animations: scene.animations,
    scene,
  };
}

let ktxLoader: KTX2Loader;
let dracoLoader: DRACOLoader;

export async function loadModel(
  src: string,
  contentType?: string,
  useCache = false,
  jsonPreprocessor?: JSONPreprocessor,
) {
  console.log(`Loading model ${src}`);
  if (useCache) {
    if (gltfCache.has(src)) {
      gltfCache.retain(src);
      return cloneGltf(gltfCache.get(src).gltf);
    } else {
      if (inflightGltfs.has(src)) {
        const gltf = await inflightGltfs.get(src);
        gltfCache.retain(src);
        return cloneGltf(gltf!);
      } else {
        const promise = loadGLTF(src, contentType, null, jsonPreprocessor);
        inflightGltfs.set(src, promise);
        const gltf = await promise;
        inflightGltfs.delete(src);
        gltfCache.set(src, gltf);
        return cloneGltf(gltf);
      }
    }
  } else {
    return loadGLTF(src, contentType, null, jsonPreprocessor);
  }
}

export async function loadGLTF(
  src: string,
  contentType?: string,
  onProgress?: OnProgressCallback | null,
  jsonPreprocessor?: JSONPreprocessor,
) {
  let gltfUrl = src;
  let fileMap: Record<string, string> = {};

  // TODO: Handle promisfy worker
  //   if (
  //     contentType &&
  //     (contentType.includes('model/gltf+zip') ||
  //       contentType.includes('application/x-zip-compressed'))
  //   ) {
  //     fileMap = await extractZipFile(gltfUrl);
  //     gltfUrl = fileMap['scene.gtlf'];
  //   }

  //   const useRangeRequests = qsTruthy("rangerequests");
  const loadingManager = new LoadingManager();
  //   loadingManager.setURLModifier(getCustomGLTFParserURLResolver(gltfUrl));
  const gltfLoader = new GLTFLoader(loadingManager);
  //   gltfLoader
  //     //HACK: FIX
  //     //@ts-ignore
  //     .register(parser => new GLTFHubsComponentsExtension(parser))
  //     .register(parser => new GLTFHubsPlugin(parser, jsonPreprocessor))
  //     .register(parser => new GLTFHubsLightMapExtension(parser))
  //     .register(parser => new GLTFHubsTextureBasisExtension(parser))
  //     .register(parser => new GLTFMozTextureRGBE(parser, new RGBELoader().setDataType(HalfFloatType)))
  //     .register(parser => new GLTFHubsLoopAnimationComponent(parser))
  //     .register(
  //       parser =>
  //         new GLTFLodExtension(parser, {
  //           loadingMode: useRangeRequests ? "progressive" : "all",
  //           onLoadMesh: (lod: LOD, mesh: Mesh<BufferGeometry, Material>, level: number, lowestLevel: number) => {
  //             // Nothing to do for "all" mode
  //             if (!useRangeRequests) {
  //               return mesh;
  //             }

  //             // Higher levels are progressively loaded on demand.
  //             // So some post-loading processings done in gltf-model-plus and media-loader
  //             // need to be done here now.

  //             // Nothing to do if this is the lowest level mesh.
  //             if (level === lowestLevel || lod.levels.length === 0) {
  //               return mesh;
  //             }

  //             let lowestMeshLevel = null;
  //             for (let index = lowestLevel; index > level; index--) {
  //               if (lod.levels[index].object.type !== "Object3D") {
  //                 lowestMeshLevel = index;
  //                 break;
  //               }
  //             }

  //             if (lowestMeshLevel === null) {
  //               return mesh;
  //             }

  //             // Create a mesh clone. Otherwise if an lod instance is cloned before higher
  //             // levels are loaded the lods instance can refer to the same mesh instance,
  //             // therefore the lods can be broken because an object can't be placed
  //             // at multiple places in a Three.js scene tree.
  //             mesh = mesh.clone();

  //             convertStandardMaterialsIfNeeded(mesh);

  //             // A hacky solution. media-loader and media-utils make a material clone
  //             // and inject shader code chunk for hover effects on before compile hook
  //             // as a post-loading process. Here simulates them.
  //             // @TODO: Check if this always works. Replace with a better and simpler solution.
  //             const currentOnBeforeRender = mesh.material.onBeforeRender;
  //             mesh.material = mesh.material.clone();
  //             mesh.material.onBeforeRender = currentOnBeforeRender;

  //             // onBeforeCompile of the material of the lowest level mesh should be
  //             // already set up because the lowest level should be loaded first.
  //             mesh.material.onBeforeCompile = (
  //               lod.levels[lowestMeshLevel].object as Mesh<BufferGeometry, Material>
  //             ).material.onBeforeCompile;

  //             return mesh;
  //           }
  //         })
  //     );

  // TODO some models are loaded before the renderer exists. This is likely things like the camera tool and loading cube.
  // They don't currently use KTX textures but if they did this would be an issue. Fixing this is hard but is part of
  // "taking control of the render loop" which is something we want to tackle for many reasons.
  if (!ktxLoader && AFRAME && AFRAME.scenes && AFRAME.scenes[0]) {
    ktxLoader = new KTX2Loader(loadingManager).detectSupport(
      AFRAME.scenes[0].renderer,
    );
  }
  if (!dracoLoader && AFRAME && AFRAME.scenes && AFRAME.scenes[0]) {
    dracoLoader = new DRACOLoader(loadingManager);
  }

  if (ktxLoader) {
    gltfLoader.setKTX2Loader(ktxLoader);
  }
  if (dracoLoader) {
    gltfLoader.setDRACOLoader(dracoLoader);
  }

  return new Promise<GLTF>((resolve, reject) => {
    const onLoad = (gltf: GLTF) => {
      const disposables = new Set<Material | BufferGeometry | Texture>();

      gltf.scenes.forEach((scene: Group) => {
        scene.traverse((obj: Object3D) => {
          if (obj instanceof Mesh) {
            disposables.add(obj.geometry);
          }

          mapMaterials(obj, function (m: Material) {
            disposables.add(m);
          });

          const mozHubsComponents =
            obj.userData.gltfExtensions?.MOZ_hubs_components;
          if (mozHubsComponents) {
            for (const name in mozHubsComponents) {
              const componentData = mozHubsComponents[name];
              for (const propName in componentData) {
                const propValue = componentData[propName];
                if (
                  propValue &&
                  (propValue instanceof Texture ||
                    propValue instanceof BufferGeometry)
                ) {
                  disposables.add(propValue);
                }
              }
            }
          }
        });

        // scene.associations = gltf.parser.associations;
        //     scene.dispose = function dispose() {
        //       disposables.forEach((disposable) => {
        //         if (disposable instanceof Material) {
        //           disposeMaterial(disposable);
        //         } else {
        //           disposable.dispose();
        //         }
        //       });
        //     };
      });

      resolve(gltf);
    };

    gltfLoader.load(
      gltfUrl,
      onLoad,
      onProgress ? onProgress : undefined,
      reject,
    );
    // if (useRangeRequests) {
    //   GLBRangeRequests.load(gltfUrl, gltfLoader, onLoad, onProgress, reject);
    // } else {
    // }
  }).finally(() => {
    if (fileMap) {
      // The GLTF is now cached as a THREE object, we can get rid of the original blobs
      Object.keys(fileMap).forEach(URL.revokeObjectURL);
    }
  });
}

@component('gltf-model-plus')
export default class GLTFModelPlusComponent extends BaseComponent<GLTFModelPlusComponentData> {
  static schema: Schema = {
    src: { type: 'string' },
    contentType: { type: 'string' },
    useCache: { default: true },
    inflate: { default: false },
    modelToWorldScale: { type: 'number', default: 1 },
  };

  jsonPreprocessor: null | JSONPreprocessor = null;
  templates: Record<string, HTMLTemplateElement> = {};
  lastSrc = '';
  inflatedEl?: Entity | null = null;
  model: Object3D | null = null;

  init() {
    this.jsonPreprocessor = null;
    this.loadTemplates();
  }

  play() {
    this.el.components['listed-media'] &&
      this.el.sceneEl?.emit('listed_media_changed');
  }

  update() {
    this.applySrc(resolveAsset(this.data.src) || '', this.data.contentType);
  }

  loadTemplates() {
    this.templates = {};
    this.el
      .querySelectorAll<HTMLTemplateElement>(':scope > template')
      .forEach((templateEl) => {
        const root = templateEl.firstElementChild
          ? (document.importNode(
              templateEl.firstElementChild,
              true,
            ) as HTMLTemplateElement)
          : templateEl.content.firstElementChild
            ? (document.importNode(
                templateEl.content.firstElementChild,
                true,
              ) as HTMLTemplateElement)
            : null;
        const dataName = templateEl.getAttribute('date-name');
        if (dataName && root) this.templates[dataName] = root;
      });
  }

  async applySrc(src: string, contentType: string) {
    try {
      if (src === this.lastSrc) return;

      const lastSrc = this.lastSrc;
      this.lastSrc = src;

      if (!src) {
        if (this.inflatedEl) {
          console.warn(
            'gltf-model-plus set to an empty source, unloading inflated model.',
          );
          this.disposeLastInflatedEl();
        }
        return;
      }

      this.el.emit('model-loading');
      const gltf = await loadModel(
        src,
        contentType,
        this.data.useCache,
        this.jsonPreprocessor || undefined,
      );

      // If we started loading something else already
      // TODO: there should be a way to cancel loading instead
      if (src != this.lastSrc) return;

      // If we had inflated something already before, clean that up
      this.disposeLastInflatedEl();

      this.model = gltf.scene;

      if (gltf.animations.length > 0) {
        this.el.setAttribute('animation-mixer', {});
        this.el.components['animation-mixer'].initMixer(gltf.animations);
      } else if (this.model) {
        generateMeshBVH(this.model);
      }

      const indexToEntityMap = {};
      let object3DToSet = this.model;

      if (
        this.data.inflate &&
        this.model &&
        (this.inflatedEl = inflateEntities(
          indexToEntityMap,
          this.model,
          this.templates,
          true,
          this.data.modelToWorldScale,
        ))
      ) {
        this.el.appendChild(this.inflatedEl);

        object3DToSet = this.inflatedEl.object3D;
        object3DToSet.visible = false;

        // TODO: Still don't fully understand the lifecycle here and how it differs between browsers, we should dig in more
        // Wait one tick for the appended custom elements to be connected before attaching templates
        await nextTick();
        if (src != this.lastSrc) return; // TODO: there must be a nicer pattern for this

        await inflateComponents(this.inflatedEl, indexToEntityMap);

        for (const name in this.templates) {
          attachTemplate(this.el, name, this.templates[name]);
        }
      }

      // The call to setObject3D below recursively clobbers any `el` backreferences to entities
      // in the entire inflated entity graph to point to `object3DToSet`.
      //
      // We don't want those overwritten, since lots of code assumes `object3d.el` points to the relevant
      // A-Frame entity for that three.js object, so we back them up and re-wire them here. If we didn't do
      // this, all the `el` properties on these object3ds would point to the `object3DToSet` which is either
      // the model or the root GLTF inflated entity.
      const rewires: (() => void)[] = [];

      if (!object3DToSet) throw new Error('Object3D not set!');

      object3DToSet.traverse((o) => {
        const el = o.el;
        if (el) rewires.push(() => (o.el = el));
      });

      if (lastSrc && this.data.useCache) {
        gltfCache.release(lastSrc);
      }
      this.el.setObject3D('mesh', object3DToSet);

      rewires.forEach((f) => f());

      object3DToSet.visible = true;
      this.el.emit('model-loaded', { format: 'gltf', model: object3DToSet });
    } catch (e) {
      gltfCache.release(src);
      console.error('Failed to load glTF model', e, this);
      this.el.emit('model-error', { format: 'gltf', src });
    }
  }

  disposeLastInflatedEl() {
    if (this.inflatedEl) {
      this.inflatedEl.parentNode?.removeChild(this.inflatedEl);

      this.inflatedEl.object3D.traverse((obj: Object3D) => {
        if (!(obj instanceof Mesh)) return;
        if (obj.material && obj.material.dispose) {
          obj.material.dispose();
        }

        if (obj.geometry) {
          if (obj.geometry.dispose) {
            obj.geometry.dispose();
          }

          obj.geometry.boundsTree = null;
        }
      });

      delete this.inflatedEl;

      this.el.removeAttribute('animation-mixer');
    }
  }
}
