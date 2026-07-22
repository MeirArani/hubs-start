import { createFileRoute, Router } from '@tanstack/react-router';
import { ThemeProvider } from '#/react-components/styles/theme';
import UIRoot from '#/react-components/UIRoot';
import type { Hub } from '#/types/hubs';
import HubChannel from '#/core/hub-channel';
import type { Scene } from 'aframe';
import { DummyPermissions } from '#/utils/dummy';
import { App } from '#/core/app';
import { createContext } from 'react';

interface HubSearchParams {
  hub_invite_id?: string;
  embed_token?: string;
}

export const Route = createFileRoute('/$hubId')({
  component: RouteComponent,
  ssr: false,
  validateSearch: (params: Record<string, unknown>): HubSearchParams => {
    return {
      hub_invite_id: (params.hub_invite_id as string) || '',
      embed_token: (params.embed_token as string) || '',
    };
  },
});

// const three = (
//   <Canvas>
//     <ambientLight intensity={0.1} />
//     <directionalLight color="red" position={[0, 0, 5]} />
//     <mesh>
//       <boxGeometry scale={5} />
//       <meshStandardMaterial />
//     </mesh>
//   </Canvas>
// )

const dummyHub: Hub = {
  allow_promotion: false,
  description: 'Dummy Hub for testing purposes only!!',
  entry_code: 0,
  entry_mode: 'allow',
  host: 'localhost',
  hub_id: 'dummy',
  lobby_count: 20,
  member_count: 10,
  member_permissions: DummyPermissions,
  port: 444,
  room_size: 20,
  topics: [],
  turn: { enabled: false },
  user_data: null,
  embed_token: 'testToken',
};

interface HubContextParams {
  hub: Hub;
  hubChannel: HubChannel;
  scene: Scene | null;
}
export const HubContext = createContext<HubContextParams>({
  hub: dummyHub,
  hubChannel: new HubChannel('test'),
  scene: null,
});

function RouteComponent() {
  window.APP = new App();

  const hub: Hub = {
    allow_promotion: false,
    description: 'Dummy Hub for testing purposes only!!',
    entry_code: 0,
    entry_mode: 'allow',
    host: 'localhost',
    hub_id: Route.useParams().hubId,
    lobby_count: 20,
    member_count: 10,
    member_permissions: DummyPermissions,
    port: 444,
    room_size: 20,
    topics: [],
    turn: { enabled: false },
    user_data: null,
    embed_token: 'testToken',
  };

  const scene = document.querySelector<Scene>('a-scene');
  return (
    <ThemeProvider>
      <HubContext
        value={{ hub, hubChannel: new HubChannel('test'), scene: scene! }}
      >
        <div className="support-root"></div>
        <div id="ui-root">
          <UIRoot />
        </div>
        <div id="canvas-container"></div>
      </HubContext>
    </ThemeProvider>
  );
}
