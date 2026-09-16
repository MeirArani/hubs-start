import PlayerController from '#/components/PlayerController';
import { useGLTF } from '@react-three/drei';
import {
  createContext,
  useEffect,
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
import { type ThreeEvent } from '@react-three/fiber';
import Waypoint, { type WaypointData } from '#/components/Waypoint';
import HoverMenu from '#/components/HoverMenu';
import { useRoom, useRoomState, useSessionEntity } from '#/routes/$hubId';
import type { Player } from '../../server/src/rooms/schema/HubRoomState';
import { getSchemaInstance } from '@colyseus/react';
import { RemoteAvatar } from '#/components/bitecs/component-defs';
import RemotePlayer from '#/components/RemotePlayer';
import { Callbacks } from '@colyseus/sdk';

export interface SceneProps {
  children?: ReactNode;
  src: string;
}

export interface SceneContext {
  src?: string;
  nodes?: Record<string, Object3D>;
  nav?: { mesh: Mesh; pathfinder: Pathfinding };
  camera?: RefObject<ThreePerspectiveCamera | null>;
}
export const SceneContext = createContext<SceneContext>({});

// const Waypoints: WaypointData[] = [{ name: 'wayPoint', transform: null }];

// TODO: Fix scene camera logic & injection into player model

export default function Scene({ children, src }: SceneProps) {
  const { nodes, scene } = useGLTF(src);
  const pathfinder = new Pathfinding();
  const navMesh = nodes.navMesh as Mesh;
  const geometry = navMesh.geometry.clone();
  navMesh.updateMatrix();
  geometry.applyMatrix4(navMesh.matrixWorld);
  const [waypoint, setWaypoint] = useState<WaypointData>();

  pathfinder.setZoneData('character', Pathfinding.createZone(geometry));

  const { room } = useRoom();
  const me = useRef<string>(null);
  const remotePlayers: string[] = [];

  const playerIDs: string[] = useRoomState(
    (state) => state.playerIds,
  ) as string[];
  playerIDs?.forEach((id) => {
    if (id == room?.sessionId) {
      me.current = id;
    } else {
      remotePlayers.push(id);
    }
  });

  // useEffect(() => {
  //   if (!room) return;
  //   const callbacks = Callbacks.get(room);
  //   callbacks.onAdd('players', (player, sessionId) => {
  //     if (sessionId === room.sessionId) {
  //       me.current = player;
  //       return;
  //     }
  //     setRemotePlayers((prev) => {
  //       prev.push(sessionId);
  //       return prev;
  //     });
  //   });
  // });

  console.log('Re-Render');
  const onWaypointClicked = (
    e: ThreeEvent<'onClick'> | null,
    waypoint: WaypointData,
  ) => {
    // console.log(e);
    setWaypoint(waypoint);
  };

  return (
    <>
      <SceneContext
        value={{
          src: '/testWorld.bin',
          nodes: nodes,
          nav: { mesh: navMesh, pathfinder: pathfinder },
        }}
      >
        <PlayerController
          waypoint={waypoint}
          onWaypointFinished={() => {
            setWaypoint(undefined);
          }}
        />
        {remotePlayers.map((player) => (
          <RemotePlayer sessionId={player} key={player} />
        ))}
        {children}
        <Waypoint
          position={[1, 0, -13]}
          name="wayPoint"
          onSelect={onWaypointClicked}
        />

        <HoverMenu waypointName="wayPoint" />
        <Waypoint
          position={[-1, 0, 13]}
          name="backPoint"
          onSelect={onWaypointClicked}
        />
        <primitive object={scene} />
      </SceneContext>
    </>
  );
}
