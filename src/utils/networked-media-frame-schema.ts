// import { NetworkedMediaFrame } from '#/components/bitecs/component-defs';
// import { defineNetworkSchema } from './define-network-schema';
// import type { ArrayVec3 } from './jsx-entity';

// import {
//   deserializerWithMigrations,
//   type Migration,
//   type NetworkSchema,
//   read,
//   type StoredComponent,
//   write,
// } from './network-schemas';
// import type { EntityID } from './networking-types';

// const runtimeSerde = defineNetworkSchema(NetworkedMediaFrame);

// const migrations = new Map<number, Migration>();
// migrations.set(0, ({ data }: StoredComponent) => {
//   return { version: 1, data };
// });

// function apply(eid: EntityID, { version, data }: StoredComponent) {
//   if (version !== 1) return false;

//   const { capturedNid, scale }: { capturedNid: string; scale: ArrayVec3 } =
//     data;
//   write(NetworkedMediaFrame.capturedNid, eid, capturedNid);
//   write(NetworkedMediaFrame.scale, eid, scale);
//   return true;
// }

// export const NetworkedMediaFrameSchema: NetworkSchema = {
//   componentName: 'networked-media-frame',
//   serialize: runtimeSerde.serialize,
//   deserialize: runtimeSerde.deserialize,
//   serializeForStorage: function serializeForStorage(eid: EntityID) {
//     return {
//       version: 1,
//       data: {
//         capturedNid: read(NetworkedMediaFrame.capturedNid, eid),
//         scale: read(NetworkedMediaFrame.scale, eid),
//       },
//     };
//   },
//   deserializeFromStorage: deserializerWithMigrations(migrations, apply),
// };
