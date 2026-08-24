import { Gltf, PerspectiveCamera, useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { createContext, useRef, type ReactNode, type RefObject } from 'react';
import {
  PerspectiveCamera as ThreePerspectiveCamera,
  type Mesh,
  type Object3D,
} from 'three';
import { Pathfinding } from 'three-pathfinding';

export interface SceneProps {
  children?: ReactNode;
  playerCam: RefObject<ThreePerspectiveCamera | null>;
}

export interface SceneContext {
  src?: string;
  scene?: Record<string, Object3D>;
  nav?: { mesh: Mesh; pathfinder: Pathfinding };
  camera?: ThreePerspectiveCamera | null;
}
export const SceneContext = createContext<SceneContext>({});

// TODO: Fix scene camera logic & injection into player model

export default function Scene({ playerCam, children }: SceneProps) {
  const { nodes, materials, animations } = useGLTF('/testWorld.bin');

  const pathfinder = new Pathfinding();
  const navMesh = nodes.navMesh as Mesh;
  const geometry = navMesh.geometry.clone();
  navMesh.updateMatrix();
  geometry.applyMatrix4(navMesh.matrixWorld);

  pathfinder.setZoneData('character', Pathfinding.createZone(geometry));
  console.log(playerCam.current);
  return (
    <>
      <SceneContext
        value={{
          src: '/testWorld.bin',
          scene: nodes,
          nav: { mesh: navMesh, pathfinder: pathfinder },
          camera: playerCam.current,
        }}
      >
        {children}
        <Gltf src="/testWorld.bin" />
      </SceneContext>
    </>
  );
}
