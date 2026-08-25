import { ClientOnly, createFileRoute } from '@tanstack/react-router';
import { ThemeProvider } from '#/react-components/styles/theme';
import UIRoot from '#/react-components/UIRoot';
import HubChannel from '#/core/hub-channel';
import { DummyPermissions } from '#/utils/dummy';
import { App } from '#/core/app';
import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame, type ThreeElements } from '@react-three/fiber';
import { HubContext } from '#/react-components/context/HubsContext';
import { Mesh, PerspectiveCamera } from 'three';
import type { Hub } from '#/core/hub';
import { UserInputManager } from '#/input/UserInput.client.tsx';
import PlayerController from '#/components/PlayerController';
import Scene from '#/core/Scene';
import { Html, useProgress } from '@react-three/drei';

interface HubSearchParams {
  hub_invite_id?: string;
  embed_token?: string;
  debugLocalScene?: boolean;
}

export const Route = createFileRoute('/$hubId')({
  component: RouteComponent,
  ssr: false,
  validateSearch: (params: Record<string, unknown>): HubSearchParams => {
    return {
      hub_invite_id: (params.hub_invite_id as string) || '',
      embed_token: (params.embed_token as string) || '',
      debugLocalScene: params.debugLocalScene ? true : false,
    };
  },
});

function Box(props: ThreeElements['mesh']) {
  const ref = useRef<Mesh>(null!);
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  useFrame((_state, delta) => (ref.current.rotation.x += delta));
  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={() => click(!clicked)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
}

function RouteComponent() {
  window.APP = new App();
  // Create playerCam reference here, so we can pass deeply
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
    name: 'Dummy Room',
    port: 444,
    room_size: 20,
    scene: {
      account_id: 'myrrh',
      allow_promotion: true,
      allow_remixing: true,
      attributions: {
        content: [],
        creator: 'Me :)',
      },
      description: 'Cool test scene',
      model_url: '',
      name: 'Test Name',
      project_id: 'dummy',
      scene_id: 'dummy',
      scene_project_url: '',
      screenshot_url:
        'https://metaveq.icer.kyushu-u.ac.jp/files/7d8d6a2e-eaa6-458a-8658-c54eaab302a9.jpg',
      type: 'scene_listing',
      url: '',
    },
    topics: [],
    turn: { enabled: false },
    user_data: null,
    embed_token: 'testToken',
  };
  console.log('re render');
  return (
    <ThemeProvider>
      <HubContext
        value={{ hub, hubChannel: new HubChannel('test'), scene: null! }}
      >
        <div className="support-root"></div>
        <ClientOnly>
          <Canvas className="absolute top-0 left-0 w-full h-full">
            <ambientLight intensity={Math.PI / 2} />
            <Suspense fallback={<Loader />}>
              <Scene>
                <UserInputManager />
                <Box position={[0, 1, 0]} />
              </Scene>
            </Suspense>
          </Canvas>
        </ClientOnly>

        <div id="ui-root">
          <UIRoot />
        </div>
        <div id="canvas-container"></div>
      </HubContext>
    </ThemeProvider>
  );
}

function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress} % loaded</Html>;
}
