import { store } from '#/store/store';
import type { Permission } from '#/systems/aframe/permissions';
import type { Hub, UserInfo } from '#/types/hubs';
import { Presence, Channel, Socket } from 'phoenix';
import { jwtDecode } from 'jwt-decode';
import { setIsAdmin } from './configs';
import {
  migrateChannelToSocket,
  migrateToChannel,
} from '#/utils/phoenix-utils';
import type { ObjectTypes } from './object-types';

export interface HubSettings {
  name: string;
  description: string;
  room_size: number;
  entry_mode: 'invite' | 'allow';
  member_permissions: {
    voice_chat: boolean;
    text_chat: boolean;
    spawn_and_move_media: boolean;
    spawn_camera: boolean;
    pin_objects: boolean;
    spawn_drawing: boolean;
    spawn_emoji: boolean;
    fly: boolean;
  };
  allow_promotion: boolean;
  user_data: { hubs_use_bitecs_based_client: boolean };
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30;
function isSameMonth(da: Date, db: Date) {
  return da.getFullYear() == db.getFullYear() && da.getMonth() == db.getMonth();
}

function isSameDay(da: Date, db: Date) {
  return isSameMonth(da, db) && da.getDate() == db.getDate();
}

declare module 'phoenix' {
  interface Socket {
    endPoint: any;
  }

  interface Presence {
    state: Record<string, UserInfo>;
    caller: {
      onJoin: () => void;
      onLeave: () => void;
      onSync: () => void;
    };
  }

  interface Push {
    recHooks: any[];
  }
  interface Channel {
    bindings: any[];
    pushBuffer: any[];
    topic: string;
    bindingRef: any;

    push(event: string, payload?: object, timeout?: number): Push;
    joinPush: Push;
    socket: Socket;
    params: () => HubsChannelParams;
  }
  interface Socket {
    params: () => HubsChannelParams;
  }
}

export interface UserProfile {
  displayName: string;
  pronouns: string;
  avatarId: string;
  personalAvatarId: string;
  avatar?: unknown;
}
export interface HubsChannelParams {
  profile: UserProfile;
  push_subscription_endpoint?: string | null;
  auth_token?: string | null;
  perms_token?: string | null;
  context: {
    mobile: boolean;
    embed: boolean;
    hmd: boolean;
  };
  hub_invite_id?: string | null;
  session_id?: string;
  session_token?: string;
}

interface Permissions {
  account_id: string;
  amplify_audio: boolean;
  aud: string;
  close_hub: boolean;
  create_hub: boolean;
  embed_hub: boolean;
  exp: number;
  fly: boolean;
  hub_id: string;
  iat: number;
  iss: string;
  join_hub: boolean;
  jti: string;
  kick_users: boolean;
  mute_users: boolean;
  nbf: number;
  pin_objects: boolean;
  spawn_and_move_media: boolean;
  spawn_camera: boolean;
  spawn_drawing: boolean;
  spawn_emoji: boolean;
  sub: string;
  text_chat: boolean;
  tweet: boolean;
  typ: 'access';
  update_hub: boolean;
  update_hub_promotion: boolean;
  update_roles: boolean;
  voice_chat: boolean;
  ret_admin?: boolean;
  postgrest_role?: string;
}

const hubCreatorPermissions = [
  'update_hub',
  'update_hub_promotion',
  'update_roles',
  'close_hub',
  'mute_users',
  'kick_users',
  'amplify_audio',
] as const;

type HubCreatorPermission = (typeof hubCreatorPermissions)[number];

type ValidPermission =
  | HubCreatorPermission
  | 'tweet'
  | 'spawn_camera'
  | 'spawn_drawing'
  | 'spawn_and_move_media'
  | 'pin_objects'
  | 'spawn_emoji'
  | 'fly'
  | 'voice_chat'
  | 'text_chat';

function isHubCreatorPermission(
  permission: string,
): permission is HubCreatorPermission {
  return hubCreatorPermissions.includes(permission as HubCreatorPermission);
}

export default class HubChannel extends EventTarget {
  _permissions: Partial<Permissions> = {};
  presence?: Presence;
  hubId: string;
  _signedIn = false;
  token?: string;
  channel?: Channel;
  fetchPermissionsTimeout: number = 0;

  constructor(hubId: string) {
    super();
    this.hubId = hubId;
    this._signedIn = !!store.state.credentials.token;
  }

  get signedIn() {
    return this._signedIn;
  }

  can(permission: ValidPermission): boolean {
    // if (!VALID_PERMISSIONS.includes(permission))
    //   throw new Error(`Invalid permission name: ${permission}`)
    return this._permissions && this._permissions[permission] ? true : false;
  }

  userCan(clientId: string, permission: Permission) {
    const presenceState = this.presence?.state[clientId];
    if (!presenceState) {
      console.warn(`userCan: Had no presence state for ${clientId}`);
      return false;
    }

    return !!presenceState.metas[0].permissions[permission];
  }

  canOrWillIfCreator(permission: ValidPermission | HubCreatorPermission) {
    if (this._getCreatorAssignmentToken() && isHubCreatorPermission(permission))
      return true;
    return this.can(permission);
  }

  canEnterRoom(hub: Hub) {
    if (!hub) return false;
    if (this.canOrWillIfCreator('update_hub')) return true;

    if (!this.presence) {
      console.warn(`userCan: Had no presence`);
      return false;
    }

    const roomEntrySlotCount = Object.values(this.presence.state).reduce(
      (acc, { metas }) => {
        const meta = metas[metas.length - 1];
        const usingSlot =
          meta.presence === 'room' || (meta.context && meta.context.entering);
        return acc + (usingSlot ? 1 : 0);
      },
      0,
    );

    // This now exists in room settings but a default is left here to support old reticulum servers
    const DEFAULT_ROOM_SIZE = 24;
    return (
      roomEntrySlotCount <
      (hub.room_size !== undefined ? hub.room_size : DEFAULT_ROOM_SIZE)
    );
  }

  // Migrates this hub channel to a new phoenix channel and presence
  async migrateToSocket(socket: Socket, params: HubsChannelParams) {
    let presenceBindings;
    if (!this.channel) return;

    // Unbind presence, and then set up bindings after reconnect
    if (this.presence) {
      presenceBindings = {
        onJoin: this.presence.caller.onJoin,
        onLeave: this.presence.caller.onLeave,
        onSync: this.presence.caller.onSync,
      };

      this.presence.onJoin(function () {});
      this.presence.onLeave(function () {});
      this.presence.onSync(function () {});
    }

    this.channel = await migrateChannelToSocket(this.channel, socket, params);
    if (!this.channel)
      return console.error('Failed to migrate socket — Channel not found!');
    this.presence = new Presence(this.channel);

    if (presenceBindings) {
      this.presence.onJoin(presenceBindings.onJoin);
      this.presence.onLeave(presenceBindings.onLeave);
      this.presence.onSync(presenceBindings.onSync);
    }
  }

  async migrateToHub(hubId: string) {
    let presenceBindings;

    const newChannel = this.channel?.socket.channel(
      `hub:${hubId}`,
      window.APP.hubChannelParamsForPermsToken
        ? window.APP.hubChannelParamsForPermsToken()
        : undefined,
    );
    if (!newChannel) return;
    if (!this.channel) return;
    const data = await migrateToChannel(this.channel, newChannel);

    if (this.presence) {
      presenceBindings = {
        onJoin: this.presence.caller.onJoin,
        onLeave: this.presence.caller.onLeave,
        onSync: this.presence.caller.onSync,
      };

      this.presence.onJoin(function () {});
      this.presence.onLeave(function () {});
      this.presence.onSync(function () {});
    }

    this.channel = newChannel;
    this.presence = new Presence(this.channel);
    this.hubId = data.hubs[0].hub_id;

    this.setPermissionsFromToken(data.perms_token);

    if (presenceBindings) {
      this.presence.onJoin(presenceBindings.onJoin);
      this.presence.onLeave(presenceBindings.onLeave);
      this.presence.onSync(presenceBindings.onSync);
    }
    return data;
  }

  sendEnteringEvent = async () => {
    this.channel?.push('events:entering', {});
  };

  sendEnteringCanceledEvent() {
    this.channel?.push('events:entering_cancelled', {});
  }

  sendEnteredEvent = async () => {
    if (!this.channel) {
      console.warn('No phoenix channel initialized before room entry.');
      return;
    }

    let entryDisplayType = 'Screen';
    // VR
    // if (navigator.getVRDisplays) {
    //   const vrDisplay = (await navigator.getVRDisplays()).find(d => d.isPresenting);

    //   if (vrDisplay) {
    //     entryDisplayType = vrDisplay.displayName;
    //   }
    // }

    // CHECK early bail
    if (!this.presence) return;

    const initialOccupantCount = this.presence
      .list((key, presence) => {
        return {
          key,
          entryState: presence.metas[presence.metas.length - 1].presence,
        };
      })
      .filter(({ key, entryState }) => {
        return key !== NAF.clientId && entryState === 'room';
      }).length;

    const entryTimingFlags = this.getEntryTimingFlags();

    const entryEvent = {
      ...entryTimingFlags,
      initialOccupantCount,
      entryDisplayType,
      userAgent: navigator.userAgent,
    };

    this.channel?.push('events:entered', entryEvent);
  };

  _getCreatorAssignmentToken = () => {
    const creatorAssignmentTokenEntry =
      store.state.creatorAssignmentTokens &&
      store.state.creatorAssignmentTokens.find(
        (t: { hubId: string; creatorAssignmentToken: string }) =>
          t.hubId === this.hubId,
      );

    return (
      creatorAssignmentTokenEntry &&
      creatorAssignmentTokenEntry.creatorAssignmentToken
    );
  };

  beginStreaming() {
    this.channel?.push('events:begin_streaming', {});
  }

  endStreaming() {
    this.channel?.push('events:end_streaming', {});
  }

  beginRecording() {
    this.channel?.push('events:begin_recording', {});
  }

  endRecording() {
    this.channel?.push('events:end_recording', {});
  }

  raiseHand() {
    this.channel?.push('events:raise_hand', {});
  }

  lowerHand() {
    this.channel?.push('events:lower_hand', {});
  }

  beginTyping() {
    this.channel?.push('events:begin_typing', {});
  }

  endTyping() {
    this.channel?.push('events:end_typing', {});
  }

  getEntryTimingFlags = () => {
    const entryTimingFlags = {
      isNewDaily: true,
      isNewMonthly: true,
      isNewDayWindow: true,
      isNewMonthWindow: true,
    };
    const storedLastEnteredAt = store.state.activity.lastEnteredAt;

    if (!storedLastEnteredAt) {
      return entryTimingFlags;
    }

    const now = new Date();
    const lastEntered = new Date(storedLastEnteredAt);
    const msSinceLastEntered: number = now.getTime() - lastEntered.getTime();

    // note that new daily and new monthly is based on client local time
    entryTimingFlags.isNewDaily = !isSameDay(now, lastEntered);
    entryTimingFlags.isNewMonthly = !isSameMonth(now, lastEntered);
    entryTimingFlags.isNewDayWindow = msSinceLastEntered > MS_PER_DAY;
    entryTimingFlags.isNewMonthWindow = msSinceLastEntered > MS_PER_MONTH;

    return entryTimingFlags;
  };

  sendObjectSpawnedEvent = (objectType: typeof ObjectTypes) => {
    if (!this.channel) {
      console.warn('No phoenix channel initialized before object spawn.');
      return;
    }

    const spawnEvent = {
      object_type: objectType,
    };

    this.channel?.push('events:object_spawned', spawnEvent);
  };

  sendProfileUpdate = () => {
    this.channel?.push('events:profile_updated', {
      profile: store.state.profile,
    });
  };

  updateScene = (url: string) => {
    if (!this._permissions.update_hub) return 'unauthorized';
    this.channel?.push('update_scene', { url });
  };

  updateHub = (settings: Hub) => {
    if (!this._permissions.update_hub) return 'unauthorized';
    this.channel?.push('update_hub', settings);
  };

  fetchInvite = () => {
    return new Promise<{ hub_invite_id: string }>((resolve) =>
      this.channel?.push('fetch_invite', {}).receive('ok', resolve),
    );
  };

  revokeInvite = (hubInviteId: string) => {
    return new Promise<{ hub_invite_id: string }>((resolve) =>
      this.channel
        ?.push('revoke_invite', { hub_invite_id: hubInviteId })
        .receive('ok', resolve),
    );
  };

  closeHub = () => {
    if (!this._permissions.close_hub) return 'unauthorized';
    this.channel?.push('close_hub', {});
  };

  subscribe = (subscription: PushSubscription) => {
    this.channel?.push('subscribe', { subscription });
  };

  // If true, will tell the server to not send us any NAF traffic
  allowNAFTraffic = (allow: boolean) => {
    this.channel?.push(allow ? 'unblock_naf' : 'block_naf', {});
  };

  unsubscribe = (subscription: PushSubscription) => {
    return new Promise<{ has_remaining_subscriptions: boolean }>((resolve) =>
      this.channel
        ?.push('unsubscribe', { subscription })
        .receive('ok', resolve),
    );
  };

  sendMessage = (body: string | object, type = 'chat') => {
    // if (!body) return;
    this.channel?.push('message', { body, type });
  };

  signIn(token: string) {
    return new Promise<boolean>((resolve, reject) => {
      const creator_assignment_token = this._getCreatorAssignmentToken();

      this.channel
        ?.push('sign_in', { token, creator_assignment_token })
        .receive('ok', ({ perms_token }: { perms_token: string }) => {
          this.setPermissionsFromToken(perms_token);
          this._signedIn = true;
          resolve(true);
        })
        .receive('error', (err: { reason: string }) => {
          if (err.reason === 'invalid_token') {
            console.warn('sign in failed', err);
            // Token expired or invalid TODO purge from storage if possible
            resolve(false);
          } else {
            console.error('sign in failed', err);
            reject(false);
          }
        });
    });
  }

  fetchPermissions() {
    return new Promise((resolve, reject) => {
      this.channel
        ?.push('refresh_perms_token')
        .receive('ok', (res: { perms_token: string }) => {
          this.setPermissionsFromToken(res.perms_token);
          resolve({
            permsToken: res.perms_token,
            permissions: this._permissions,
          });
        })
        .receive('error', reject);
    });
  }

  setPermissionsFromToken = (token: string) => {
    // Note: token is not verified.
    this.token = token;
    this._permissions = jwtDecode(token);
    setIsAdmin(this._permissions.postgrest_role === 'ret_admin');
    this.dispatchEvent(new CustomEvent<string>('permissions_updated'));

    // Refresh the token 1 minute before it expires.
    const nextRefresh =
      new Date((this._permissions.exp || 0) * 1000 - 60 * 1000).getTime() -
      new Date().getTime();
    if (this.fetchPermissionsTimeout) {
      clearTimeout(this.fetchPermissionsTimeout);
    }
    this.fetchPermissionsTimeout = window.setTimeout(
      this.fetchPermissions,
      nextRefresh,
    );
  };

  // REIMP
  hide(sessionId: string) {
    // NAF.connection.adapter.block(sessionId);
    // APP.dialog.block(sessionId);
    // this.channel?.push('block', { session_id: sessionId });
    // this._blockedSessionIds.add(sessionId);
  }
}
