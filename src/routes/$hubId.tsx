import { ClientOnly, createFileRoute } from '@tanstack/react-router';
import { ThemeProvider } from '#/react-components/styles/theme';
import UIRoot from '#/react-components/UIRoot';
import HubChannel from '#/core/hub-channel';
import { DummyPermissions } from '#/utils/dummy';
import { App } from '#/core/app';
import React, { useRef, useState } from 'react';
import { Canvas, useFrame, type ThreeElements } from '@react-three/fiber';
import { HubContext } from '#/react-components/context/HubsContext';
import { Mesh } from 'three';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {
  CameraControls,
  KeyboardControls,
  OrbitControls,
  PerspectiveCamera,
  useKeyboardControls,
} from '@react-three/drei';
import HubScene from '#/core/HubScene';
import { CameraControlsImpl } from '@react-three/drei';
import type { Hub } from '#/core/hub';
import { UserInputSystem, useInput } from '#/input/UserInput.client';
import { TestScene } from '#/core/TestScene';

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

const { ACTION } = CameraControlsImpl;
enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
}

function Box(props: ThreeElements['mesh']) {
  const ref = useRef<Mesh>(null!);
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  useFrame((state, delta) => (ref.current.rotation.x += delta));
  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  );
}

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
            <spotLight
              position={[10, 10, 10]}
              angle={0.15}
              penumbra={1}
              decay={0}
              intensity={Math.PI}
            />
            <pointLight
              position={[-10, -10, -10]}
              decay={0}
              intensity={Math.PI}
            />
            <TestScene />
            <PerspectiveCamera makeDefault position={[0, 1, 0]} />
            <CameraControls
              mouseButtons={{
                left: ACTION.ROTATE,
                middle: ACTION.DOLLY,
                right: ACTION.TRUCK,
                wheel: ACTION.DOLLY,
              }}
            />
            <Box position={[-1.2, 2, 0]} />
            <Box position={[1.2, 2, 0]} />
            {/* <OrbitControls /> */}
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
