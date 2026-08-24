import { UseMouse } from '#/input/UserInput.client';
import { store } from '#/store/store';
import { Layers } from '#/utils/camera-layers';
import { getLastWorldPosition } from '#/utils/three-utils';
import { Box } from '@react-three/drei';
import { useSelector } from '@tanstack/react-store';
import { useEffect, useRef, useState, type RefObject } from 'react';
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Line,
  LineBasicMaterial,
  Mesh,
  Object3D,
  PerspectiveCamera,
  Raycaster,
  ShaderMaterial,
  Vector3,
  type Intersection,
} from 'three';

export interface CursorProps {
  camera: RefObject<PerspectiveCamera | null>;
  far?: number;
  near?: number;
  minDistance?: number;
  defaultDistance?: number;
}

export function findRemoteHoverTarget() {}

const Highlight = new Color(23 / 255, 64 / 255, 118 / 255);
const NoHighlight = new Color(190 / 255, 190 / 255, 190 / 255);
const TransformColor1 = new Color(150 / 255, 80 / 255, 150 / 255);
const TransformColor2 = new Color(23 / 255, 64 / 255, 118 / 255);

const vertexShader = `
          varying vec2 vPos;
          void main() {
            vPos = position.xy;

            vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );

            vec2 scale = vec2(
              length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) ),
              length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) )
            );

            float distance = -mvPosition.z;
            scale *= distance; // negates projection scale
            scale += min(1.0/distance, 0.3); // scale in screen space

            float radius = 0.02;
            mvPosition.xy += position.xy * radius * scale;
            gl_Position = projectionMatrix * mvPosition;
          }`;
const fragmentShader = `
          uniform vec3 color;
          varying vec2 vPos;

          void main() {
            float distance = length(vPos);
            if (distance > 0.5) {
                discard;
            }

            gl_FragColor = vec4(
              mix(color, vec3(0.0), step(0.35, distance)),
              0.8
            );

            #include <colorspace_fragment>
          }`;

export default function Cursor({
  camera,
  far = 100,
  near = 0.01,
  minDistance = 0.18,
  defaultDistance = 4,
}: CursorProps) {
  const cursor = useRef<Mesh<BufferGeometry, ShaderMaterial>>(null);

  const [enabled, setEnabled] = useState(true);
  const distance = useRef(0);
  const intersection = useRef<Intersection>(null);
  const raycaster = useRef<Raycaster>(new Raycaster());
  const color = useRef<Color>(new Color());
  const line = useRef<Line<BufferGeometry, LineBasicMaterial>>(null);

  const cursorScale = useSelector(
    store,
    (store) => store.preferences.cursorSize,
  );

  // cursor.current.layers.set(Layers.CAMERA_LAYER_UI);
  // cursor.current.layers.enable(Layers.CAMERA_LAYER_FX_MASK);
  color.current = cursor.current?.material.uniforms.color.value;

  intersection.current = null;
  raycaster.current = new Raycaster();
  raycaster.current.firstHitOnly = true;
  distance.current = far;

  const lineGeometry = new BufferGeometry();
  lineGeometry.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(2 * 3), 3),
  );
  line.current = new Line(
    lineGeometry,
    new LineBasicMaterial({
      color: 'white',
      opacity: 0.2,
      transparent: true,
      visible: true,
    }),
  );
  // this.el.setObject3D("line", this.line);

  const rawIntersections: Intersection[] = [];
  const cameraPos = new Vector3();
  const v = new Vector3();
  let ran = false;
  UseMouse((mouse) => {
    if (!cursor.current) return;
    if (!camera.current) return;
    if (!ran) {
      ran = true;
      console.log(`Cusor @ ${performance.now()}`);
    }

    const hideLine = false;

    cursor.current.visible = enabled && !!mouse.cursorPose;
    if (line.current) line.current.visible = !!(enabled && !hideLine);

    intersection.current = null;

    if (!enabled || !mouse.cursorPose) return;

    camera.current.updateMatrix();
    const playerScale = v
      .setFromMatrixColumn(camera.current.matrixWorld, 1)
      .length();
    raycaster.current.far = far * playerScale;
    raycaster.current.near = near * playerScale;

    const isGrabbing = false;
    let isHoveringSomething = false;
    if (!isGrabbing) {
      rawIntersections.length = 0;
      raycaster.current.ray.origin = mouse.cursorPose.position;
      raycaster.current.ray.direction = mouse.cursorPose.direction;

      // TODO: Add cursorTargetingSystem targets
      // raycaster.current.intersectObjects([], true, rawIntersections);
      // intersection.current = rawIntersections[0];

      // const remoteHoverTarget = intersection.current && findRemoteHoverTarget();

      distance.current = defaultDistance * playerScale;
    }

    // const cursorModDelta = 0;
    cursor.current.position
      .copy(mouse.cursorPose.position)
      .addScaledVector(mouse.cursorPose.direction, distance.current);
    getLastWorldPosition(camera.current, cameraPos);
    cameraPos.y = cursor.current.position.y;
    cursor.current.lookAt(cameraPos);
    cursor.current.matrixNeedsUpdate = true;

    color.current = isGrabbing || isHoveringSomething ? Highlight : NoHighlight;

    if (!line.current?.material.visible) return;

    const posePosition = mouse.cursorPose.position;
    const cursorPosition = cursor.current.position;
    const positionArray = line.current?.geometry.attributes['position'].array;
    if (!positionArray) return;

    positionArray[0] = posePosition.x;
    positionArray[1] = posePosition.y;
    positionArray[2] = posePosition.z;
    positionArray[3] = cursorPosition.x;
    positionArray[4] = cursorPosition.y;
    positionArray[5] = cursorPosition.z;

    if (line.current?.geometry.attributes['position'])
      line.current.geometry.attributes['position'].needsUpdate = true;
    line.current?.geometry.computeBoundingSphere();
  });

  cursor.current?.position.set(
    camera.current?.position.x || 0,
    camera.current?.position.y || 0,
    camera.current?.position.z || 0,
  );
  return (
    <>
      <mesh ref={cursor} scale={0.6} renderOrder={3}>
        <sphereGeometry />
        <shaderMaterial
          depthTest={false}
          transparent
          uniforms={{ color: { value: new Color(color.current) } }}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
        />
      </mesh>
    </>
  );
}
