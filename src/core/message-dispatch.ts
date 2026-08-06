export const LogMessageKinds = [
  'roomEntryRequired',
  'flyModeDisabled',
  'flyModeEnabled',
  'unauthorizedSceneChange',
  'invalidSceneUrl',
  'unauthorizedRoomRename',
  'captureUnavailable',
  'captureStopped',
  'captureStarted',
  'captureAlreadyStopped',
  'captureAlreadyRunning',
  'positionalAudioEnabled',
  'positionalAudioDisabled',
  'setAudioNormalizationFactor',
  'audioNormalizationDisabled',
  'audioNormalizationNaN',
  'invalidAudioNormalizationRange',
  'audioSuspended',
  'audioResumed',
  'joinFailed',
  'avatarChanged',
] as const;

export type PresenceKind = 'room' | 'lobby';

export type LogMessageKind = (typeof LogMessageKinds)[number];

export interface Message {
  key?: string;
  props?: any;
  expired?: boolean;
  message:
    | {
        type: 'log';
        messageType: LogMessageKind;
      }
    | { type: 'hub_changed'; hubName: string; showLineBreak?: boolean }
    | { type: 'join'; presence: PresenceKind; name: string }
    | { type: 'leave'; name: string }
    | { type: 'entered'; presence: PresenceKind; name: string }
    | { type: 'display_name_changed'; oldName: string; newName: string }
    | { type: 'scene_changed'; name: string; sceneName: string }
    | { type: 'hub_name_changed'; name: string; hubName: string }
    | {
        type: 'permission';
        id: string;
        body: { permission: Permission; status: boolean; src: string }; // TODO: Add real permissions union
      }
    | { type: 'chat'; id: string; body: string }
    | {
        type: 'image' | 'photo';
        id: string;
        body: {
          src: string;
        };
      }
    | {
        type: 'video';
        id: string;
        body: {
          src: string;
        };
      };
}

export type ChatMessage = Extract<Message['message'], { body: {} }>;
export type PermissionMessage = Extract<
  Message['message'],
  { type: 'permission' }
>;

// export type Message =
//   | LogMessage
//   | HubChangedMessage
//   | JoinMessage
//   | LeaveMessage
//   | DisplayNameChangedMessage
//   | SceneChangedMessage
//   | HubNameChangedMessage
//   | PermissionMessage
//   | ChatMessage
//   | ImageMessage
//   | EnteredMessage;
