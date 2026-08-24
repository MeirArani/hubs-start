import { SceneContext } from '#/core/Scene';
import { useFrame } from '@react-three/fiber';
import { useContext, useEffect, useRef } from 'react';
import {
  DoubleSide,
  Intersection,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  Vector3,
} from 'three';

export type TransformMode = 'axis' | 'puppet' | 'cursor' | 'align' | 'scale';

const StepLength = Math.PI / 10;
const CameraWorldQuaternion = new Quaternion();
const CameraWorldPosition = new Vector3();
const TargetWorldQuaternion = new Quaternion();
const v = new Vector3();
const v2 = new Vector3();
const q = new Quaternion();
const q2 = new Quaternion();

const epsilon = 0.001;
function qAlmostEquals(a: Quaternion, b: Quaternion) {
  return (
    Math.abs(a.x - b.x) < epsilon &&
    Math.abs(a.y - b.y) < epsilon &&
    Math.abs(a.z - b.z) < epsilon &&
    Math.abs(a.w - b.w) < epsilon
  );
}

export interface TransformSelectedObjectProps {}

export function TransformSelectedObject({}: TransformSelectedObjectProps) {
  const target = useRef<Object3D>(null);
  const mode = useRef<TransformMode>(null);
  const transforming = useRef(false);
  const axis = useRef(new Vector3());
  const startQ = useRef(new Quaternion());
  const hand = useRef<Object3D>(null);

  const dxAll = useRef(0);
  const dxStore = useRef(0);
  const dxApplied = useRef(0);
  const dyAll = useRef(0);
  const dyStore = useRef(0);
  const dyApplied = useRef(0);
  const sign = useRef(1);
  const sign2 = useRef(1);

  const raycasters = { left: new Raycaster(), right: new Raycaster() };
  const puppet = useRef({
    initialControllerOrientation: new Quaternion(),
    initialControllerOrientation_inverse: new Quaternion(),
    initialObjectOrientation: new Quaternion(),
    currentControllerOrientation: new Quaternion(),
    controllerOrientationDelta: new Quaternion(),
  });

  const planarInfo = useRef({
    plane: new Mesh(
      new PlaneGeometry(100000, 100000, 2, 2),
      new MeshBasicMaterial({
        visible: false,
        wireframe: true,
        side: DoubleSide,
        transparent: true,
        opacity: 0.3,
      }),
    ),
    normal: new Vector3(),
    intersections: new Array<Intersection>(),
    previousPointOnPlane: new Vector3(),
    currentPointOnPlane: new Vector3(),
    deltaOnPlane: new Vector3(),
    finalProjectedVec: new Vector3(),
  });

  const scene = useContext(SceneContext);

  function cursorAxisOrScaleTick() {
    const {
      plane,
      normal,
      intersections,
      previousPointOnPlane,
      currentPointOnPlane,
      deltaOnPlane,
      finalProjectedVec,
    } = planarInfo.current;

    target.current?.getWorldPosition(plane.position);

    scene.camera?.getWorldPosition(v);
    plane.matrixNeedsUpdate = true;
    const cameraToPlaneDistance = v.sub(plane.position).length();

    intersections.length = 0;
    // const raycaster = this.hand.el.id === "player-left-controller" ? this.raycasters.left : this.raycasters.right;
    const raycaster = raycasters.left;
    const far = raycaster.far;
    raycaster.far = 1000;
    plane.raycast(raycaster, intersections);
    raycaster.far = far;
    const intersection = intersections[0];
    if (!intersection) return;

    normal.set(0, 0, -1).applyQuaternion(plane.quaternion);

    currentPointOnPlane.copy(intersection.point);
    deltaOnPlane.copy(currentPointOnPlane).sub(previousPointOnPlane);

    // CHECK: Why is this const defined here?
    const Sensitivity = 10;

    finalProjectedVec
      .copy(deltaOnPlane)
      .projectOnPlane(normal)
      .applyQuaternion(q.copy(plane.quaternion).invert())
      .multiplyScalar(Sensitivity / cameraToPlaneDistance);

    if (mode.current === 'cursor') {
      //const modify = !AFRAME.scenes[0].systems.userinput.get(paths.actions.transformModifier);
      const modify = true;

      dyAll.current = dyStore.current + finalProjectedVec.y;
      dyApplied.current = modify
        ? dyAll.current
        : Math.round(dyAll.current / StepLength) * StepLength;
      dyStore.current = dyAll.current - dyApplied.current;

      dxAll.current = dxStore.current + finalProjectedVec.x;
      dxApplied.current = modify
        ? dxAll.current
        : Math.round(dxAll.current / StepLength) * StepLength;
      dxStore.current = dxAll.current - dxApplied.current;

      // CHECK: This is the condition above!
      target.current?.getWorldQuaternion(TargetWorldQuaternion);

      v.set(1, 0, 0).applyQuaternion(
        modify ? CameraWorldQuaternion : TargetWorldQuaternion,
      );
      q.setFromAxisAngle(
        v,
        modify
          ? -dyApplied.current
          : sign2.current * sign.current * dyApplied.current,
      );

      if (modify) {
        v.set(0, 1, 0).applyQuaternion(CameraWorldQuaternion);
      } else {
        v.set(0, 1, 0);
      }
      q2.setFromAxisAngle(v, dxApplied.current);

      target.current?.quaternion.premultiply(q).premultiply(q2);

      if (target.current) target.current.matrixNeedsUpdate = true;
    } else if (mode.current === 'axis') {
      dxAll.current = dxStore.current + finalProjectedVec.x;
      dxApplied.current = Math.round(dxAll.current / StepLength) * StepLength;
      dxStore.current = dxAll.current - dxApplied.current;

      target.current?.quaternion.multiply(
        q.setFromAxisAngle(axis.current, -sign.current * dxApplied.current),
      );
      if (target.current) target.current.matrixNeedsUpdate = true;
    }
    previousPointOnPlane.copy(currentPointOnPlane);
  }

  function puppetingTick() {
    const {
      currentControllerOrientation,
      controllerOrientationDelta,
      initialControllerOrientation_inverse,
      initialObjectOrientation,
    } = puppet.current;

    hand.current?.getWorldQuaternion(currentControllerOrientation);
    controllerOrientationDelta
      .copy(initialControllerOrientation_inverse)
      .premultiply(currentControllerOrientation);
    target.current?.quaternion
      .copy(initialObjectOrientation)
      .premultiply(controllerOrientationDelta)
      .premultiply(controllerOrientationDelta);
    if (target.current) target.current.matrixNeedsUpdate = true;
  }

  useFrame(() => {
    if (!transforming) return;

    // Taken care of by the scale button
    if (mode.current === 'scale') return;

    if (mode.current === 'align') {
      scene.camera?.getWorldPosition(CameraWorldPosition);
      target.current?.lookAt(CameraWorldPosition);
      transforming.current = false;
      return;
    }

    if (mode.current === 'puppet') {
      puppetingTick();
      return;
    }
    cursorAxisOrScaleTick();
  });
}
