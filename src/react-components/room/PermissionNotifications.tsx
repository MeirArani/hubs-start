import MicrophoneMutedIcon from '../icons/MicrophoneMuted.svg?react';
import Microphone from '../icons/Microphone.svg?react';
import Chat from '../icons/Chat.svg?react';
import ChatOff from '../icons/ChatOff.svg?react';
import { m } from '#/paraglide/messages';
import type { Permission } from '#/utils/permission';

export const permissionsIcons = {
  voice_chat_enabled: <Microphone />,
  voice_chat_disabled: <MicrophoneMutedIcon />,
  voice_chat_enabled_mod: <Microphone />,
  voice_chat_disabled_mod: <MicrophoneMutedIcon />,
  text_chat_enabled: <Chat />,
  text_chat_disabled: <ChatOff />,
  text_chat_enabled_mod: <Chat />,
  text_chat_disabled_mod: <ChatOff />,
} as const;

export const permissionMessages = {
  voice_chat_enabled: m['chat-sidebar.moderator-message.voice-chat-enabled'](),
  voice_chat_disabled:
    m['chat-sidebar.moderator-message.voice-chat-disabled'](),
  voice_chat_enabled_mod:
    m['chat-sidebar.moderator-message.voice-chat-enabled'](),
  voice_chat_disabled_mod:
    m['chat-sidebar.moderator-message.voice-chat-disabled-mod'](),
  text_chat_enabled: m['chat-sidebar.moderator-message.text-chat-enabled'](),
  text_chat_disabled: m['chat-sidebar.moderator-message.text-chat-disabled'](),
  text_chat_enabled_mod:
    m['chat-sidebar.moderator-message.text-chat-enabled'](),
  text_chat_disabled_mod:
    m['chat-sidebar.moderator-message.text-chat-disabled-mod'](),
} as const;

type ValidPermission = 'voice_chat' | 'text_chat';
type ValidPermissionString =
  `${ValidPermission}_${'enabled' | 'disabled'}${'_mod' | ''}`;

export interface PermissionMessageProps {
  permission: Permission;
  status: boolean;
  isMod?: boolean;
}

export function permissionMessage({
  permission,
  status,
  isMod = false,
}: PermissionMessageProps) {
  if (permission != 'voice_chat' && permission != 'text_chat') return;

  const key: ValidPermissionString =
    `${permission}_${status ? 'enabled' : 'disabled'}${isMod ? '_mod' : ''}` as const;
  const message = permissionMessages[key];
  const icon = permissionsIcons[key];
  return (
    <>
      {icon}
      <p>{message}</p>
    </>
  );
}

export interface PermissionNotificationProps {
  permission: Permission;
  className?: string;
  isMod?: boolean;
}

export function PermissionNotification({
  permission,
  className,
  isMod,
}: PermissionNotificationProps) {
  return (
    <div
      key={permission}
      className={`flex gap-2.5 bg-chat-bubble-received rounded-xl mty-2 mx-4 py-2.5 px-4 text-md wrap-break-word leading-tight items-center ${className}`}
    >
      {permissionMessage({ permission: permission, status: false, isMod })}
    </div>
  );
}
