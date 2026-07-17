import {
  Color,
  Material,
  MeshBasicMaterial,
  MeshPhongMaterial,
  MeshStandardMaterial,
  Object3D,
  Mesh,
  Texture,
  type Material as MaterialType,
  type MeshBasicMaterialParameters,
  type WebGLProgramParametersWithUniforms,
} from 'three';
import type { MediaPlayerClass } from 'dashjs';
import type Hls from 'hls.js';

declare module 'three' {
  interface Texture {
    dash?: MediaPlayerClass;
    hls?: Hls | null;
  }
}

export function forEachMaterial(mesh: Mesh, fn: (mat: MaterialType) => void) {
  if (!mesh.material) return;

  if (Array.isArray(mesh.material)) {
    mesh.material.forEach(fn);
  } else {
    fn(mesh.material);
  }
}

export function updateMaterials(
  mesh: Mesh,
  fn: (mat: MaterialType) => MaterialType,
) {
  if (!mesh.material) return;

  if (Array.isArray(mesh.material)) {
    mesh.material = mesh.material.map(fn);
  } else {
    mesh.material = fn(mesh.material);
  }
}

export function mapMaterials(
  obj: Object3D,
  fn: (mat: MaterialType) => Material | void,
) {
  if (!(obj instanceof Mesh)) return [];

  if (Array.isArray(obj.material)) {
    return obj.material.map(fn);
  } else {
    return [fn(obj.material)];
  }
}

export const hoverableMaterials = [
  'MeshStandardMaterial',
  'MeshBasicMaterial',
  'MeshPhongMaterial',
];

interface HubsMeshBasicMateriaParameters extends MeshBasicMaterialParameters {
  emissive: Color;
  emissiveMap: Texture | null;
  emissiveIntensity: number;
}

// HubsMeshBasicMaterial exists because we need to be able to set the emissiveMap in the avatar preview.
// It also allows the material to be properly copied/cloned.
class HubsMeshBasicMaterial extends MeshBasicMaterial {
  static fromMeshStandardMaterial(source: MeshStandardMaterial) {
    const material = new HubsMeshBasicMaterial();

    Material.prototype.copy.call(material, source);
    material.onBeforeRender = source.onBeforeRender;

    material.color.copy(source.color);

    material.emissive.copy(source.emissive);
    material.emissiveIntensity = source.emissiveIntensity;
    material.emissiveMap = source.emissiveMap || new Texture();

    material.map = source.map;

    material.lightMap = source.lightMap;
    // See https://github.com/mrdoob/js/pull/23613 for "* Math.PI"
    material.lightMapIntensity = source.lightMapIntensity * Math.PI;

    material.aoMap = source.aoMap;
    material.aoMapIntensity = source.aoMapIntensity;

    material.alphaMap = source.alphaMap;

    material.wireframe = source.wireframe;
    material.wireframeLinewidth = source.wireframeLinewidth;
    material.wireframeLinecap = source.wireframeLinecap;
    material.wireframeLinejoin = source.wireframeLinejoin;

    return material;
  }

  _emissive: { value: Color };
  _emissiveIntensity: { value: number };
  _emissiveMap: { value: Texture | null };

  constructor(
    {
      emissive,
      emissiveMap,
      emissiveIntensity,
      ...rest
    }: HubsMeshBasicMateriaParameters = {
      emissive: new Color(),
      emissiveIntensity: 1,
      emissiveMap: null,
    },
  ) {
    super(rest);
    this._emissive = { value: emissive || new Color() };
    this._emissiveIntensity = { value: emissiveIntensity };
    this._emissiveMap = { value: emissiveMap };
  }

  get emissive() {
    return this._emissive.value;
  }

  set emissive(emissive) {
    this._emissive.value = emissive;
  }

  get emissiveIntensity() {
    return this._emissiveIntensity.value;
  }

  set emissiveIntensity(emissiveIntensity) {
    this._emissiveIntensity.value = emissiveIntensity;
  }

  get emissiveMap() {
    return this._emissiveMap.value;
  }

  set emissiveMap(emissiveMap) {
    this._emissiveMap.value = emissiveMap;
  }

  override copy(source: HubsMeshBasicMaterial) {
    super.copy(source);
    this.emissive.copy(source.emissive);
    this.emissiveIntensity = source.emissiveIntensity;
    this.emissiveMap = source.emissiveMap;
    return this;
  }

  override onBeforeCompile(shader: WebGLProgramParametersWithUniforms) {
    // This patch to the MeshBasicMaterial adds support for emissive maps.
    shader.uniforms.emissive = this._emissive;
    shader.uniforms.emissiveIntensity = this._emissiveIntensity;
    shader.uniforms.emissiveMap = this._emissiveMap;
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <lightmap_pars_fragment>',
      `#include <lightmap_pars_fragment>
      uniform vec3 emissive;
      uniform sampler2D emissiveMap;
      `,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <envmap_fragment>',
      `#include <envmap_fragment>

      vec3 totalEmissiveRadiance = emissive;
      #include <emissivemap_fragment>
      outgoingLight += totalEmissiveRadiance;

      `,
    );
  }
}

class HubsMeshPhongMaterial extends MeshPhongMaterial {
  static fromMeshStandardMaterial(source: MeshStandardMaterial) {
    const material = new HubsMeshPhongMaterial();

    Material.prototype.copy.call(material, source);
    material.onBeforeRender = source.onBeforeRender;

    material.color.copy(source.color);

    material.map = source.map;

    material.lightMap = source.lightMap;
    material.lightMapIntensity = source.lightMapIntensity;

    material.aoMap = source.aoMap;
    material.aoMapIntensity = source.aoMapIntensity;

    material.emissive.copy(source.emissive);
    material.emissiveMap = source.emissiveMap;
    material.emissiveIntensity = source.emissiveIntensity;

    material.normalMapType = source.normalMapType;
    material.normalMap = source.normalMap;
    material.normalScale.copy(source.normalScale);

    material.bumpMap = source.bumpMap;
    material.bumpScale = source.bumpScale;

    material.displacementMap = source.displacementMap;
    material.displacementScale = source.displacementScale;
    material.displacementBias = source.displacementBias;

    material.alphaMap = source.alphaMap;

    material.reflectivity = 0.5;
    //@ts-ignore
    // HACK: Ignoring the now-removed refractionRatio
    material.refractionRatio = source.refractionRatio;

    material.wireframe = source.wireframe;
    material.wireframeLinewidth = source.wireframeLinewidth;
    material.wireframeLinecap = source.wireframeLinecap;
    material.wireframeLinejoin = source.wireframeLinejoin;

    return material;
  }

  override onBeforeCompile(shader: WebGLProgramParametersWithUniforms) {
    // This patch to MeshPhongMaterial adds support for tangent space normal maps.
    shader.vertexShader = shader.vertexShader.replace(
      'varying vec3 vNormal;',
      `varying vec3 vNormal;
      #ifdef USE_TANGENT
        varying vec3 vTangent;
        varying vec3 vBitangent;
      #endif
      `,
    );
    shader.vertexShader = shader.vertexShader.replace(
      'vNormal = normalize( transformedNormal );',
      `vNormal = normalize( transformedNormal );
      
        #ifdef USE_TANGENT
      
          vTangent = normalize( transformedTangent );
          vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
      
        #endif
      `,
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <lights_phong_pars_fragment>',
      `#include <lights_phong_pars_fragment>
      #ifndef FLAT_SHADED

        #ifdef USE_TANGENT
          varying vec3 vTangent;
          varying vec3 vBitangent;
        #endif

      #endif
      `,
    );
  }
}

export function convertStandardMaterial(
  source: MeshStandardMaterial,
  quality: 'high' | 'medium' | 'low',
) {
  if (quality === 'medium') {
    return HubsMeshPhongMaterial.fromMeshStandardMaterial(source);
  } else if (quality === 'low') {
    return HubsMeshBasicMaterial.fromMeshStandardMaterial(source);
  }

  return source;
}

export function disposeTexture(texture: Texture) {
  if (texture.dash) {
    texture.dash.reset();
  }

  if (texture.image instanceof HTMLVideoElement) {
    const video = texture.image;
    video.pause();
    video.src = '';
    video.load();
  }

  if (texture.hls) {
    texture.hls.stopLoad();
    texture.hls.detachMedia();
    texture.hls.destroy();
    texture.hls = null;
  }

  texture.dispose();
}
