import type { App } from '#/core/app';

export type PresenceKind = 'room' | 'lobby';
export type InflatorParams = {};

export type Inflator<T extends InflatorParams> = (
  world: HubsWorld,
  eid: number,
  params: T,
) => number;

export type EmitterEvents = {
  on: (event: string, callback: (payload: any) => void) => number;
  off: (event: string, ref: number) => void;
  trigger: (event: string, payload: any) => void;
  getBindings: () => Binding[];
};

export interface Attribution {
  name?: string;
  title?: string;
  author?: string;
  url?: string;
}

export type PresenceUpdateData = {
  sessionId: string;
  meta: PresenceMetadata;
};

export type PresenceMetadata = {
  context: {
    embed: boolean;
    hmd: boolean;
    mobile: boolean;
  };
  permissions: Record<Permission, boolean>;
  phx_ref: string;
  presence: PresenceKind;
  profile: HubsProfile;
  roles: {
    creator: boolean;
    owner: boolean;
    signed_in: boolean;
  };
  sessionId?: string;
  streaming?: boolean;
  recording?: boolean;
  hand_raised?: boolean;
  typing?: boolean;
};

export type HubsProfile = {
  avatarId: string;
  displayName: string;
  pronouns?: string;
  identityName?: string;
};

export type HubsFetchInvite = {
  hub_invite_id: string;
};

export type HubsChannelParams = {
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
};

export type UserInfo = {
  metas: {
    profile: Profile;
    permissions: { [key: string]: Permission };
    presence: 'room';
    streaming: boolean;
    roles: { owner: boolean };
    context: {
      entering: boolean;
    };
  }[];
};

export type UserProfile = {
  displayName: string;
  pronouns: string;
  avatarId: string;
  personalAvatarId: string;
  avatar?: unknown;
};

export type MemberPermissions = {
  spawn_and_move_media: boolean;
  spawn_camera: boolean;
  spawn_drawing: boolean;
  pin_objects: boolean;
  spawn_emoji: boolean;
  fly: boolean;
  voice_chat: boolean;
  text_chat: boolean;
};

export type RoomSettings = {
  name: string;
  description: string;
  room_size: number;
  entry_mode: 'invite' | 'allow';
  allow_promotion: boolean;
  user_data: UserData;
};

export type HubsAppConfigCategory =
  | 'translations'
  | 'features'
  | 'rooms'
  | 'images'
  | 'theme'
  | 'links'
  | 'auth';
export type HubsTranslationLanguage = 'en';
export interface HubsAppConfigSetting {
  category: HubsAppConfigCategory;
  type: 'string' | 'boolean' | 'file' | 'color' | 'longstring';
  name: string;
  description: string;
}

export interface HubsAppConfig {
  translations: {
    [language: HubsTranslationLanguage]: {
      [setting: string]: HubsAppConfigSetting;
    };
  };
  [category: `${Exclude<HubsAppConfigCategory, 'translations'>}`]: {
    [setting: string]: HubsAppConfigSetting;
  };
}

declare global {
  interface Window {
    APP: App;
  }
}
