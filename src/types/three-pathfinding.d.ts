import type { Zone } from 'three-pathfinding';

declare module 'three-pathfinding' {
  export interface Pathfinding {
    zones: Record<string, Zone>;
  }
}
