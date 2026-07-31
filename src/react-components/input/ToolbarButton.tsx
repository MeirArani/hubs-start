import React, { useContext, type ReactNode, type Ref } from 'react';
import type { SVG } from '../icons/SVGIcon';
import SVGIcon from '../icons/SVGIcon';
import '@/styles/tailwind/input/ToolbarButton.module.css';
import { m } from '#/paraglide/messages';
import ToolTip from '../layout/ToolTip';
import ChatIcon from '../icons/Chat.svg?react';
import { ChatContext } from '../room/ChatContext';

// export const presets = [
//   'basic',
//   'transparent',
//   'accept',
//   'cancel',
//   'accent1',
//   'accent2',
//   'accent3',
//   'accent4',
//   'accent5',
// ]
// export const types = ['none', 'left', 'middle', 'right']

// export const statusColors = ['recording', 'unread', 'enabled', 'disabled']

export type StatusColor = 'recording' | 'unread' | 'enabled' | 'disabled';

export type ButtonType = 'none' | 'left' | 'middle' | 'right';

const t = <div className="" />;

const presetClasses = {
  basic: {
    icon: 'border-border-primary bg-bg-primary disabled:border-white disabled:bg-lightgrey hover:border hover:border-gray-200 hover:bg-gray-100 hover:disabled:border-transparent hover:disabled:bg-gray-300 active:bg-gray-400 active:border-gray-300',
    selected:
      'border-transparent bg-transparent [&>svg]:text-black [&>label]:text-gray-400',
  },
  transparent: {
    icon: 'border-transparent bg-white disabled:border-white disabled:bg-lightgrey hover:border hover:border-gray-200 hover:bg-gray-100 hover:disabled:border-transparent hover:disabled:bg-gray-300 active:bg-gray-400 active:border-gray-300',
    selected:
      'border-transparent bg-transparent [&>svg]:text-black [&>label]:text-gray-400 hover:[&>.icon-container]:bg-gray-400 active:[&>.icon-container]:bg-gray-300',
  },
  primary: {
    icon: 'bg-active hover:bg-primary-hover active:bg-primary-pressed',
    svg: '',
    selected:
      'bg-transparent border-primary [&>svg]:text-black [&>label]:text-primary',
  },
  accept: {
    icon: 'bg-accept border-accept-border hover:bg-accept-hover active:bg-accept-pressed',
  },
  cancel: {
    icon: 'bg-cancel border-none hover:bg-cancel-hover active:bg-cancel-pressed',
  },
  accent1: {
    icon: 'bg-accent1 border-accent1-border hover:bg-accent1-hover active:accent-accent1-pressed',
  },
  accent2: {
    icon: 'bg-accent2 border-accent2-border hover:bg-accent2-hover active:accent-accent2-pressed',
  },
  accent3: {
    icon: 'bg-accent3 border-accent3-border hover:bg-accent3-hover active:accent-accent3-pressed',
  },
  accent4: {
    icon: 'bg-accent4 border-accent4-border hover:bg-accent4-hover active:accent-accent4-pressed',
  },
  accent5: {
    icon: 'bg-accent5 border-accent5-border hover:bg-accent5-hover active:accent-accent5-pressed',
  },
} as const;

const statusColors = {
  enabled: 'bg-accept',
  disabled: 'bg-cancel',
  recording: 'bg-red',
  unread: 'bg-orange',
} as const;

const typeStyle = {
  left: 'w-12 rounded-none rounded-tl-full rounded-bl-full',
  middle: 'rounded-none',
  right: 'w-12 rounded-none rounded-tr-full rounded-br-full',
  none: '',
} as const;

export default function ToolbarButton({
  preset = 'basic',
  className,
  iconContainerClassName,
  children,
  icon,
  label,
  title,
  selected = false,
  large = false,
  statusColor,
  type = 'none',
  disabled = false,
  onClick,
  ref,
  ...rest
}: {
  preset?: keyof typeof presetClasses;
  className?: string;
  iconContainerClassName?: string;
  children?: ReactNode;
  icon?: SVG;
  label?: ReactNode;
  title?: string;
  selected?: boolean;
  large?: boolean;
  statusColor?: StatusColor;
  type?: ButtonType;
  disabled?: boolean;
  onClick: React.MouseEventHandler;
  ref?: Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={ref}
      className={`flex flex-col items-center w-12 ${className}`}
      disabled={disabled}
      title={title}
      onClick={onClick}
      {...rest}
    >
      <div
        className={`relative border rounded-full w-12 h-12 flex justify-center items-center  transition-colors ${large ? 'w-24 h-24' : ''} ${iconContainerClassName} ${presetClasses[preset]['icon']} `}
        // disabled={disabled}
        aria-hidden="true"
      >
        {icon && (
          <SVGIcon
            className={`text-black *:[stroke="\#000"]:transition *:[fill="\#000"]:transition disabled:text-gray-400 hover:disabled:text-gray-400}`}
            SVG={icon}
          />
        )}
        {statusColor && (
          <div
            className={`absolute top-1.25 w-1.25 h-1.25 rounded-1.25 ${statusColors[statusColor]}`}
          />
        )}
        {children}
      </div>
      {label && (
        <label
          className="cursor-pointer text-text1 text-xs mt-2 mb-0.75 whitespace-nowrap disabled:cursor-default"
          //   disabled={disabled}
        >
          {label}
        </label>
      )}
    </button>
  );
}

interface ChatToolbarButtonProps {
  onClick: () => void;
  selected?: boolean;
}

export function ChatToolbarButton({
  onClick,
  selected = false,
}: ChatToolbarButtonProps) {
  const { unreadMessages } = useContext(ChatContext);
  return (
    <ToolTip description={m['chat-tooltip.description']()}>
      <ToolbarButton
        onClick={onClick}
        statusColor={unreadMessages ? 'unread' : undefined}
        icon={ChatIcon}
        preset="accent4"
        label={m['chat-toolbar-button']()}
        selected={selected}
        className="**:stroke-white"
      />
    </ToolTip>
  );
}
