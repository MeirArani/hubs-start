import { useMouse } from '#/input/UserInput.client';
import { store } from '#/store/store';
import { Layers } from '#/utils/camera-layers';
import { getLastWorldPosition } from '#/utils/three-utils';
import { Box } from '@react-three/drei';
import { extend, ReactThreeFiber, useThree } from '@react-three/fiber';
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

extend({ threeLine: Line });

export interface CursorProps {
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
  far = 100,
  near = 0.01,
  minDistance = 0.18,
  defaultDistance = 4,
}: CursorProps) {
  const cursor = useRef<Mesh<BufferGeometry, ShaderMaterial>>(null);

  const [enabled, setEnabled] = useState(true);
  let distance = far;
  const intersection = useRef<Intersection>(null);
  const raycaster = new Raycaster();
  const color = new Color();
  const line = useRef<Line<BufferGeometry, LineBasicMaterial>>(null);

  useEffect(() => {
    color.set(cursor.current?.material.uniforms.color.value);
  });

  // const cursorScale = useSelector(
  //   store,
  //   (store) => store.preferences.cursorSize,
  // );

  // cursor.current.layers.set(Layers.CAMERA_LAYER_UI);
  // cursor.current.layers.enable(Layers.CAMERA_LAYER_FX_MASK);

  intersection.current = null;
  raycaster.firstHitOnly = true;
  const rawIntersections: Intersection[] = [];
  const cameraPos = new Vector3();
  const v = new Vector3();
  const hideLine = false;

  const playerScale = 1;
  // const playerScale = v
  // .setFromMatrixColumn(state.camera.matrixWorld, 1)
  // .length();
  raycaster.far = far * playerScale;
  raycaster.near = near * playerScale;
  let isGrabbing = false;
  let isHoveringSomething = false;
  useMouse((mouse, state, delta) => {
    if (!cursor.current) return;

    cursor.current.visible = enabled && !!mouse.cursorPose;

    if (!enabled || !mouse.cursorPose) return;

    if (!isGrabbing) {
      rawIntersections.length = 0;
      raycaster.ray.origin = mouse.cursorPose.position;
      raycaster.ray.direction = mouse.cursorPose.direction;

      // TODO: Add cursorTargetingSystem targets
      // raycaster.intersectObjects([], true, rawIntersections);
      // intersection.current = rawIntersections[0];

      // const remoteHoverTarget = intersection.current && findRemoteHoverTarget();

      distance = defaultDistance * playerScale;
    }

    // const cursorModDelta = 0;
    cursor.current.position
      .copy(mouse.cursorPose.position)
      .addScaledVector(mouse.cursorPose.direction, distance);
    getLastWorldPosition(state.camera, cameraPos);
    cameraPos.y = cursor.current.position.y;
    cursor.current.lookAt(cameraPos);
    cursor.current.matrixNeedsUpdate = true;

    color.set(isGrabbing || isHoveringSomething ? Highlight : NoHighlight);

    if (!line.current?.material.visible) return;

    const posePosition = mouse.cursorPose.position;
    const cursorPosition = cursor.current.position;
    const positionArray = line.current.geometry.attributes['position'].array;
    if (!positionArray) return;

    positionArray[0] = posePosition.x;
    positionArray[1] = posePosition.y;
    positionArray[2] = posePosition.z;
    positionArray[3] = cursorPosition.x;
    positionArray[4] = cursorPosition.y;
    positionArray[5] = cursorPosition.z;

    line.current.geometry.attributes['position'].needsUpdate = true;
    line.current.geometry.computeBoundingSphere();
  });

  useThree((state) => {
    if (!cursor.current) return;
    state.camera.getWorldPosition(cursor.current.position);
  });
  return (
    <>
      <mesh ref={cursor} scale={0.6} renderOrder={3}>
        <sphereGeometry />
        <shaderMaterial
          depthTest={false}
          transparent
          uniforms={{ color: { value: color } }}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
        />
        {/* <threeLine ref={line}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(2 * 3), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={'white'}
            opacity={0.2}
            transparent
            visible
          />
        </threeLine> */}
      </mesh>
    </>
  );
}
