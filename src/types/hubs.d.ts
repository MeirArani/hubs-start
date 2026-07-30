import type { App } from '#/core/app';

export type Permission =
  | 'join_hub'
  | 'update_hub'
  | 'update_hub_promotion'
  | 'update_roles'
  | 'close_hub'
  | 'embed_hub'
  | 'kick_users'
  | 'mute_users'
  | 'amplify_audio'
  | 'spawn_camera'
  | 'spawn_drawing'
  | 'spawn_and_move_media'
  | 'pin_objects'
  | 'spawn_emoji'
  | 'fly'
  | 'voice_chat'
  | 'ret_admin'
  | 'text_chat';

export type PresenceKind = 'room' | 'lobby';
export type InflatorParams = {};

export type Inflator<T extends InflatorParams> = (
  world: HubsWorld,
  eid: number,
  params: T,
) => number;

export type Hub = {
  allow_promotion: boolean;
  description: string | null;
  entry_code: 0;
  entry_mode: 'invite' | 'allow';
  host: string;
  hub_id: string;
  lobby_count: number;
  member_count: number;
  member_permissions: Record<Permission, boolean>;
  name?: string;
  port: number;
  room_size: number;
  slug?: string;
  topics: {
    assets: { asset_type: string; src: string }[];
    janus_room_id: number;
    topic_id: string;
  }[];
  turn: TurnInfo;
  scene?: HubScene;
  embed_token?: string;
  user_data: UserData | null;
};

export type EmitterEvents = {
  on: (event: string, callback: (payload: any) => void) => number;
  off: (event: string, ref: number) => void;
  trigger: (event: string, payload: any) => void;
  getBindings: () => Binding[];
};

export type Permissions = {
  account_id: number;
  aud: string;
  create_hub: boolean;
  exp: number;
  iat: number;
  iss: string;
  jti: string;
  nbf: number;
  postgrest_role: string;
  sub: string;
  tweet: boolean;
  typ: 'access';
};

export interface Attribution {
  name?: string;
  title?: string;
  author?: string;
  url?: string;
}

export interface HubScene {
  account_id?: string;
  allow_promotion: boolean;
  allow_remixing: boolean;
  attribution?: string;
  attributions?: {
    content: Attribution[];
    creator: string;
  };
  description?: string;
  model_url?: string;
  name: string;
  parent_scene_id?: string;
  project_id?: string;
  scene_id?: string;
  scene_project_url?: string;
  screenshot_url?: string;
  type?: string;
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

export type UserData = {
  hubs_use_bitecs_based_client: boolean;
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
