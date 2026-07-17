// TODO Move to coroutine.ts when it exists

import {
  Deleting,
  Deletable,
  HoveredRemoteRight,
  HoveredRemoteLeft,
} from '#/components/bitecs/component-defs';
import type { HubsWorld } from '#/core/app';
import { findAncestorEntity } from '#/utils/bit-utils';
import {
  hasSavedEntityState,
  deleteEntityState,
} from '#/utils/entity-state-utils';
import {
  addComponent,
  removeEntity,
  observe,
  onRemove,
  hasComponent,
  query,
} from 'bitecs';
import { Vector3 } from 'three';
import { coroutine } from '#/utils/coroutine';
import 'animejs/adapters/three';
import { animate } from '#/utils/animate';
import { easeOutQuadratic } from '#/utils/easing';

// TODO Figure out the appropriate type and use it everywhere
export type Coroutine = Generator<Promise<void>, void, unknown>;

const END_SCALE = new Vector3().setScalar(0.001);
function* animateThenRemoveEntity(world: HubsWorld, eid: number): Coroutine {
  if (hasSavedEntityState(world, eid)) {
    deleteEntityState(window.APP.hubChannel!, world, eid);
  }
  addComponent(world, eid, Deleting);
  const obj = world.eid2obj.get(eid)!;
  yield* animate({
    properties: [[obj.scale.clone(), END_SCALE]],
    durationMS: 400,
    easing: easeOutQuadratic,
    fn: ([scale]: [Vector3]) => {
      obj.scale.copy(scale);
      obj.matrixNeedsUpdate = true;
    },
  });
  removeEntity(world, eid);
}

// REIMP
// observe(window.APP.world, onRemove(Deletable), (eid) => {
//   coroutines.delete(eid);
// });
const coroutines = new Map<number, () => IteratorResult<undefined, any>>();

export function deleteTheDeletableAncestor(world: HubsWorld, eid: number) {
  const ancestor = findAncestorEntity(world, eid, (e: number) =>
    hasComponent(world, e, Deletable),
  );
  if (ancestor && !coroutines.has(ancestor)) {
    coroutines.set(
      ancestor,
      coroutine(animateThenRemoveEntity(world, ancestor)),
    );
  }
}

export function deleteEntitySystem(
  world: HubsWorld,
  userinput: UserInputSystem,
) {
  if (
    userinput.get<'boolean'>({
      kind: 'boolean',
      path: 'cursor.right.deleteEntity',
    })
  ) {
    query(world, [HoveredRemoteRight]).forEach((eid) =>
      deleteTheDeletableAncestor(world, eid),
    );
  }
  if (
    userinput.get<'boolean'>({
      kind: 'boolean',
      path: 'cursor.left.deleteEntity',
    })
  ) {
    query(world, [HoveredRemoteLeft]).forEach((eid) =>
      deleteTheDeletableAncestor(world, eid),
    );
  }
  coroutines.forEach((c) => c());
}
