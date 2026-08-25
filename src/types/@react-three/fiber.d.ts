import type { RayCurve } from '#/utils/RayCurve';
import { type ThreeElement } from '@react-three/fiber';
import type { Line } from 'three';

declare module '@react-three/fiber' {
  interface ThreeElements {
    rayCurve: ThreeElement<typeof RayCurve>;
    threeLine: ThreeElement<Line>;
  }
}
