import { Quaternion, Vector3, type Object3D } from 'three';

// CHECK can these exist outside the function? (Multithreading etc)
const opq = new Quaternion();
const owq = new Quaternion();
const oq = new Quaternion();
const pq = new Quaternion();
const yq = new Quaternion();
const q = new Quaternion();
const right = new Vector3();
const v = new Vector3();
const UP = new Vector3(0, 1, 0);

function rotatePitchAndYaw(obj: Object3D, pitch: number, yaw: number) {
  obj.parent?.updateMatrices();
  obj.updateMatrices();
  obj.parent?.getWorldQuaternion(opq);
  obj.getWorldQuaternion(owq);
  oq.copy(obj.quaternion);
  v.set(0, 1, 0).applyQuaternion(oq);
  const initialUpDot = v.dot(UP);
  v.set(0, 0, 1).applyQuaternion(oq);
  const initialForwardDotUp = Math.abs(v.dot(UP));
  right.set(1, 0, 0).applyQuaternion(owq);
  pq.setFromAxisAngle(right, pitch);
  yq.setFromAxisAngle(UP, yaw);

  q.copy(owq).premultiply(pq).premultiply(yq).premultiply(opq.invert());
  v.set(0, 1, 0).applyQuaternion(q);
  const newUpDot = v.dot(UP);
  v.set(0, 0, 1).applyQuaternion(q);
  const newForwardDotUp = Math.abs(v.dot(UP));
  // Ensure our pitch is in an accepted range and our head would not be flipped upside down
  if (
    (newForwardDotUp > 0.9 && newForwardDotUp > initialForwardDotUp) ||
    (newUpDot < 0 && newUpDot < initialUpDot)
  ) {
    // TODO: Apply a partial rotation that does not exceed the bounds for nicer UX
    return;
  } else {
    obj.quaternion.copy(q);
    obj.matrixNeedsUpdate = true;
    obj.updateMatrices();
  }
}

export interface CameraControlsProps {}
export default function CameraControls({}: CameraControlsProps) {}
