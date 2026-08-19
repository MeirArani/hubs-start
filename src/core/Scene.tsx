import { Gltf, useGLTF } from '@react-three/drei';
import { createContext, type ReactNode } from 'react';
import type { Material, Mesh, Object3D } from 'three';
import { Pathfinding } from 'three-pathfinding';

export interface SceneProps {
  children?: ReactNode;
}

export interface SceneContext {
  src?: string;
  scene?: Record<string, Object3D>;
  nav?: { mesh: Mesh; pathfinder: Pathfinding };
}
export const SceneContext = createContext<SceneContext>({});

function getHubsComponents(node: any) {
  const hubsComponents =
    node.userData.gltfExtensions?.MOZ_hubs_components ||
    node.userData.gltfExtensions?.HUBS_components;
  return hubsComponents;
}

export default function Scene({ children }: SceneProps) {
  const { nodes, materials, animations } = useGLTF('/testWorld.bin');
  const hubsComponents =
    nodes.navMesh.userData.gltfExtensions.MOZ_hubs_components ||
    nodes.navMesh.userData.gltfExtensions?.HUBS_components;

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
          scene: nodes,
          nav: { mesh: navMesh, pathfinder: pathfinder },
        }}
      >
        {children}
        <Gltf src="/testWorld.bin" />
      </SceneContext>
    </>
  );
}
