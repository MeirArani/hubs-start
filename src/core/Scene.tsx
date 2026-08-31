import PlayerController from '#/components/PlayerController';
import { Gltf, useGLTF } from '@react-three/drei';
import { Group, PerspectiveCamera } from 'three';
import {
  createContext,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  PerspectiveCamera as ThreePerspectiveCamera,
  type Mesh,
  type Object3D,
} from 'three';
import { Pathfinding } from 'three-pathfinding';
import { useMouse } from '#/input/UserInput.client';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three-stdlib';
import hubsTest from '#/assets/models/hubsTest.glb';
import { SpawnPoint } from '#/assets/prefabs/spawn-point';
import Waypoint from '#/components/Waypoint';
import Sprite from '#/components/Sprite';

export interface SceneProps {
  children?: ReactNode;
}

export interface SceneContext {
  src?: string;
  nodes?: Record<string, Object3D>;
  nav?: { mesh: Mesh; pathfinder: Pathfinding };
  camera?: RefObject<ThreePerspectiveCamera | null>;
}
export const SceneContext = createContext<SceneContext>({});

// TODO: Fix scene camera logic & injection into player model

export default function Scene({ children }: SceneProps) {
  const { nodes, scene } = useGLTF('/hubsTest.glb');
  const pathfinder = new Pathfinding();
  const navMesh = nodes.navMesh as Mesh;
  const geometry = navMesh.geometry.clone();
  navMesh.updateMatrix();
  geometry.applyMatrix4(navMesh.matrixWorld);

  pathfinder.setZoneData('character', Pathfinding.createZone(geometry));

  return (
    <>
      <SceneContext
        value={{
          src: '/testWorld.bin',
          nodes: nodes,
          nav: { mesh: navMesh, pathfinder: pathfinder },
        }}
      >
        <PlayerController />
        {children}
        <Waypoint name="wayPoint" />
        <primitive object={scene} />
      </SceneContext>
    </>
  );
}
