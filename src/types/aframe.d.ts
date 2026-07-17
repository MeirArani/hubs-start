import type { App } from '#/core/app';
import type HubChannel from '#/core/hub-channel';
import type PhoenixAdapter from '#/networking/phoenix-adapter';
import type { ANode, Scene } from 'aframe';
import type { PerspectiveCamera } from 'three';

declare module 'aframe' {
  interface Scene {
    camera: PerspectiveCamera;
  }

  interface Entity {
    eid: number;
  }
}
declare global {
  interface Document {
    getElementById<T extends HTMLElement>(id: string): T | null;
    querySelector<E extends HTMLElement>(selectors: string): E | null;
  }
}

// declare module 'react/jsx-runtime' {
//   namespace JSX {
//     export interface IntrinsicElements {
//       'a-scene': Scene;
//     }
//   }
// }
