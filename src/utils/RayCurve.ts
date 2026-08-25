import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  DynamicDrawUsage,
  Mesh,
  MeshBasicMaterial,
  Vector3,
} from 'three';

const A = new Vector3();
const B = new Vector3();
const C = new Vector3();
const D = new Vector3();

const Up = new Vector3(0, 1, 0);

export class RayCurve extends Mesh<BufferGeometry, MeshBasicMaterial> {
  vertices: Float32Array;
  width: number;
  direction = new Vector3();
  numPoints: number;

  constructor(numPoints: number, width: number) {
    super(
      new BufferGeometry(),
      new MeshBasicMaterial({
        side: DoubleSide,
        toneMapped: false,
        transparent: true,
      }),
    );

    this.vertices = new Float32Array(numPoints * 3 * 6);
    this.width = width;
    this.numPoints = numPoints;

    this.geometry.setAttribute(
      'position',
      new BufferAttribute(this.vertices, 3).setUsage(DynamicDrawUsage),
    );

    this.frustumCulled = false;
  }

  setDirection(direction: Vector3) {
    this.direction
      .copy(direction)
      .cross(Up)
      .normalize()
      .multiplyScalar(this.width / 2);
  }

  setWidth(width: number) {
    this.width = width;
  }

  setPoint(i: number, P: Vector3) {
    let idx = 3 * 6 * i;

    A.copy(P).add(this.direction);
    B.copy(P).sub(this.direction);
    C.set(
      // Previous A
      i === 0 ? A.x : this.vertices[idx - 3],
      i === 0 ? A.y : this.vertices[idx - 2],
      i === 0 ? A.z : this.vertices[idx - 1],
    );

    D.set(
      // Previous B
      i === 0 ? B.x : this.vertices[idx - 6],
      i === 0 ? B.y : this.vertices[idx - 5],
      i === 0 ? B.z : this.vertices[idx - 4],
    );

    //   A---P---B
    //   | \     |
    //   |  \    |
    //   |   \   |
    //   |    \  |
    //   |     \ |
    //   |      \|
    //   C-------D
    //   A'--P'--B' Previous P
    //   | \     |

    this.vertices[idx++] = A.x;
    this.vertices[idx++] = A.y;
    this.vertices[idx++] = A.z;

    this.vertices[idx++] = C.x;
    this.vertices[idx++] = C.y;
    this.vertices[idx++] = C.z;

    this.vertices[idx++] = D.x;
    this.vertices[idx++] = D.y;
    this.vertices[idx++] = D.z;

    this.vertices[idx++] = D.x;
    this.vertices[idx++] = D.y;
    this.vertices[idx++] = D.z;

    this.vertices[idx++] = B.x;
    this.vertices[idx++] = B.y;
    this.vertices[idx++] = B.z;

    this.vertices[idx++] = A.x;
    this.vertices[idx++] = A.y;
    this.vertices[idx++] = A.z;

    this.geometry.attributes.position.needsUpdate = true;
  }
}
