import type { ComponentPropsWithoutRef, ReactNode } from 'react';
// import '@/styles/sass/room/ContentMenu.module.scss';
import ObjectsIcon from '../icons/Objects.svg';
import PeopleIcon from '../icons/People.svg';
import { m } from '@/paraglide/messages.js';
import { joinChildren } from '../misc/joinChildren';

interface ContentMenuButtonProps extends ComponentPropsWithoutRef<'button'> {
  active?: boolean;
  disabled?: boolean;
  children?: ReactNode;
}

export function ContentMenuButton({
  active = false,
  disabled = false,
  children,
  ...props
}: ContentMenuButtonProps & ComponentPropsWithoutRef<'button'>) {
  return (
    <button
      className={`flex border-none rounded bg-transparent text-xs font-bold items-center py-2 px-2.5 *:mr-2 *:last:mr-0 hover:bg-button-hover active:bg-button-pressed *:[svg]:text-black ${active ? 'text-text5 hover:bg-active-hover active:bg-active-pressed' : ''} ${disabled ? 'pointer-events-none bg-transparent' : ''} `}
      {...props}
    >
      {children}
    </button>
  );
}

export function ECSDebugMenuButton(props: ContentMenuButtonProps) {
  return (
    <ContentMenuButton {...props}>
      <ObjectsIcon />
      <span>{m['content-menu.ecs-debug-menu-button']()}</span>
    </ContentMenuButton>
  );
}

export function ObjectMenuButton(props: ContentMenuButtonProps) {
  return (
    <ContentMenuButton {...props}>
      <ObjectsIcon />
      <span>{m['content-menu.objects-menu-button']()}</span>
    </ContentMenuButton>
  );
}

export interface PeopleMenuButtonProps extends ContentMenuButtonProps {
  presencecount?: number;
}
export function PeopleMenuButton(props: PeopleMenuButtonProps) {
  return (
    <ContentMenuButton {...props}>
      <PeopleIcon />
      <span>
        {m['content-menu.people-menu-button']({
          presenceCount: props.presencecount || 0,
        })}
      </span>
    </ContentMenuButton>
  );
}

export function ContentMenu({ children }: { children?: ReactNode }) {
  return (
    <div className="absolute top-2 right-2 flex bg-button border border-button-border rounded-xl pointer-events-auto p-1 text-black lg:t-6 r-6">
      {joinChildren(children, () => (
        <div className="w-px my-0 mx-2" />
      ))}
    </div>
  );
}
