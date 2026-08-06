import { useFrame } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { createStore } from '@tanstack/store';
import { useSelector } from '@tanstack/react-store';

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
(['mouseup', 'mousedown'] as const).map((mouseEvent) => {
  document.addEventListener(mouseEvent, (e) => {
    mouseEvents.push(e);
  });
});

export function UserInputSystem() {}

let keyUpdates: Partial<Record<keyof InputStore['keys'], boolean>> = {};
let mouseUpdates: Partial<Record<keyof InputStore['mouse'], boolean>> = {};
export function useInput() {
  useFrame(() => {
    if (keyboardEvents.length == 0 && mouseEvents.length == 0) return;
    for (const keyEvent of keyboardEvents.filter((ke) =>
      ['keyup', 'keydown'].includes(ke.type),
    )) {
      const key = keyEvent.code
        .toLowerCase()
        .slice(3) as keyof InputStore['keys'];
      keyUpdates[key] = keyEvent.type === 'keydown';
    }
    for (const mouseEvent of mouseEvents.filter(
      (me) => ['mouseup', 'mousedown'].includes(me.type) && me.button < 3,
    )) {
      const button =
        mouseEvent.button === 0
          ? 'left'
          : mouseEvent.button === 1
            ? 'middle'
            : 'right';
      mouseUpdates[button] = mouseEvent.type === 'mousedown';
    }
    inputStore.setState((prev) => ({
      ...prev,
      keys: { ...prev.keys, ...keyUpdates },
      mouse: { ...prev.mouse, ...mouseUpdates },
    }));
    keyboardEvents.length = 0;
  });
}
