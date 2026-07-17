import {
  hasComponent,
  query,
  type ComponentRef,
  type QueryResult,
} from 'bitecs';
import { qsTruthy } from './qs_truthy';
import type { HubsWorld } from '#/core/app';
import type { Object3D } from 'three';
import type { EntityID } from './networking-types';
import type { Entity } from 'aframe';
import { findAncestor, findAncestors, traverseSome } from './three-utils';

export type ElOrEid = EntityID | Entity;

// REIMP
const forceNewLoader = qsTruthy('newLoader');
export function shouldUseNewLoader() {
  return false;
  //   return forceNewLoader || APP.hub?.user_data?.hubs_use_bitecs_based_client;
}

const queries = new Map<ComponentRef, QueryResult>();
export function anyEntityWith(world: HubsWorld, component: ComponentRef) {
  if (!queries.has(component)) {
    queries.set(component, query(world, [component]));
  }

  const eids = queries.get(component);
  return eids && eids.length ? eids[0] : 0;
}

export function hasAnyComponent(
  world: HubsWorld,
  components: ComponentRef[],
  eid: number,
) {
  for (let i = 0; i < components.length; i++) {
    if (hasComponent(world, components[i], eid)) return true;
  }
  return false;
}

export function findAncestorEntity(
  world: HubsWorld,
  eid: number,
  predicate: (eid: number) => boolean,
) {
  const obj = findAncestor(
    world.eid2obj.get(eid)!,
    (o: Object3D) => !!(o.eid && predicate(o.eid)),
  ) as Object3D | null;
  return obj && obj.eid!;
}

export function findAncestorEntities(
  world: HubsWorld,
  eid: number,
  predicate: (eid: number) => boolean,
): EntityID[] {
  const objs = findAncestors(
    world.eid2obj.get(eid)!,
    (o: Object3D) => !!(o.eid && predicate(o.eid)),
  ) as Object3D[];
  return objs.filter((obj) => obj.eid!).map((obj) => obj.eid) as EntityID[];
}

export function findAncestorWithComponent(
  world: HubsWorld,
  component: ComponentRef,
  eid: number,
) {
  return findAncestorEntity(world, eid, (otherId) =>
    hasComponent(world, component, otherId),
  );
}

export function findAncestorsWithComponent(
  world: HubsWorld,
  component: ComponentRef,
  eid: number,
): EntityID[] {
  return findAncestorEntities(world, eid, (otherId) =>
    hasComponent(world, component, otherId),
  );
}

export function findAncestorWithComponents(
  world: HubsWorld,
  components: Array<ComponentRef>,
  eid: number,
) {
  return findAncestorEntity(world, eid, (otherId) =>
    components.every((component) => hasComponent(world, component, otherId)),
  );
}

export function findAncestorWithAnyComponent(
  world: HubsWorld,
  components: Array<ComponentRef>,
  eid: number,
) {
  return findAncestorEntity(world, eid, (otherId) =>
    hasAnyComponent(world, components, otherId),
  );
}

export function findChildWithComponent(
  world: HubsWorld,
  component: ComponentRef,
  eid: number,
) {
  const obj = world.eid2obj.get(eid);
  if (!obj) return;
  let childEid: number | null = null;
  traverseSome(obj, (otherObj: Object3D) => {
    if (otherObj.eid && hasComponent(world, component, otherObj.eid)) {
      childEid = otherObj.eid;
      return false;
    } else {
      return true;
    }
  });
  return childEid;
}
