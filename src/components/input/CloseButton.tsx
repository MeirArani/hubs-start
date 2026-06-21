import IconButton, { type IconButtonProps } from './IconButton'
import CloseIcon from '../icons/Close.svg?react'
import '#/styles/sass/input/CloseButton.module.scss'

export interface CloseButtonProps {
  lg?: boolean
  className?: string
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

export function CloseButton({
  lg = false,
  className,
  onClick,
  ...rest
}: CloseButtonProps & IconButtonProps) {
  return (
    <IconButton
      className={`${lg && 'lg'} ${className}`}
      onClick={onClick}
      {...rest}
    >
      <CloseIcon width={16} height={16} />
    </IconButton>
  )
}
