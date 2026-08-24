import { useFrame } from '@react-three/fiber';
import { useContext } from 'react';
import { PerspectiveCamera, Vector2, Vector3 } from 'three';
import { Pose } from '#/core/Pose';
import { SceneContext } from '#/core/Scene';

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

const origin = new Vector3();
const direction = new Vector3();
function CalculateCursorPose(
  cursorPose: Pose,
  camera: PerspectiveCamera,
  coords: Vector2,
) {
  origin.setFromMatrixPosition(camera.matrixWorld);
  direction
    .set(coords.x, coords.y, 0.5)
    .unproject(camera)
    .sub(origin)
    .normalize();
  cursorPose.fromOriginAndDirection(origin, direction);
  return cursorPose;
}

export function UserInputSystem() {}

interface Input {
  mouse: {
    buttons: {
      left: boolean;
      right: boolean;
      middle: boolean;
    };
    delta: Vector2;
    position: Vector2;
    cursorPose: Pose;
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
    delta: new Vector2(),
    position: new Vector2(),
    cursorPose: new Pose(),
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

let hasRun = false;
export function UserInputManager() {
  const scene = useContext(SceneContext);
  useFrame((state) => {
    if (!hasRun) {
      console.log(`Input running ${performance.now()}`);
      hasRun = true;
    }
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
          InputObj.mouse.delta = new Vector2(
            mouseEvent.movementX,
            mouseEvent.movementY,
          );
          InputObj.mouse.position = new Vector2(
            (mouseEvent.clientX / state.size.width) * 2 - 1,
            -(mouseEvent.clientY / state.size.height) * 2 + 1,
          );

          break;
        }
        default: {
        }
      }
    }
    keyboardEvents.length = 0;
    mouseEvents.length = 0;

    if (!scene.camera) return;

    InputObj.mouse.cursorPose = CalculateCursorPose(
      new Pose(),
      scene.camera,
      InputObj.mouse.position,
    );
  });

  return null;
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
