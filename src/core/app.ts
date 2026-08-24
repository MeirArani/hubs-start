import { createWorld, type InternalWorld, type World } from 'bitecs';
import type { Material, Object3D } from 'three';
import {
  AEntity,
  Networked,
  Object3DTag,
  Owned,
} from '#/components/bitecs/component-defs';
import type { Scene } from 'aframe';
import type HubChannel from './hub-channel';
import type SceneEntryManager from './scene-entry-manager';
import type PinningHelper from '#/utils/pinning-helper';
import type { HubsChannelParams } from './hub-channel';
// import type Hub from './hub';

export interface HubsWorld {
  eid2obj: Map<number, Object3D>;
  eid2mat: Map<number, Material>;
  nid2eid: Map<number, number>;
  deletedNids: Set<number>;
  ignoredNids: Set<number>;
  nameToComponent: {
    object3d: typeof Object3DTag;
    networked: typeof Networked;
    owned: typeof Owned;
  };
  time: {
    delta: number;
    elapsed: number;
    tick: number;
  };
  scene?: Scene;
}

export class App {
  world: World<HubsWorld> = createWorld<HubsWorld>({
    eid2obj: new Map<number, Object3D>(),
    eid2mat: new Map<number, Material>(),
    nid2eid: new Map<number, number>(),
    deletedNids: new Set<number>(),
    ignoredNids: new Set<number>(),
    nameToComponent: {
      object3d: Object3DTag,
      networked: Networked,
      owned: Owned,
      AEntity: AEntity,
    },
    time: {
      delta: 0,
      elapsed: 0,
      tick: 0,
    },
  });

  member_permissions = {
    voice_chat: true,
    text_chat: true,
    spawn_and_move_media: true,
    spawn_camera: true,
    pin_objects: true,
    spawn_drawing: true,
    spawn_emoji: true,
    fly: true,
  };

  str2sid = new Map<string | null, number>([[null, 0]]);
  sid2str = new Map<number, string | null>([[0, null]]);
  nextSid = 1;

  hubChannel?: HubChannel;
  entryManager?: SceneEntryManager;
  pinningHelper: PinningHelper | null = null;

  hubChannelParamsForPermsToken?: (permsToken?: string) => HubsChannelParams;
  hub?: Hub;

  constructor() {}

  getSid(str: string) {
    if (!this.str2sid.has(str)) {
      const sid = this.nextSid;
      this.nextSid = this.nextSid + 1;
      this.str2sid.set(str, sid);
      this.sid2str.set(sid, str);
      return sid;
    }
    return this.str2sid.get(str)!;
  }

  getString(sid: number) {
    return this.sid2str.get(sid);
  }
}
