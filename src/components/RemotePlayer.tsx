import { useRoom, useRoomMessage, useRoomState } from '#/routes/$hubId';
import { Callbacks } from '@colyseus/sdk';
import { useEffect, useRef } from 'react';
import { Quaternion, Vector3, type Mesh } from 'three';

export interface RemotePlayerProps {
  sessionId: string;
}

export default function RemotePlayer({ sessionId }: RemotePlayerProps) {
  const mesh = useRef<Mesh>(null);
  const { room } = useRoom();
  useEffect(() => {
    if (!room) return;
    room.onStateChange((state) => {
      const player = state.players.get(sessionId);
      if (!player) return;
      if (!mesh.current) return;
      const newMove = new Vector3(player.x, player.y + 1.6, player.z);
      mesh.current.position.lerp(newMove, 0.5);
    });
  }, [room]);
  return (
    <>
      <mesh ref={mesh}>
        <meshBasicMaterial color="red" />
        <boxGeometry />
      </mesh>
    </>
  );
}
