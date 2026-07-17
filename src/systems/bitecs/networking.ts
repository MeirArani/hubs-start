import { query, type World } from 'bitecs';
import { Networked } from '@/components/bitecs/component-defs';
import type {
  CreateMessageData,
  CreatorChange,
  EntityID,
  Message,
  StringID,
} from '@/components/bitecs/networking-defs';
export let localClientID: StringID | null = null;
export function setLocalClientID(clientId: StringID) {
  connectedClientIds.add(clientId);
  localClientID = clientId;
}
export const createMessageDatas: Map<EntityID, CreateMessageData> = new Map();
export const networkedQueryWithWorld = (world: World) =>
  query(world, [Networked]);
// export const networkedQuery = query(window.APP.world, [Networked]);
export const connectedClientIds = new Set<StringID>();
export const disconnectedClientIds = new Set<StringID>();
export const pendingMessages: Message[] = [];
export const pendingCreatorChanges: CreatorChange[] = [];
export const pendingJoins: StringID[] = [];
export const pendingParts: StringID[] = [];
export const softRemovedEntities = new Set<EntityID>();
export function isNetworkInstantiated(eid: EntityID) {
  return createMessageDatas.has(eid);
}

export function isPinned(eid: EntityID) {
  return Networked.creator[eid] === window.APP.getSid('reticulum');
}

export function isCreatedByMe(eid: EntityID) {
  return Networked.creator[eid] === window.APP.getSid(NAF.clientId);
}

const ticksPerSecond = 12;
export const millisecondsBetweenTicks = 1000 / ticksPerSecond;
