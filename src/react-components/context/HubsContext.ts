import HubChannel from '#/core/hub-channel';
import { createContext } from 'react';
import { DummyPermissions } from '#/utils/dummy';
import type { Scene } from 'aframe';
import type { Hub } from '#/core/hub';
export interface HubContextParams {
  hub: Hub;
  hubChannel: HubChannel;
  scene: Scene | null;
}

const dummyHub: Hub = {
  allow_promotion: false,
  description: 'Dummy Hub for testing purposes only!!',
  entry_code: 0,
  entry_mode: 'allow',
  host: 'localhost',
  hub_id: 'dummy',
  lobby_count: 20,
  member_count: 10,
  member_permissions: DummyPermissions,
  port: 444,
  room_size: 20,
  topics: [],
  turn: { enabled: false },
  user_data: null,
  embed_token: 'testToken',
};

export const HubContext = createContext<HubContextParams>({
  hub: dummyHub,
  hubChannel: new HubChannel('test'),
  scene: null,
});
