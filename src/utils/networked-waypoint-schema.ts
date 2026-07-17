// import { NetworkedWaypoint } from '#/components/bitecs/component-defs';
// import { defineNetworkSchema } from './define-network-schema';
// import {
//   deserializerWithMigrations,
//   type Migration,
//   type NetworkSchema,
//   type StoredComponent,
// } from './network-schemas';
// import type { EntityID } from './networking-types';

// const runtimeSerde = defineNetworkSchema(NetworkedWaypoint);

// const migrations = new Map<number, Migration>();

// function apply(_eid: EntityID, { version }: StoredComponent) {
//   if (version !== 1) return false;
//   return true;
// }

// export const NetworkedWaypointSchema: NetworkSchema = {
//   componentName: 'networked-waypoint',
//   serialize: runtimeSerde.serialize,
//   deserialize: runtimeSerde.deserialize,
//   // TODO: Strange to have to provide serializeForStorage for components
//   // that will not go to storage.
//   serializeForStorage: function serializeForStorage(_eid: EntityID) {
//     return {
//       version: 1,
//       data: {},
//     };
//   },
//   deserializeFromStorage: deserializerWithMigrations(migrations, apply),
// };
