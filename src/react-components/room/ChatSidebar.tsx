import { memo, type HTMLProps, type ReactNode, type Ref } from 'react';
import IconButton, { type IconButtonProps } from '../input/IconButton';
import WandIcon from '../icons/Wand.svg?react';
import SendIcon from '../icons/Send.svg?react';
import AttachIcon from '../icons/Attach.svg?react';
import { m } from '#/paraglide/messages';
import type {
  Message,
  ChatMessage,
  PermissionMessage,
} from '#/core/message-dispatch';
import { ParaglideMessage } from '@inlang/paraglide-js-react';
import ShareIcon from '../icons/Share.svg?react';
import { permissionMessage } from './PermissionNotifications';
import { CloseButton } from '../input/CloseButton';
import Sidebar, { type SidebarProps } from '../sidebar/Sidebar';
import type { TextAreaInputProps } from '../input/TextAreaInput';
import TextAreaInput from '../input/TextAreaInput';

export function SpawnMessageButton(props: IconButtonProps) {
  return (
    <IconButton className="chat-input-icon" {...props}>
      <WandIcon />
    </IconButton>
  );
}

export function SendMessageButton(props: IconButtonProps) {
  return (
    <IconButton className="chat-input-icon" {...props}>
      <SendIcon />
    </IconButton>
  );
}

export interface EmojiPickerPopoverButtonProps {
  onSelectEmoji: () => {};
  disabled: boolean;
}

// REIMP
// Memoize EmojiPickerPopoverButton since we don't want it re-rendering
// the EmojiPicker unnecessarily.
export const EmojiPickerPopoverButton = memo(function ({
  onSelectEmoji,
  disabled,
}: EmojiPickerPopoverButtonProps) {
  // We're using a ref here, since we don't want to re-render anything, but we
  // do want to know if the Shift key is down when an emoji is selected.
  const deleteOnReimp = disabled;
  return <></>;
  //   const shiftKeyDown = useRef(false);

  //   useEffect(() => {
  //     const onKeyDown = e => {
  //       if (e.key === "Shift") shiftKeyDown.current = true;
  //     };
  //     const onKeyUp = e => {
  //       if (e.key === "Shift") shiftKeyDown.current = false;
  //     };

  //     window.addEventListener("keydown", onKeyDown);
  //     window.addEventListener("keyup", onKeyUp);

  //     return () => {
  //       window.removeEventListener("keydown", onKeyDown);
  //       window.removeEventListener("keyup", onKeyUp);
  //     };
  //   }, []);

  //   return (
  //     <Popover
  //       title=""
  //       popoverClass="emojiPopover"
  //       showHeader={false}
  //       content={({ closePopover }) => (
  //         <EmojiPicker
  //           onEmojiClick={emoji => {
  //             const keepPickerOpen = shiftKeyDown.current;
  //             onSelectEmoji({ emoji: emoji.emoji, pickerRemainedOpen: keepPickerOpen });
  //             // Keep the picker open if the Shift key was held down to allow
  //             // for multiple emoji selections.
  //             if (!keepPickerOpen) closePopover();
  //           }}
  //         />
  //       )}
  //       placement="top"
  //       offsetDistance={28}
  //     >
  //       {({ togglePopover, popoverVisible, triggerRef }) => (
  //         <IconButton
  //           ref={triggerRef}
  //           className="chat-input-icon"
  //           selected={popoverVisible}
  //           onClick={togglePopover}
  //           disabled={disabled}
  //         >
  //           <ReactionIcon />
  //         </IconButton>
  //       )}
  //     </Popover>
  //   );
});

export function MessageAttachmentButton(props: HTMLProps<HTMLInputElement>) {
  return (
    <>
      <IconButton
        as="label"
        className="chat-input-icon"
        disabled={props.disabled}
      >
        <AttachIcon />
        <input type="file" {...props} disabled={props.disabled} />
      </IconButton>
    </>
  );
}

export interface ChatLengthWarningProps {
  messageLength: number;
  maxLength: number;
}

export function ChatLengthWarning({
  messageLength,
  maxLength,
}: ChatLengthWarningProps) {
  return (
    <p
      className={`chat-input-warning ${messageLength > maxLength ? 'warning-text-color' : ''}`}
    >
      {m['chat-message-input.warning-max-characters']()}
      {` (${messageLength}/${maxLength})`}
    </p>
  );
}

export interface ChatInputProps extends TextAreaInputProps {
  warning?: ReactNode;
  isOverMaxLength?: boolean;
  onSpawn?: () => {};
}
export function ChatInput({
  warning,
  isOverMaxLength,
  ref,
  ...props
}: ChatInputProps) {
  return (
    <div className="chat-input-container">
      <TextAreaInput
        ref={ref}
        textInputStyles="chatInputTextAreaStyles"
        className={`${isOverMaxLength ? 'warning-border' : ''}`}
        placeholder={m['chat-sidebar.input.placeholder']()}
        {...props}
      />
      {warning}
    </div>
  );
}

const enteredMessages = {};

export function formatSystemMessage(entry: Message) {
  switch (entry.message.type) {
    case 'join':
      break;
    case 'entered':
      break;
    case 'leave':
      return m['chat-sidebar.system-message.leave']({
        name: entry.message.name,
      });
    case 'display_name_changed':
      return (
        <ParaglideMessage
          message={m['chat-sidebar.system-message.name-change']}
          inputs={{
            oldName: entry.message.oldName,
            newName: entry.message.newName,
          }}
          markup={{ b: ({ children }) => <b>{children}</b> }}
        />
      );
    case 'scene_changed':
      return (
        <ParaglideMessage
          message={m['chat-sidebar.system-message.scene-change']}
          inputs={{
            name: entry.message.name,
            sceneName: entry.message.sceneName,
          }}
          markup={{ b: ({ children }) => <b>{children}</b> }}
        />
      );
    case 'hub_name_changed':
      return (
        <ParaglideMessage
          message={m['chat-sidebar.system-message.hub-name-change']}
          inputs={{ name: entry.message.name, hubName: entry.message.hubName }}
          markup={{ b: ({ children }) => <b>{children}</b> }}
        />
      );
    case 'hub_changed':
      return (
        <ParaglideMessage
          message={m['chat-sidebar.system-message.hub-change']}
          inputs={{ hubName: entry.message.hubName }}
          markup={{ b: ({ children }) => <b>{children}</b> }}
        />
      );
    case 'log':
      break;
    default:
      return null;
  }
}
export interface SystemMessageProps extends Message {
  timestamp?: any;
  showLineBreak?: boolean;
}

export function SystemMessage(props: SystemMessageProps) {
  return (
    <li className="message-group system-message">
      {props.showLineBreak && <hr />}
      <p className="message-group-label">
        <i>{formatSystemMessage(props)}</i>
        <span>{/* {FormatTime} */}</span>
      </p>
    </li>
  );
}

interface MessageBubbleProps {
  media?: boolean;
  monospace?: boolean;
  emoji?: boolean;
  children?: ReactNode;
  permission?: boolean;
}

function MessageBubble({
  media,
  monospace,
  emoji,
  children,
  permission,
}: MessageBubbleProps) {
  return (
    <div
      className={`message-bubble ${media ? 'media' : ''} ${emoji ? '' : ''} ${monospace ? 'monospace' : ''} ${permission ? '' : ''}`}
    >
      {children}
    </div>
  );
}

function getMessageComponent(message: ChatMessage) {
  const onShareClick = async () => {
    // REIMP
    try {
    } catch (error) {
      console.error(`while sharing (from chat sidebar): ${error}`);
    }
  };

  switch (message.type) {
    case 'chat': {
      const { formattedBody, monospace, emoji } = formatMessageBody(
        message.body,
      );
      return (
        <MessageBubble key={message.id} monospace={monospace} emoji={emoji}>
          {formattedBody}
        </MessageBubble>
      );
    }
    case 'video': {
      return (
        <div className="message-row">
          <MessageBubble key={message.id} media>
            <video controls src={message.body.src} />
          </MessageBubble>
          <IconButton
            className="icon-button"
            onClick={onShareClick}
            title={m['share-popover.title']()}
          >
            <ShareIcon />
          </IconButton>
        </div>
      );
    }
    case 'image':
    case 'photo': {
      return (
        <div className="message-row">
          <MessageBubble key={message.id} media>
            <img src={message.body.src} />
          </MessageBubble>
          <IconButton
            className="icon-button"
            onClick={onShareClick}
            title={m['share-popover.title']()}
          >
            <ShareIcon />
          </IconButton>
        </div>
      );
    }
    case 'permission': {
      return (
        <MessageBubble key={message.id} media>
          <img src={message.body.src} />
        </MessageBubble>
      );
    }
    default:
      return null;
  }
}

export interface ChatMessageGroupProps {
  sent?: boolean;
  sender?: string;
  timestamp?: any;
  messages?: ChatMessage[];
}

export function ChatMessageGroup({
  sent,
  sender,
  timestamp,
  messages,
}: ChatMessageGroupProps) {
  return (
    <li className={`message-group ${sent ? 'sent' : ''}`}>
      <p className="message-group-label">
        {sender} // TODO: Timestamp stuff here
      </p>
      <ul className="message-group-messages">
        {messages?.map((message) => (
          <li key={message.id}>{getMessageComponent(message)}</li>
        ))}
      </ul>
    </li>
  );
}

export interface PermissionMessageGroupProps {
  sent?: boolean;
  timestamp?: any;
  messages?: PermissionMessage[];
}
export function PermissionMessageGroup({
  sent,
  timestamp,
  messages,
}: PermissionMessageGroupProps) {
  return (
    <li className={`message-group ${sent ? 'sent' : ''}`}>
      <p className="message-group-label">// TODO: Timestamp</p>
      <ul className="message-group-messages">
        {messages?.map((message) => (
          <li key={message.id}>
            <MessageBubble permission>
              {permissionMessage({
                permission: message.body.permission,
                status: message.body.status,
              })}
            </MessageBubble>
          </li>
        ))}
      </ul>
    </li>
  );
}

export interface ChatMessageListProps extends HTMLProps<HTMLUListElement> {
  children: ReactNode;
  ref: Ref<HTMLUListElement>;
}
export function ChatMessageList({
  children,
  ref,
  ...rest
}: ChatMessageListProps) {
  <ul {...rest} className="" ref={ref}>
    {children}
  </ul>;
}

export interface ChatSidebarProps extends SidebarProps {
  onClose?: () => {};
  onScrollList?: () => {};
  children: ReactNode;
  listRef: Ref<HTMLUListElement>;
}

export function ChatSidebar({
  onClose,
  onScrollList,
  children,
  listRef,
  ...rest
}: ChatSidebarProps) {
  return (
    <Sidebar
      title={m['chat-sidebar.title']()}
      beforeTitle={<CloseButton onClick={onClose} />}
      contentClassName="content"
      disableOverflowScroll
      {...rest}
    >
      {children}
    </Sidebar>
  );
}
