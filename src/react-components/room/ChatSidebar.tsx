import {
  memo,
  type HTMLAttributes,
  type HTMLProps,
  type ReactNode,
  type Ref,
} from 'react';
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
import { formatMessageBody } from '#/utils/chat-message-utils';

export function SpawnMessageButton(
  props: IconButtonProps<'button'> & React.ComponentPropsWithRef<'button'>,
) {
  return (
    <IconButton
      className="cursor-pointer w-6 disabled:cursor-default"
      {...props}
    >
      <WandIcon className="text-input-icon" />
    </IconButton>
  );
}

export function SendMessageButton(props: IconButtonProps) {
  return (
    <IconButton
      className="cursor-pointer w-6 disabled:cursor-default"
      {...props}
    >
      <SendIcon className="text-input-icon" />
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
  //           className="cursor-pointer w-6 disabled:cursor-default"
  //           selected={popoverVisible}
  //           onClick={togglePopover}
  //           disabled={disabled}
  //         >
  //           <ReactionIcon classname='text-input-icon' />
  //         </IconButton>
  //       )}
  //     </Popover>
  //   );
});

export function MessageAttachmentButton(props: HTMLProps<HTMLInputElement>) {
  return (
    <>
      <IconButton
        // as="label"
        className="cursor-pointer w-6 disabled:cursor-default"
        disabled={props.disabled}
      >
        <AttachIcon className="text-input-icon" />
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
    <p className={`pt-2xs ${messageLength > maxLength ? 'text-red' : ''}`}>
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
    <div className="py-2 px-4 bg-input basis-[max-content]">
      <TextAreaInput
        ref={ref}
        textInputStyles="chatInputTextAreaStyles resize-none leading-normal p-2"
        className={`${isOverMaxLength ? 'border-2! border-red!' : ''}`}
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
    <li className="flex flex-col shrink-0 w-full pt-4 last:pb-2">
      {props.showLineBreak && <hr />}
      <p className="inline align-bottom">
        <i className="text-xs text-text-secondary">
          {formatSystemMessage(props)}
        </i>
        <span className="ml-[1ch]">{/* {FormatTime} */}</span>
      </p>
    </li>
  );
}

interface MessageBubbleProps {
  media?: boolean;
  monospace?: boolean;
  emoji?: boolean;
  children?: ReactNode;
  sent?: boolean;
  permission?: boolean;
}

function MessageBubble({
  media,
  monospace,
  emoji,
  sent,
  children,
  permission,
}: MessageBubbleProps) {
  const styles = {
    sent: sent
      ? 'bg-chat-bubble-sent text-chat-bubble-sent self-end [&>a]:text-chat-bubble-text-sent [&>a]:hover:text-chat-bubble-link-sent-hover [&>a]:active:bg-chat-bubble-link-sent-pressed'
      : 'bg-chat-bubble-received ',
    monospace: monospace ? 'font-mono' : '',
    permission: permission
      ? 'flex gap-2.5 bg-transparent border border-input-border text-text-primary items-center'
      : '',
    emojiMedia: emoji || media ? 'text-[32px] bg-transparent p-0' : '',
  } as const;
  return (
    <div
      className={`rounded-2xl m-0.5 py-2.5 px-4 max-w-4/5 w-max text-md wrap-break-word leading-tight [&>img,video]:max-h-60 [&>img,video]:rounded-2xl [&>a]:underline ${styles['sent']} ${styles['monospace']} ${styles['permission']} ${styles['emojiMedia']}`}
    >
      {children}
    </div>
  );
}

function getMessageComponent(message: ChatMessage, sent?: boolean) {
  const onShareClick = async () => {
    // REIMP
    try {
    } catch (error) {
      console.error(`while sharing (from chat sidebar): ${error}`);
    }
  };

  const styles = {
    sent: {
      'message-row': sent ? 'flex flex-row-reversed justify-end' : '',
      'message-bubble': sent ? '' : '',
    },
  } as const;

  switch (message.type) {
    case 'chat': {
      const { formattedBody, monospace, emoji } = formatMessageBody({
        body: message.body,
      });
      return (
        <MessageBubble
          sent={sent}
          key={message.id}
          monospace={monospace}
          emoji={emoji}
        >
          {formattedBody}
        </MessageBubble>
      );
    }
    case 'video': {
      return (
        <div className={`flex justify-start ${styles['sent']}`}>
          <MessageBubble key={message.id} media sent={sent}>
            <video controls src={message.body.src} />
          </MessageBubble>
          <IconButton
            className="w-12 h-12 flex shrink-0 justify-center items-center cursor-pointer rounded-2xl bg-transparent hover:pointer-fine:text-primary-hover"
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
        <div className={`flex justify-start ${styles['sent']}`}>
          <MessageBubble key={message.id} media sent={sent}>
            <img src={message.body.src} />
          </MessageBubble>
          <IconButton
            className="w-12 h-12 flex shrink-0 justify-center items-center cursor-pointer rounded-2xl bg-transparent hover:pointer-fine:text-primary-hover"
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
        <MessageBubble key={message.id} media sent={sent}>
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
    <li className="flex flex-col grow list-none py-0 px-4 overflow-y-auto min-h-0">
      <p
        className={`text-text-secondary font-xs flex m-0.5 ${sent ? `self-end` : ``}`}
      >
        {sender} // TODO: Timestamp stuff here
      </p>
      <ul className="flex flex-col">
        {messages?.map((message) => (
          <li key={message.id}>{getMessageComponent(message, sent)}</li>
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
    <li className="flex flex-col shrink-0 w-full pt-4 last:pb-2">
      <p
        className={`text-text-secondary text-xs flex m-0.5 ${sent ? 'self-end' : ''}`}
      >
        // TODO: Timestamp
      </p>
      <ul className="flex flex-col">
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
  return (
    <ul
      {...rest}
      className="flex flex-col grow list-none py-0 px-4 overflow-y-auto min-h-0"
      ref={ref}
    >
      {children}
    </ul>
  );
}

export interface ChatSidebarProps extends SidebarProps {
  onClose?: () => void;
  onScrollList?: () => {};
  children: ReactNode;
  listRef?: Ref<HTMLUListElement>;
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
      disableOverflowScroll
      {...rest}
    >
      {children}
    </Sidebar>
  );
}
