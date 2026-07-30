import type { IconButtonProps } from './IconButton';
import IconButton from './IconButton';
import ChevronBackIcon from '../icons/ChevronBack.svg?react';
import { m } from '#/paraglide/messages';

export default function BackButton(props: IconButtonProps) {
  return (
    <IconButton className="-ml-2 flex" {...props}>
      <ChevronBackIcon className="group-hover:*:stroke-primary-hover group-active:*:stroke-primary-pressed group-disabled:*:stroke-disabled-icon" />
      <span>{m['back-button']()}</span>
    </IconButton>
  );
}
