import { AEntity } from '#/components/bitecs/component-defs';
import type { HubsWorld } from '#/core/app';
import { hasComponent } from 'bitecs';

export function isAEntityPinned(world: HubsWorld, eid: number) {
  if (hasComponent(world, eid, AEntity)) {
    const el = world.eid2obj.get(eid)?.el;
    return !!el?.components?.pinnable?.data?.pinned;
  }
  return false;
}
