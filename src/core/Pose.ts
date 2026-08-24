import { Vector3, Quaternion, PerspectiveCamera } from 'three';
const forward = new Vector3(0, 0, -1);

export class Pose {
  position = new Vector3();
  direction = new Vector3();
  orientation = new Quaternion();

  constructor() {}

  fromOriginAndDirection(origin: Vector3, direction: Vector3) {
    this.position = origin;
    this.direction = direction;
    this.orientation = this.orientation.setFromUnitVectors(forward, direction);
    return this;
  }

  fromCameraProjection(
    camera: PerspectiveCamera,
    normalizedX: number,
    normalizedY: number,
  ) {
    this.position.setFromMatrixPosition(camera.matrixWorld);
    this.direction
      .set(normalizedX, normalizedY, 0.5)
      .unproject(camera)
      .sub(this.position)
      .normalize();
    this.fromOriginAndDirection(this.position, this.direction);
    return this;
  }

  copy(pose: Pose) {
    this.position.copy(pose.position);
    this.direction.copy(pose.direction);
    this.orientation.copy(pose.orientation);
  }
}
