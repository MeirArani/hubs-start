import { Owned, Networked, AEntity } from '#/components/bitecs/component-defs';
import type { HubsWorld } from '#/core/app';
import { getServerTime } from '#/networking/phoenix-adapter';
import { hasComponent, addComponent } from 'bitecs';
import type { EntityID } from './networking-types';

export function takeOwnership(world: HubsWorld, eid: EntityID) {
  // TODO we do this to have a single API for taking ownership of things in new code, but it obviously relies on NAF/AFrame
  if (hasComponent(world, eid, AEntity)) {
    const el = world.eid2obj.get(eid)!.el!;
    !NAF.utils.isMine(el) && NAF.utils.takeOwnership(el);
  } else {
    addComponent(world, eid, Owned);
    Networked.lastOwnerTime[eid] = Math.max(
      getServerTime(),
      Networked.lastOwnerTime[eid] + 1,
    );
    Networked.owner[eid] = window.APP.getSid(NAF.clientId);
  }
}
