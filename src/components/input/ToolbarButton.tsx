import React, { type ReactNode, type Ref } from 'react'
import '@/styles/sass/input/ToolbarButton.module.scss'

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

export type Preset =
  | 'basic'
  | 'transparent'
  | 'accept'
  | 'cancel'
  | 'accent1'
  | 'accent2'
  | 'accent3'
  | 'accent4'
  | 'accent5'

export type StatusColor = 'recording' | 'unread' | 'enabled' | 'disabled'

export type ButtonType = 'none' | 'left' | 'middle' | 'right'

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
  type,
  disabled = false,
  onClick,
  ref,
  ...rest
}: {
  preset?: Preset
  className?: string
  iconContainerClassName?: string
  children?: ReactNode
  icon?: ReactNode
  label?: ReactNode
  title?: string
  selected?: boolean
  large?: boolean
  statusColor?: StatusColor
  type?: ButtonType
  disabled?: boolean
  onClick: React.MouseEventHandler
  ref: Ref<HTMLButtonElement>
}) {
  return (
    <button
      ref={ref}
      className={`toolbar-button preset type ${selected} ${large} ${className}`}
      disabled={disabled}
      title={title}
      onClick={onClick}
      {...rest}
    >
      <div
        className={`icon-container ${iconContainerClassName}`}
        // disabled={disabled}
        aria-hidden="true"
      >
        {icon}
        {statusColor && (
          <div className={`status-indicator status-${statusColor}`} />
        )}
        {children}
      </div>
      {label && (
        <label
        //   disabled={disabled}
        >
          {label}
        </label>
      )}
    </button>
  )
}
