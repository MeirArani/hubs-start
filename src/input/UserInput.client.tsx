import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { createStore } from '@tanstack/store';
import { useSelector } from '@tanstack/react-store';
import { Vector2 } from 'three';

interface InputStore {
  keys: {
    a: boolean;
    b: boolean;
    c: boolean;
    d: boolean;
    e: boolean;
    f: boolean;
    g: boolean;
    h: boolean;
    i: boolean;
    j: boolean;
    k: boolean;
    l: boolean;
    m: boolean;
    n: boolean;
    o: boolean;
    p: boolean;
    q: boolean;
    r: boolean;
    s: boolean;
    t: boolean;
    u: boolean;
    v: boolean;
    w: boolean;
    x: boolean;
    y: boolean;
    z: boolean;
    '1': boolean;
    '2': boolean;
    '3': boolean;
    '4': boolean;
    '5': boolean;
    '6': boolean;
    '7': boolean;
    '8': boolean;
    '9': boolean;
  };
  mouse: {
    left: boolean;
    right: boolean;
    middle: boolean;
  };
}

export const inputStore = createStore<InputStore>({
  keys: {
    a: false,
    b: false,
    c: false,
    d: false,
    e: false,
    f: false,
    g: false,
    h: false,
    i: false,
    j: false,
    k: false,
    l: false,
    m: false,
    n: false,
    o: false,
    p: false,
    q: false,
    r: false,
    s: false,
    t: false,
    u: false,
    v: false,
    w: false,
    x: false,
    y: false,
    z: false,
    '1': false,
    '2': false,
    '3': false,
    '4': false,
    '5': false,
    '6': false,
    '7': false,
    '8': false,
    '9': false,
  },
  mouse: {
    left: false,
    right: false,
    middle: false,
  },
});

const keyboardEvents: KeyboardEvent[] = [];
(['keyup', 'keydown'] as const).map((keyEvent) => {
  document.addEventListener(keyEvent, (e) => {
    if (!e.key) return;

    keyboardEvents.push(e);
  });
});

const mouseEvents: MouseEvent[] = [];
(['mouseup', 'mousedown', 'mousemove'] as const).map((mouseEvent) => {
  document.addEventListener(
    mouseEvent,
    (e) => {
      mouseEvents.push(e);
    },
    { passive: false },
  );
});

export function UserInputSystem() {}

interface Input {
  mouse: {
    buttons: {
      left: boolean;
      right: boolean;
      middle: boolean;
    };
    delta: {
      x: number;
      y: number;
    };
    position: {
      x: number;
      y: number;
    };
  };
  keys: {
    a: boolean;
    d: boolean;
    s: boolean;
    w: boolean;
  };
}

const InputObj: Input = {
  mouse: {
    buttons: {
      left: false,
      right: false,
      middle: false,
    },
    delta: {
      x: 0,
      y: 0,
    },
    position: {
      x: 0,
      y: 0,
    },
  },
  keys: {
    a: false,
    d: false,
    s: false,
    w: false,
  },
};

function isValidKey(key: string): key is keyof Input['keys'] {
  return InputObj.keys[key as keyof Input['keys']] !== undefined;
}

export function UserInputManager() {
  useFrame(() => {
    if (keyboardEvents.length == 0 && mouseEvents.length == 0) return;

    // Key Events
    for (const keyEvent of keyboardEvents.filter((ke) =>
      ['keyup', 'keydown'].includes(ke.type),
    )) {
      const key = keyEvent.code.toLowerCase().slice(3) as keyof Input['keys'];
      if (!isValidKey(key)) continue;
      InputObj.keys[key] = keyEvent.type === 'keydown';
    }

    // Mouse Events
    for (const mouseEvent of mouseEvents) {
      switch (mouseEvent.type) {
        case 'mouseup': {
          switch (mouseEvent.button) {
            case 0: {
              InputObj.mouse.buttons.left = false;
              break;
            }
            case 1: {
              InputObj.mouse.buttons.middle = false;
              break;
            }
            case 2: {
              InputObj.mouse.buttons.right = false;
              break;
            }
            default: {
            }
          }
          break;
        }
        case 'mousedown': {
          switch (mouseEvent.button) {
            case 0: {
              InputObj.mouse.buttons.left = true;
              break;
            }
            case 1: {
              InputObj.mouse.buttons.middle = true;
              break;
            }
            case 2: {
              InputObj.mouse.buttons.right = true;
              break;
            }
            default: {
            }
          }
          break;
        }
        case 'mousemove': {
          InputObj.mouse.delta = {
            x: mouseEvent.movementX,
            y: mouseEvent.movementY,
          };
          InputObj.mouse.position = {
            x: mouseEvent.clientX,
            y: -mouseEvent.clientY,
          };
          break;
        }
        default: {
        }
      }
    }

    inputStore.setState((prev) => ({
      ...prev,
      keys: { ...prev.keys, ...keyUpdates },
      mouse: { ...prev.mouse, ...mouseUpdates },
    }));
    keyboardEvents.length = 0;
    mouseEvents.length = 0;
  });

  return <></>;
}

export function useAcceleration(
  callback: (acceleration: Vector2, delta: number) => void,
) {
  const moveVec = new Vector2();
  useFrame((_state, delta) => {
    if (InputObj.keys.w) moveVec.add(new Vector2(0, 1));
    if (InputObj.keys.d) moveVec.add(new Vector2(1, 0));
    if (InputObj.keys.s) moveVec.add(new Vector2(0, -1));
    if (InputObj.keys.a) moveVec.add(new Vector2(-1, 0));

    callback(moveVec, delta);
  });
}

export function useKeys(
  callback: (keys: Input['keys'], delta: number) => void,
) {
  useFrame((_state, delta) => {
    callback(InputObj.keys, delta);
  });
}

export function useDrag(
  callback: (mouse: Input['mouse'], delta: number) => void,
) {
  useFrame((_state, delta) => {
    if (!InputObj.mouse.buttons.left) return;
    if (InputObj.mouse.delta.x === 0 && InputObj.mouse.delta.y === 0) return;

    callback(InputObj['mouse'], delta);
  });
}

export function UseMouse(callback: (mouse: Input['mouse']) => void) {
  useFrame(() => {
    callback(InputObj['mouse']);
  });
}

let keyUpdates: Partial<Record<keyof InputStore['keys'], boolean>> = {};
let mouseUpdates: Partial<Record<keyof InputStore['mouse'], boolean>> = {};
export function useInput() {}
