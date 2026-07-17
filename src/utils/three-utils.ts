import { hasComponent } from 'bitecs';
import {
  AnimationClip,
  Bone,
  BufferGeometry,
  DirectionalLight,
  KeyframeTrack,
  Material,
  MathUtils,
  Matrix4,
  PlaneGeometry,
  PropertyBinding,
  Quaternion,
  Skeleton,
  SkinnedMesh,
  SpotLight,
  Color,
  Line,
  Points,
  type TypedArray,
} from 'three';
import { Layers } from './camera-layers';
import {
  Box3,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Vector3,
} from 'three';
import { MediaVideo } from '#/components/bitecs/component-defs';
import { Text } from 'troika-three-text';
import { forEachMaterial } from './material-utils';
import { isMobile } from './is-mobile';

const tempVector3 = new Vector3();
const tempQuaternion = new Quaternion();

export function getLastWorldPosition(src: Object3D, target: Vector3) {
  src.updateMatrices();
  target.setFromMatrixPosition(src.matrixWorld);
  return target;
}

export function getLastWorldQuaternion(src: Object3D, target: Quaternion) {
  src.updateMatrices();
  src.matrixWorld.decompose(tempVector3, target, tempVector3);
  return target;
}

export function getLastWorldScale(src: Object3D, target: Vector3) {
  src.updateMatrices();
  src.matrixWorld.decompose(tempVector3, tempQuaternion, target);
  return target;
}

// Since type checking materials for specifics maps is such a pain...some type guards to help out
// export function isMappableMaterial<T extends Material>(mat: T): mat is IsMappableMaterial<T> {
//   return (mat as IsMappableMaterial<typeof mat>)["map"] !== undefined;
// }

// export function isLightMappableMaterial<T extends Material>(mat: T): mat is IsLightMapableMaterial<T> {
//   return (mat as IsLightMapableMaterial<typeof mat>)["lightMap"] !== undefined;
// }

// export function isBumpMappableMaterial<T extends Material>(mat: T): mat is IsBumpMapableMaterial<T> {
//   return (mat as IsBumpMapableMaterial<typeof mat>)["bumpMap"] !== undefined;
// }

// export function isNormalMappableMaterial<T extends Material>(mat: T): mat is IsNormalMapableMaterial<T> {
//   return (mat as IsNormalMapableMaterial<typeof mat>)["normalMap"] !== undefined;
// }

// export function isSpecularMappableMaterial<T extends Material>(mat: T): mat is IsSpecularMapableMaterial<T> {
//   return (mat as IsSpecularMapableMaterial<typeof mat>)["specularMap"] !== undefined;
// }

// export function isEnvMappableMaterial<T extends Material>(mat: T): mat is IsEnvMapableMaterial<T> {
//   return (mat as IsEnvMapableMaterial<typeof mat>)["envMap"] !== undefined;
// }

// export function isAOMappableMaterial<T extends Material>(mat: T): mat is IsAOMapableMaterial<T> {
//   return (mat as IsAOMapableMaterial<typeof mat>)["aoMap"] !== undefined;
// }

// export function isMetalnessMappableMaterial<T extends Material>(mat: T): mat is IsMetalnessMapableMaterial<T> {
//   return (mat as IsMetalnessMapableMaterial<typeof mat>)["metalnessMap"] !== undefined;
// }

// export function isRoughnessMappableMaterial<T extends Material>(mat: T): mat is IsRoughnessMapableMaterial<T> {
//   return (mat as IsRoughnessMapableMaterial<typeof mat>)["roughnessMap"] !== undefined;
// }

// export function isEmissiveMappableMaterial<T extends Material>(mat: T): mat is IsEmissiveMapableMaterial<T> {
//   return (mat as IsEmissiveMapableMaterial<typeof mat>)["emissiveMap"] !== undefined;
// }

// export function hasBoundingBox<T extends Mesh>(obj: T): obj is BoundableBox<T> {
//   return (obj as BoundableBox<typeof obj>)["boundingBox"] !== undefined;
// }

type Morphable = Line | Mesh | Points;

const HAS_IMAGE_BITMAP =
  window.createImageBitmap !== undefined &&
  /Firefox/.test(navigator.userAgent) === false &&
  !isMobile();
export const TEXTURES_FLIP_Y = !HAS_IMAGE_BITMAP;

export function isMorphable(obj: Object3D): obj is Morphable {
  return (obj as Morphable).morphTargetInfluences !== undefined;
}

interface HasMaterial {
  material: Material | Material[];
}

type HasSingleMaterial = { material: Material };

export type MaterialObject3D = Object3D & HasMaterial;

export function hasMaterial<T extends Object3D & { material?: any }>(
  obj: T,
): obj is T & HasMaterial {
  return typeof obj.material === 'string';
}

export function hasSingleMaterial<T extends Object3D & { material?: Material }>(
  obj: T,
): obj is T & HasSingleMaterial {
  return obj.material instanceof Material;
}

export function hasColor<T extends Material & { color?: Color }>(
  obj: T,
): obj is T & { color: Color } {
  return obj.color instanceof Color;
}

// TODO: Re-implement disposable material?
export function disposeMaterial<T extends Material>(mtrl: T) {
  // if (isMappableMaterial(mtrl)) mtrl.map.dispose();
  // if (isLightMappableMaterial(mtrl)) mtrl.lightMap.dispose();
  // if (isBumpMappableMaterial(mtrl)) mtrl.bumpMap.dispose();
  // if (isNormalMappableMaterial(mtrl)) mtrl.normalMap.dispose();
  // if (isSpecularMappableMaterial(mtrl)) mtrl.specularMap.dispose();
  // if (isEnvMappableMaterial(mtrl)) mtrl.envMap.dispose();
  // if (isAOMappableMaterial(mtrl)) mtrl.aoMap.dispose();
  // if (isMetalnessMappableMaterial(mtrl)) mtrl.metalnessMap.dispose();
  // if (isRoughnessMappableMaterial(mtrl)) mtrl.roughnessMap.dispose();
  // if (isEmissiveMappableMaterial(mtrl)) mtrl.emissiveMap.dispose();
  mtrl.dispose();
  //   if (mtrl.eid) {
  //     removeEntity(window.APP.world, mtrl.eid);
  //   }
}

export function disposeNode(node: Mesh) {
  if (node.geometry) {
    node.geometry.dispose();
  }

  forEachMaterial(node, disposeMaterial);
}

const IDENTITY = new Matrix4().identity();
const tempMatrix4 = new Matrix4();
const EPSILON = 0.00000000001;

export function setMatrixWorld(object3D: Object3D, m: Matrix4) {
  if (!object3D.matrixIsModified) {
    // HACK: Custom properties
    object3D.applyMatrix4(IDENTITY); // hack around our matrix optimizations
  }
  tempMatrix4.copy(object3D.matrixWorld);
  object3D.matrixWorld.copy(m);
  if (object3D.parent) {
    object3D.parent.updateMatrices();
    object3D.matrix.copy(object3D.parent.matrixWorld).invert().multiply(m);
  } else {
    object3D.matrix.copy(m);
  }
  object3D.matrix.decompose(
    object3D.position,
    object3D.quaternion,
    object3D.scale,
  );
  if (matNear(tempMatrix4, object3D.matrixWorld, EPSILON)) {
    object3D.matrixWorld.copy(tempMatrix4);
  } else {
    object3D.childrenNeedMatrixWorldUpdate = true;
  }
}

// Modified version of Don McCurdy's AnimationUtils.clone
// https://github.com/mrdoob/js/pull/14494

function parallelTraverse(
  a: Object3D,
  b: Object3D,
  callback: (a: Object3D, b: Object3D) => void,
) {
  callback(a, b);

  for (let i = 0; i < a.children.length; i++) {
    parallelTraverse(a.children[i], b.children[i], callback);
  }
}

// Supports the following PropertyBinding path formats:
// uuid.propertyName
// uuid.propertyName[propertyIndex]
// uuid.objectName[objectIndex].propertyName[propertyIndex]
// Does not support property bindings that use object3D names or parent nodes
function cloneKeyframeTrack(
  sourceKeyframeTrack: KeyframeTrack,
  cloneUUIDLookup: Map<string, string>,
) {
  const {
    nodeName: uuid,
    objectName,
    objectIndex,
    propertyName,
    propertyIndex,
  } = PropertyBinding.parseTrackName(sourceKeyframeTrack.name);

  let path = '';

  if (uuid !== undefined) {
    const clonedUUID = cloneUUIDLookup.get(uuid);

    if (clonedUUID === undefined) {
      console.warn(`Could not find KeyframeTrack target with uuid: "${uuid}"`);
    }

    path += clonedUUID;
  }

  if (objectName !== undefined) {
    path += '.' + objectName;
  }

  if (objectIndex !== undefined) {
    path += '[' + objectIndex + ']';
  }

  if (propertyName !== undefined) {
    path += '.' + propertyName;
  }

  if (propertyIndex !== undefined) {
    path += '[' + propertyIndex + ']';
  }

  const clonedKeyframeTrack = sourceKeyframeTrack.clone();
  clonedKeyframeTrack.name = path;

  return clonedKeyframeTrack;
}

function cloneAnimationClip(
  sourceAnimationClip: AnimationClip,
  cloneUUIDLookup: Map<string, string>,
) {
  const clonedTracks = sourceAnimationClip.tracks.map((keyframeTrack) =>
    cloneKeyframeTrack(keyframeTrack, cloneUUIDLookup),
  );
  return new AnimationClip(
    sourceAnimationClip.name,
    sourceAnimationClip.duration,
    clonedTracks,
  );
}

export function cloneObject3D(source: Object3D, preserveUUIDs?: boolean) {
  const cloneLookup = new Map();
  const cloneUUIDLookup = new Map<string, string>();

  const clone = source.clone();

  parallelTraverse(source, clone, (sourceNode, clonedNode) => {
    cloneLookup.set(sourceNode, clonedNode);

    if (sourceNode.userData.gltfExtensions?.MOZ_hubs_components) {
      clonedNode.userData.gltfExtensions.MOZ_hubs_components =
        sourceNode.userData.gltfExtensions.MOZ_hubs_components;
    }
  });

  source.traverse((sourceNode: Object3D) => {
    const clonedNode = cloneLookup.get(sourceNode);

    if (preserveUUIDs) {
      clonedNode.uuid = sourceNode.uuid;
    }

    cloneUUIDLookup.set(sourceNode.uuid, clonedNode.uuid);
  });

  source.traverse((sourceNode) => {
    const clonedNode = cloneLookup.get(sourceNode);

    if (!clonedNode) {
      return;
    }

    clonedNode.onBeforeRender = sourceNode.onBeforeRender;

    if (sourceNode.animations) {
      clonedNode.animations = sourceNode.animations.map((animationClip) =>
        cloneAnimationClip(animationClip, cloneUUIDLookup),
      );
    }

    if (sourceNode instanceof Mesh && sourceNode.geometry.boundsTree) {
      clonedNode.geometry.boundsTree = sourceNode.geometry.boundsTree;
    }

    if (
      (clonedNode instanceof DirectionalLight ||
        clonedNode instanceof SpotLight) &&
      (sourceNode instanceof DirectionalLight ||
        sourceNode instanceof SpotLight)
    ) {
      clonedNode.target = cloneLookup.get(sourceNode.target);
    }

    if (!(sourceNode instanceof SkinnedMesh)) return;

    const sourceBones = sourceNode.skeleton.bones;

    clonedNode.skeleton = sourceNode.skeleton.clone();

    clonedNode.skeleton.bones = sourceBones.map((sourceBone) => {
      if (!cloneLookup.has(sourceBone)) {
        throw new Error(
          'Required bones are not descendants of the given object.',
        );
      }

      return cloneLookup.get(sourceBone);
    });

    clonedNode.bind(clonedNode.skeleton, sourceNode.bindMatrix);
  });

  return clone;
}

export function findNode(root: Object3D, pred: (node: Object3D) => boolean) {
  let nodes = [root];
  while (nodes.length) {
    const node = nodes.shift();
    if (!node) return null;
    if (pred(node)) return node;
    if (node.children) nodes = nodes.concat(node.children);
  }
  return null;
}

export const interpolateAffine = (function () {
  const mat4 = new Matrix4();
  const end = {
    position: new Vector3(),
    quaternion: new Quaternion(),
    scale: new Vector3(),
  };
  const start = {
    position: new Vector3(),
    quaternion: new Quaternion(),
    scale: new Vector3(),
  };
  const interpolated = {
    position: new Vector3(),
    quaternion: new Quaternion(),
    scale: new Vector3(),
  };
  return function (
    startMat4: Matrix4,
    endMat4: Matrix4,
    progress: number,
    outMat4: Matrix4,
  ) {
    start.quaternion.setFromRotationMatrix(mat4.extractRotation(startMat4));
    end.quaternion.setFromRotationMatrix(mat4.extractRotation(endMat4));
    interpolated.quaternion.slerpQuaternions(
      start.quaternion,
      end.quaternion,
      progress,
    );
    interpolated.position.lerpVectors(
      start.position.setFromMatrixColumn(startMat4, 3),
      end.position.setFromMatrixColumn(endMat4, 3),
      progress,
    );
    interpolated.scale.lerpVectors(
      start.scale.setFromMatrixScale(startMat4),
      end.scale.setFromMatrixScale(endMat4),
      progress,
    );
    return outMat4.compose(
      interpolated.position,
      interpolated.quaternion,
      interpolated.scale,
    );
  };
})();

export const squareDistanceBetween = (function () {
  const posA = new Vector3();
  const posB = new Vector3();
  return function (objA: Object3D, objB: Object3D) {
    objA.updateMatrices();
    objB.updateMatrices();
    posA.setFromMatrixColumn(objA.matrixWorld, 3);
    posB.setFromMatrixColumn(objB.matrixWorld, 3);
    return posA.distanceToSquared(posB);
  };
})();

export function isAlmostUniformVector3(v: Vector3, epsilonHalf = 0.005) {
  return Math.abs(v.x - v.y) < epsilonHalf && Math.abs(v.x - v.z) < epsilonHalf;
}
export function almostEqual(a: number, b: number, epsilon = 0.01) {
  return Math.abs(a - b) < epsilon;
}

export const affixToWorldUp = (function () {
  const inRotationMat4 = new Matrix4();
  const inForward = new Vector3();
  const outForward = new Vector3();
  const outSide = new Vector3();
  const worldUp = new Vector3(); // Could be called "outUp"
  const v = new Vector3();
  const inMat4Copy = new Matrix4();
  return function affixToWorldUp(inMat4: Matrix4, outMat4: Matrix4) {
    inRotationMat4.identity().extractRotation(inMat4Copy.copy(inMat4));
    inForward.setFromMatrixColumn(inRotationMat4, 2).multiplyScalar(-1);
    outForward
      .copy(inForward)
      .sub(v.copy(inForward).projectOnVector(worldUp.set(0, 1, 0)))
      .normalize();
    outSide.crossVectors(outForward, worldUp);
    outMat4.makeBasis(outSide, worldUp, outForward.multiplyScalar(-1));
    outMat4.scale(v.setFromMatrixScale(inMat4Copy));
    outMat4.setPosition(v.setFromMatrixColumn(inMat4Copy, 3));
    return outMat4;
  };
})();

export const calculateCameraTransformForWaypoint = (function () {
  const upAffixedCameraTransform = new Matrix4();
  const upAffixedWaypointTransform = new Matrix4();
  const detachFromWorldUp = new Matrix4();
  return function calculateCameraTransformForWaypoint(
    cameraTransform: Matrix4,
    waypointTransform: Matrix4,
    outMat4: Matrix4,
  ) {
    affixToWorldUp(cameraTransform, upAffixedCameraTransform);
    detachFromWorldUp
      .copy(upAffixedCameraTransform)
      .invert()
      .multiply(cameraTransform);
    affixToWorldUp(waypointTransform, upAffixedWaypointTransform);
    outMat4.copy(upAffixedWaypointTransform).multiply(detachFromWorldUp);
  };
})();

export const calculateViewingDistance = (function () {
  return function calculateViewingDistance(
    fov: number,
    aspect: number,
    box: Box3,
    center: Vector3,
    vrMode: boolean,
  ) {
    const halfYExtents = Math.max(
      Math.abs(box.max.y - center.y),
      Math.abs(center.y - box.min.y),
    );
    const halfXExtents = Math.max(
      Math.abs(box.max.x - center.x),
      Math.abs(center.x - box.min.x),
    );
    const halfVertFOV = MathUtils.degToRad(fov / 2);
    const halfHorFOV =
      Math.atan(Math.tan(halfVertFOV) * aspect) * (vrMode ? 0.5 : 1);
    const margin = 1.05;
    const length1 = Math.abs((halfYExtents * margin) / Math.tan(halfVertFOV));
    const length2 = Math.abs((halfXExtents * margin) / Math.tan(halfHorFOV));
    const length3 = Math.abs(box.max.z - center.z) + Math.max(length1, length2);
    const length = vrMode ? Math.max(0.25, length3) : length3;
    return length || 1.25;
  };
})();

export const rotateInPlaceAroundWorldUp = (function () {
  const inMat4Copy = new Matrix4();
  const startRotation = new Matrix4();
  const endRotation = new Matrix4();
  const v = new Vector3();
  return function rotateInPlaceAroundWorldUp(
    inMat4: Matrix4,
    theta: number,
    outMat4: Matrix4,
  ) {
    inMat4Copy.copy(inMat4);
    return outMat4
      .copy(
        endRotation
          .makeRotationY(theta)
          .multiply(startRotation.extractRotation(inMat4Copy)),
      )
      .scale(v.setFromMatrixScale(inMat4Copy))
      .setPosition(v.setFromMatrixPosition(inMat4Copy));
  };
})();

export const childMatch = (function () {
  const inverseParentWorld = new Matrix4();
  const childRelativeToParent = new Matrix4();
  const childInverse = new Matrix4();
  const newParentMatrix = new Matrix4();
  // transform the parent such that its child matches the target
  return function childMatch(
    parent: Object3D,
    child: Object3D,
    target: Matrix4,
  ) {
    parent.updateMatrices();
    inverseParentWorld.copy(parent.matrixWorld).invert();
    child.updateMatrices();
    childRelativeToParent.multiplyMatrices(
      inverseParentWorld,
      child.matrixWorld,
    );
    childInverse.copy(childRelativeToParent).invert();
    newParentMatrix.multiplyMatrices(target, childInverse);
    setMatrixWorld(parent, newParentMatrix);
  };
})();

export function createPlaneBufferGeometry(
  width?: number,
  height?: number,
  widthSegments?: number,
  heightSegments?: number,
  flipY = true,
) {
  const geometry = new PlaneGeometry(
    width,
    height,
    widthSegments,
    heightSegments,
  );
  // js seems to assume texture flipY is true for all its built in geometry
  // but we turn this off on our texture loader since createImageBitmap in Firefox
  // does not support flipping. Then we flip the uv for flipY = false texture.
  if (flipY === false) {
    const uv = geometry.getAttribute('uv');
    for (let i = 0; i < uv.count; i++) {
      uv.setY(i, 1.0 - uv.getY(i));
    }
  }
  return geometry;
}

// This code is from three-vrm. We will likely be using that in the future and this inlined code can go away
function excludeTriangles(
  triangles: TypedArray,
  bws: [number, number, number, number][],
  skinIndex: [number, number, number, number][],
  exclude: number[],
) {
  let count = 0;
  if (bws != null && bws.length > 0) {
    for (let i = 0; i < triangles.length; i += 3) {
      const a = triangles[i];
      const b = triangles[i + 1];
      const c = triangles[i + 2];
      const bw0 = bws[a];
      const skin0 = skinIndex[a];

      if (bw0[0] > 0 && exclude.includes(skin0[0])) continue;
      if (bw0[1] > 0 && exclude.includes(skin0[1])) continue;
      if (bw0[2] > 0 && exclude.includes(skin0[2])) continue;
      if (bw0[3] > 0 && exclude.includes(skin0[3])) continue;

      const bw1 = bws[b];
      const skin1 = skinIndex[b];
      if (bw1[0] > 0 && exclude.includes(skin1[0])) continue;
      if (bw1[1] > 0 && exclude.includes(skin1[1])) continue;
      if (bw1[2] > 0 && exclude.includes(skin1[2])) continue;
      if (bw1[3] > 0 && exclude.includes(skin1[3])) continue;

      const bw2 = bws[c];
      const skin2 = skinIndex[c];
      if (bw2[0] > 0 && exclude.includes(skin2[0])) continue;
      if (bw2[1] > 0 && exclude.includes(skin2[1])) continue;
      if (bw2[2] > 0 && exclude.includes(skin2[2])) continue;
      if (bw2[3] > 0 && exclude.includes(skin2[3])) continue;

      triangles[count++] = a;
      triangles[count++] = b;
      triangles[count++] = c;
    }
  }
  return count;
}

function createErasedMesh(src: SkinnedMesh, erasingBonesIndex: number[]) {
  const dst = new SkinnedMesh(src.geometry.clone(), src.material);
  dst.name = `${src.name}(headless)`;
  dst.frustumCulled = src.frustumCulled;
  dst.layers.set(Layers.CAMERA_LAYER_FIRST_PERSON_ONLY);

  const geometry = dst.geometry;

  const skinIndexAttr = geometry.getAttribute('skinIndex').array;
  const skinIndex: [number, number, number, number][] = [];
  for (let i = 0; i < skinIndexAttr.length; i += 4) {
    skinIndex.push([
      skinIndexAttr[i],
      skinIndexAttr[i + 1],
      skinIndexAttr[i + 2],
      skinIndexAttr[i + 3],
    ]);
  }

  const skinWeightAttr = geometry.getAttribute('skinWeight').array;
  const skinWeight: [number, number, number, number][] = [];
  for (let i = 0; i < skinWeightAttr.length; i += 4) {
    skinWeight.push([
      skinWeightAttr[i],
      skinWeightAttr[i + 1],
      skinWeightAttr[i + 2],
      skinWeightAttr[i + 3],
    ]);
  }

  const index = geometry.getIndex();
  if (!index) {
    throw new Error("The geometry doesn't have an index buffer");
  }
  const oldTriangles = index.array;

  const count = excludeTriangles(
    oldTriangles,
    skinWeight,
    skinIndex,
    erasingBonesIndex,
  );
  const newTriangle = [];
  for (let i = 0; i < count; i++) {
    newTriangle[i] = oldTriangles[i];
  }
  geometry.setIndex(newTriangle);

  if (src.onBeforeRender) {
    dst.onBeforeRender = src.onBeforeRender;
  }

  dst.bind(
    new Skeleton(src.skeleton.bones, src.skeleton.boneInverses),
    new Matrix4(),
  );

  return dst;
}

function isEraseTarget(bone: Bone): boolean {
  return (
    bone.name === 'Head' ||
    (bone.parent ? isEraseTarget(bone.parent as Bone) : false)
  );
}

export function createHeadlessModelForSkinnedMesh(mesh: SkinnedMesh) {
  const eraseBoneIndexes: number[] = [];
  mesh.skeleton.bones.forEach((bone, index) => {
    if (isEraseTarget(bone)) eraseBoneIndexes.push(index);
  });

  if (!eraseBoneIndexes.length) {
    mesh.layers.enable(Layers.CAMERA_LAYER_THIRD_PERSON_ONLY);
    mesh.layers.enable(Layers.CAMERA_LAYER_FIRST_PERSON_ONLY);
    return;
  }

  mesh.layers.set(Layers.CAMERA_LAYER_THIRD_PERSON_ONLY);

  return createErasedMesh(mesh, eraseBoneIndexes);
}

export const isFacingCamera = (function () {
  const objWorldDir = new Vector3();
  const objWorld = new Vector3();
  const camWorld = new Vector3();
  return function isFacingCamera(obj: Object3D) {
    const playerCamera =
      AFRAME.scenes[0].systems['hubs-systems'].cameraSystem.viewingCamera;
    playerCamera.getWorldPosition(camWorld);
    obj.getWorldPosition(objWorld);
    obj.getWorldDirection(objWorldDir);
    return objWorldDir.dot(objWorld.sub(camWorld)) < 0;
  };
})();

export function findAncestor(
  obj: Object3D,
  predicate: (obj: Object3D) => boolean,
) {
  let ancestor = obj;
  while (ancestor) {
    if (predicate(ancestor)) return ancestor;
    if (!ancestor.parent) return null;

    ancestor = ancestor.parent;
  }
  return null;
}

export function findAncestors(
  obj: Object3D,
  predicate: (obj: Object3D) => boolean,
) {
  const ancestors = [];
  let ancestor = obj;
  while (ancestor) {
    if (predicate(ancestor)) ancestors.push(ancestor);
    if (!ancestor.parent) return ancestors;
    ancestor = ancestor.parent;
  }
  return ancestors;
}

export function traverseSome(obj: Object3D, fn: (obj: Object3D) => boolean) {
  const shouldContinue = fn(obj);
  if (shouldContinue) {
    for (let i = 0; i < obj.children.length; i++) {
      traverseSome(obj.children[i], fn);
    }
  }
}

// Finds meshes in list of Object3Ds and runs bounding box calculations on them.
const expandbyObjects = (
  box: Box3,
  objects: Object3D[],
  onlyVisible = true,
  precise = true,
) => {
  objects.forEach((obj) => {
    if ((onlyVisible && !obj.visible) || !(obj instanceof Mesh)) return;
    expandByObject(box, obj, onlyVisible, precise);
  });
};

// HACK the bounding boxes
const expandByObject = <T extends Mesh>(
  box: Box3,
  object: T,
  onlyVisible = true,
  precise = false,
) => {
  // Computes the world-axis-aligned bounding box of an object (including its children),
  // accounting for both the object's, and children's, world transforms

  const _box = new Box3();
  const _vector = new Vector3();

  object.updateWorldMatrix(false, false);

  if (!(object instanceof BufferGeometry)) {
    const geometry = object.geometry;

    if (
      precise &&
      geometry.attributes !== undefined &&
      geometry.attributes.position !== undefined
    ) {
      const position = geometry.attributes.position;
      for (let i = 0, l = position.count; i < l; i++) {
        _vector
          .fromBufferAttribute(position, i)
          .applyMatrix4(object.matrixWorld);
        box.expandByPoint(_vector);
      }
    } else {
      if (geometry.boundingBox === null) {
        geometry.computeBoundingBox();
      }

      _box.copy(geometry.boundingBox!);
      _box.applyMatrix4(object.matrixWorld);

      box.union(_box);
    }

    return expandbyObjects(box, object.children, onlyVisible, precise);
  }

  object.computeBoundingBox();

  _box.copy(object.boundingBox!);
  _box.applyMatrix4(object.matrixWorld);

  box.union(_box);

  expandbyObjects(box, object.children, onlyVisible, precise);
};

export function setFromObject<T extends Mesh>(
  box: Box3,
  object: T,
  onlyVisible = true,
  precise = false,
) {
  box.makeEmpty();
  expandByObject(box, object, onlyVisible, precise);
}

const videoGeometry = createPlaneBufferGeometry(1, 1, 1, 1, TEXTURES_FLIP_Y);
const previewMaterial = new MeshBasicMaterial();
previewMaterial.side = DoubleSide;
previewMaterial.transparent = true;
previewMaterial.opacity = 0.5;
Object3D.prototype._clone = Object3D.prototype.clone;
// Object3D.prototype.clone = function () {
//   if (this.type === 'Audio') {
//     console.log('Audio clone not supported');
//     return new Object3D();
//   } else if (hasComponent(window.APP.world, this.eid, MediaVideo)) {
//     const videoMesh = new Mesh(videoGeometry, previewMaterial);
//     videoMesh.material.map =
//       this instanceof Mesh ? this.material.map : undefined;
//     videoMesh.material.needsUpdate = true;
//     // Preview mesh UVs are set to accommodate textureLoader default, but video textures don't match this
//     const aspectRatio = MediaVideo.ratio[this.eid];
//     videoMesh.scale.setY(
//       TEXTURES_FLIP_Y !== videoMesh.material.map?.flipY
//         ? -aspectRatio
//         : aspectRatio,
//     );
//     videoMesh.matrixNeedsUpdate = true;

//     for (let i = 0; i < this.children.length; i++) {
//       const child = this.children[i];
//       videoMesh.add(child.clone());
//     }

//     return videoMesh;
//   } else if (this.type === 'Group') {
//     const group = new Group().copy(this, false);
//     for (let i = 0; i < this.children.length; i++) {
//       const child = this.children[i];
//       // Troika text material crashes when cloning: https://github.com/protectwise/troika/issues/248
//       // Ignoring for now...
//       if (child instanceof Text) {
//         group.add(new Object3D());
//       } else {
//         group.add(child.clone());
//       }
//     }
//     return group;
//   } else {
//     return this._clone();
//   }
// };

export function matNear(a: Matrix4, b: Matrix4, eps = Number.EPSILON) {
  const te = a.elements;
  const me = b.elements;

  for (let i = 0; i < 16; i++) {
    if (Math.abs(te[i] - me[i]) >= eps) return false;
  }

  return true;
}
