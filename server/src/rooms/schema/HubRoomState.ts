import { schema, t, type SchemaType } from '@colyseus/schema';

export const Player = schema(
  {
    name: t.string(),
    x: t.number(),
    y: t.number(),
    z: t.number(),
  },
  'Player',
);

export type Player = SchemaType<typeof Player>;

export const HubRoomState = schema(
  {
    players: t.map(Player),
    playerIds: t.array('string'),
  },
  'HubRoomState',
);

export type HubRoomState = SchemaType<typeof HubRoomState>;
