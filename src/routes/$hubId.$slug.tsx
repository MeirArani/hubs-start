import { createFileRoute, Router } from '@tanstack/react-router';
import { ThemeProvider } from '#/react-components/styles/theme';
import UIRoot from '#/react-components/UIRoot';
import type { Hub } from '#/types/hubs';
import HubChannel from '#/core/hub-channel';
import type { Scene } from 'aframe';
import { DummyPermissions } from '#/utils/dummy';
import { App } from '#/core/app';

interface HubSearchParams {
  hub_invite_id: string;
  embed_token: string;
}

export const Route = createFileRoute('/$hubId/$slug')({
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

function RouteComponent() {
  window.APP = new App();

  // const t = Route.useParams()
  // const canvas = useRef(null)
  const params = Route.useParams();
  const hub: Hub = {
    allow_promotion: false,
    description: 'Dummy Hub for testing purposes only!!',
    entry_code: 0,
    entry_mode: 'allow',
    host: 'localhost',
    hub_id: params.hubId,
    lobby_count: 20,
    member_count: 10,
    member_permissions: DummyPermissions,
    name: params.slug
      .split('-')
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(' '),
    port: 444,
    room_size: 20,
    slug: 'slug',
    topics: [],
    turn: { enabled: false },
    user_data: null,
    embed_token: 'testToken',
  };
  console.log(hub);
  const scene = document.querySelector<Scene>('a-scene');
  return (
    <ThemeProvider>
      <div className="support-root"></div>
      <div id="ui-root">
        <ThemeProvider>
          <UIRoot
            hub={hub}
            hubChannel={new HubChannel('test')}
            scene={scene!}
          />
        </ThemeProvider>
      </div>
      <div id="canvas-container"></div>
    </ThemeProvider>
  );
}
