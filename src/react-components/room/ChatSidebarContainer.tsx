import type { Scene } from 'aframe';
import React, {
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ChangeEvent,
} from 'react';
import { ChatContext } from './ChatContext';
import { useRole } from './hooks/useRole';
import { useMaintainScrollPosition } from '../misc/useMaintainScrollPosition';
import { usePermissions } from './hooks/usePermissions';
import { useRoomPermissions } from './hooks/useRoomPermissions';
import { MaxMessageLength } from '#/utils/chat-message-utils';
import {
  ChatInput,
  ChatLengthWarning,
  ChatMessageGroup,
  ChatMessageList,
  ChatSidebar,
  MessageAttachmentButton,
  PermissionMessageGroup,
  SendMessageButton,
  SpawnMessageButton,
  SystemMessage,
} from './ChatSidebar';
import { m } from '#/paraglide/messages';
import { PermissionNotification } from './PermissionNotifications';

export interface ChatSidebarContainerProps {
  scene: Scene;
  canSpawnMessages?: boolean;
  presences: unknown;
  occupantCount: number;
  initialValue?: string;
  autoFocus?: boolean;
  onClose: () => void;
}

export default function ChatSidebarContainer({
  scene,
  canSpawnMessages,
  presences,
  occupantCount,
  initialValue,
  autoFocus,
  onClose,
}: ChatSidebarContainerProps) {
  const { messageGroups, sendMessage, setMessagesRead } =
    useContext(ChatContext);
  const [onScrollList, listRef, scrolledToBottom] =
    useMaintainScrollPosition(messageGroups);
  const [message, setMessage] = useState(initialValue || '');
  const [isCommand, setIsCommand] = useState(false);
  const { text_chat: canTextChat } = usePermissions();
  const isMod = useRole({ role: 'owner' });
  const { textChat: textChatEnabled } = useRoomPermissions();
  const typingTimeoutRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!(e.target instanceof HTMLInputElement)) return;

      setIsCommand(e.target.value.startsWith('/'));
      if (!canTextChat && !isCommand) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (e.target.value.length <= MaxMessageLength) {
          sendMessage(e.target.value);
          setMessage('');
          // intentionally only doing this on "enter" press and not clicking of send button
          if (e.target.value.startsWith('/')) {
            onClose();
          }
        }
      }
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = window.setTimeout(
        () => window.APP.hubChannel?.endTyping(),
        500,
      );
      window.APP.hubChannel?.beginTyping();
    },
    [sendMessage, setMessage, onClose, canTextChat, isCommand],
  );

  const onSendMessage = useCallback(() => {
    sendMessage(message.substring(0, MaxMessageLength));
    setMessage('');
  }, [message, sendMessage, setMessage]);

  const onSpawnMessage = () => {
    // REIMP
    //spawnChatMessage(message);
    setMessage('');
  };

  const onUploadAttachments = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      // TODO: Right now there's no way to upload files to the chat only.
      // When we add the place menu whcih will have an explicit button for uploading files,
      // should we make this attach button only upload to chat?
      if (!e.target.files) return;
      for (const file of e.target.files) {
        scene.emit('add_media', file);
      }
    },
    [scene],
  );

  const onSelectEmoji = useCallback(
    ({
      emoji,
      pickerRemainedOpen,
    }: {
      emoji: string;
      pickerRemainedOpen: boolean;
    }) => {
      setMessage((message) => message + emoji);
      // If the picker remained open, avoid selecting the input so that the
      // user can keep picking emojis.
      if (!pickerRemainedOpen) inputRef.current?.select();
    },
    [setMessage, inputRef],
  );

  useEffect(() => {
    if (!autoFocus) return;
    if (!inputRef.current) return;

    inputRef.current.focus();
    const len = inputRef.current.value.length;
    inputRef.current?.setSelectionRange(len, len);
    // We only want this effect to run on initial mount even if autoFocus were to change.
    // This does not happen in practice, but this is more correct.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrolledToBottom && setMessagesRead) {
      setMessagesRead();
    }
  }, [messageGroups, scrolledToBottom, setMessagesRead]);

  // REIMP
  //     const discordBridges = discordBridgesForPresences(presences);
  //     const discordSnippet = discordBridges.map((ch) => '#' + ch).join(', ');
  //     let placeholder;

  //   if (occupantCount <= 1) {
  //     if (discordBridges.length === 0) {
  //       placeholder = intl.formatMessage(chatSidebarMessages['emmptyRoom']);
  //     } else {
  //       placeholder = intl.formatMessage(chatSidebarMessages['emmptyRoomBot'], {
  //         discordChannels: discordSnippet,
  //       });
  //     }
  //   } else {
  //     if (discordBridges.length === 0) {
  //       placeholder = intl.formatMessage(chatSidebarMessages['occupants'], {
  //         discordChannels: discordSnippet,
  //         occupantCount: occupantCount - 1,
  //       });
  //     } else {
  //       placeholder = intl.formatMessage(chatSidebarMessages['occupantsAndBot'], {
  //         discordChannels: discordSnippet,
  //         occupantCount: occupantCount - 1,
  //       });
  //     }
  //   }

  const isOverMaxLength = message.length > MaxMessageLength;
  const isDisabled = message.length === 0 || isOverMaxLength || !canTextChat;

  return (
    <ChatSidebar onClose={onClose}>
      <ChatMessageList ref={listRef} onScroll={onScrollList}>
        {messageGroups.map((entry) => {
          const { id, systemMessage, type } = entry;
          if (systemMessage) return <SystemMessage key={id} {...entry} />;
          if (type === 'permission')
            return <PermissionMessageGroup key={id} {...entry} />;
          return <ChatMessageGroup key={id} {...entry} />;
        })}
      </ChatMessageList>
      {!canTextChat && <PermissionNotification permission={'text_chat'} />}
      {!textChatEnabled && isMod && (
        <PermissionNotification permission={'text_chat'} isMod={true} />
      )}
      <ChatInput
        id="chat-input"
        ref={inputRef}
        onKeyDown={onKeyDown}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={''}
        value={message}
        isOverMaxLength={isOverMaxLength}
        warning={
          <>
            {message.length + 50 > MaxMessageLength && (
              <ChatLengthWarning
                messageLength={message.length}
                maxLength={MaxMessageLength}
              />
            )}
          </>
        }
        afterInput={
          <>
            {/* {!isMobile() && (
              <EmojiPickerPopoverButton onSelectEmoji={onSelectEmoji} />
            )} */}
            {message.length === 0 && canSpawnMessages ? (
              <MessageAttachmentButton onChange={onUploadAttachments} />
            ) : (
              <SendMessageButton
                onClick={onSendMessage}
                as={'button'}
                disabled={isDisabled && isCommand}
                title={
                  isDisabled && !isCommand
                    ? m['chat-sidebar-container.input-send-button.disabled']()
                    : undefined
                }
              />
            )}
            {canSpawnMessages && (
              <SpawnMessageButton
                disabled={isDisabled}
                onClick={onSpawnMessage}
                title={
                  isDisabled
                    ? m['chat-sidebar-container.input-send-button.disabled']()
                    : undefined
                }
              />
            )}
          </>
        }
      />
    </ChatSidebar>
  );
}
