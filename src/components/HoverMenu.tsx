import { useRef, useState } from 'react';
import {
  CapsuleGeometry,
  Color,
  DoubleSide,
  FrontSide,
  Mesh,
  MeshBasicMaterial,
  type Group,
} from 'three';
import { DEG2RAD, RAD2DEG } from 'three/src/math/MathUtils.js';
import { Text } from '@react-three/drei';
import type { ThreeEvent } from '@react-three/fiber';
import { getRouteApi } from '@tanstack/react-router';

export interface HoverMenuProps {
  isFlat?: boolean;
  dim?: boolean;
  withPermission?: string;
  waypointName?: string;
}

export default function HoverMenu({
  isFlat = true,
  dim = true,
  waypointName,
}: HoverMenuProps) {
  const [hovering, setHovering] = useState(false);
  const group = useRef<Group>(null);
  const mat = useRef<MeshBasicMaterial>(null);
  const button = useRef<Mesh<CapsuleGeometry, MeshBasicMaterial>>(null);
  const buttonMat = useRef<MeshBasicMaterial>(null);
  const routeAPI = getRouteApi('/$hubId');
  const navigate = routeAPI.useNavigate();
  return (
    <group ref={group} position={[0, 1, -5]}>
      <mesh
        scale={[1.6, 0.9, 1]}
        onPointerEnter={() => {
          if (!mat.current) return;
          mat.current.color.set('blue');

          if (!button.current) return;
          button.current.visible = true;
        }}
        onPointerLeave={() => {
          if (!mat.current) return;
          mat.current.color.set('black');

          if (!button.current) return;
          button.current.visible = false;
        }}
      >
        <planeGeometry />
        <meshBasicMaterial ref={mat} color={'black'} side={DoubleSide} />
        <mesh
          position={[0, -0.25, 0.001]}
          scale={[0.2, 0.1, 0.01]}
          rotation-z={DEG2RAD * 90}
          ref={button}
          onPointerEnter={() => {
            if (!buttonMat.current) return;
            buttonMat.current.color.set('pink');
          }}
          onPointerLeave={() => {
            if (!buttonMat.current) return;
            buttonMat.current.color.set('red');
          }}
          onPointerDown={(e: ThreeEvent<PointerEvent>) => {
            if (!buttonMat.current) return;
            if (e.nativeEvent.button !== 0) return;
            buttonMat.current.color.set('orange');
            if (!waypointName) return;

            navigate({
              to: '/$hubId',
              search: (prev) => ({ ...prev, waypoint: waypointName }),
            });
          }}
          onPointerUp={(e: ThreeEvent<PointerEvent>) => {
            if (!buttonMat.current) return;
            if (e.nativeEvent.button !== 0) return;
            buttonMat.current.color.set('pink');
          }}
        >
          <capsuleGeometry args={[0.6, 3, 10, 10, 1]} />
          <meshBasicMaterial color={'red'} ref={buttonMat} />
          <Text
            color="white"
            anchorX="center"
            anchorY="middle"
            rotation-z={DEG2RAD * -90}
            fontSize={0.8}
            position-z={1}
          >
            go to
          </Text>
        </mesh>
      </mesh>
    </group>
  );
}
