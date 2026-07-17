import { Scene } from 'three';

declare module 'three' {
  export interface Object3D {
    matrixNeedsUpdate: boolean;
    matrixIsModified: boolean;
    _clone: (recursive?: boolean) => this;

    childrenNeedMatrixWorldUpdate: boolean;
    eid: number; // TODO: Did this break something?
    el: Entity;
    updateMatrices: (
      forceLocalUpdate?: boolean,
      forceWorldUpdate?: boolean,
      skipParents?: boolean,
    ) => void;
  }
}
