import { getRouteApi } from '@tanstack/react-router';

import { useGLTF } from '@react-three/drei';
import type { GLTF } from 'three-stdlib';
import type { Events, ThreeElements, ThreeEvent } from '@react-three/fiber';
import {
  Mesh,
  Sprite as ThreeSprite,
  type Group,
  type MeshStandardMaterial,
} from 'three';
import { useKeys } from '#/input/UserInput.client';
import { off } from 'process';
import Sprite from './Sprite';
import { useRef, useState } from 'react';

type GLTFResult = GLTF & {
  nodes: {
    icon_spawnPoint: Mesh;
  };
  materials: {
    icon_spawnpointMat: MeshStandardMaterial;
  };
};

type GroupProps = ThreeElements['group'];

export interface WaypointProps extends GroupProps {
  name: string;
  clickable?: boolean;
  isSpawnPoint?: boolean;
  canBeOccupied?: boolean;
  disableMotion?: boolean;
  disableTeleporting?: boolean;
  snapToFloorPlan?: boolean;
  initialOrientation?: boolean;
}

// Hold space: Symbol appears
// Cursor over: Model appears (if maintain orientation is set)
//

export default function Waypoint({
  name,
  clickable = false,
  isSpawnPoint = false,
  canBeOccupied = false,
  disableMotion = false,
  disableTeleporting = false,
  snapToFloorPlan = false,
  initialOrientation = false,
  ...rest
}: WaypointProps) {
  const routeAPI = getRouteApi('/$hubId');
  const spriteButton = useRef<ThreeSprite>(null);
  const waypointModel = useRef<Mesh>(null);
  const [modelHovered, setModelHovered] = useState(false);
  const [buttonActive, setButtonActive] = useState(false);
  const { waypoint } = routeAPI.useSearch();

  if (waypoint === name) {
    // do waypoint stuff.
  }

  let lastInput = false;
  useKeys(({ space }) => {
    if (!spriteButton.current) return;
    if (space && !lastInput) {
      setButtonActive(true);
    } else if (!space && lastInput) {
      setButtonActive(false);
      if (modelHovered) setModelHovered(false);
    }
    lastInput = space;
  });

  const { nodes, materials } = useGLTF(
    '/spawn-point.glb',
  ) as unknown as GLTFResult;
  return (
    <>
      <group {...rest} dispose={null}>
        <mesh
          ref={waypointModel}
          visible={modelHovered}
          name="icon_spawnPoint"
          castShadow
          receiveShadow
          geometry={nodes.icon_spawnPoint.geometry}
          material={materials.icon_spawnpointMat}
        />
      </group>
      <Sprite
        ref={spriteButton}
        position={[0, 1.6, 0]}
        visible={buttonActive}
        onPointerMove={(e: ThreeEvent<'onPointerMove'>) => {
          // TODO: Check all intersections
          // Or find a more sane way to handle hovering on icon that's just been made visible
          if (
            !modelHovered &&
            e.intersections[0].object === spriteButton.current
          )
            setModelHovered(true);
        }}
        onPointerEnter={(e: ThreeEvent<'onPointerEnter'>) => {
          console.log(e.intersections[0].object === spriteButton.current);
          setModelHovered(true);
        }}
        onPointerLeave={() => {
          setModelHovered(false);
        }}
      />
    </>
  );
}

useGLTF.preload('/spawn-point.glb');
