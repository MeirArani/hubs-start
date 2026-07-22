import {
  useRef,
  type ComponentPropsWithoutRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from 'react';
// import '#/styles/sass/input/Button.module.scss';

import { m } from '#/paraglide/messages.js';
import { Link } from '@tanstack/react-router';

const presetStyles = {
  basic:
    'border-lightgrey bg-white text-darkgrey border-2 [&>svg]:text-darkgrey hover:text-darkgrey-hover hover:bg-white-hover active:text-darkgrey-pressed active:bg-white-pressed',
  transparent:
    'bg-white text-darkgrey border-lightgrey border-2 [&>svg]:text-darkgrey hover:text-darkgrey-hover hover:bg-white-hover active:bg-white-pressed',
  primary: 'text-white bg-blue hover:bg-blue-hover active:bg-blue-pressed',
  accept: 'text-white bg-accept hover:bg-accept-hover active:bg-accept-pressed',
  cancel: 'text-white bg-cancel hover:bg-cancel-hover active:bg-cancel-pressed',
  accent1:
    'text-white bg-accent1 hover:bg-accent1-hover active:bg-accent1-pressed',
  accent2:
    'text-white bg-accent2 hover:bg-accent2-hover active:bg-accent2-pressed',
  accent3:
    'text-white bg-accent3 hover:bg-accent3-hover active:bg-accent3-pressed',
  accent4:
    'text-white bg-accent4 hover:bg-accent4-hover active:bg-accent4-pressed',
  accent5:
    'text-white bg-accent5 hover:bg-accent5-hover active:bg-accent5-pressed',
  accent6:
    'text-white bg-accent6 hover:text-accent6-hover hover:bg-accent6-hover active:bg-accent6-pressed',
  signin: 'border-2 border-blue bg-transparent text-blue rounded-[13px]!',
} as const;

export type ButtonPreset = keyof typeof presetStyles;

interface ButtonProps {
  as?: ValidTag;
  preset?: ButtonPreset;
  sm?: boolean;
  lg?: boolean;
  xl?: boolean;
  thin?: boolean;
  thick?: boolean;
  ref?: Ref<HTMLButtonElement>;
  className?: string;
  children?: ReactNode;
  onClick?: (e: MouseEvent) => void;
}

type ValidTag = 'button' | 'a' | 'span';
export default function Button<T extends ValidTag = 'button'>({
  as = 'button',
  preset = 'basic',
  sm,
  lg,
  xl,
  thin,
  thick,
  className,
  children,
  ...rest
}: ButtonProps & (ComponentPropsWithoutRef<T> & HTMLAttributes<Element>)) {
  const ref = useRef(null);
  const Tag: ValidTag = as;
  return (
    <Tag
      className={`w-min font-bold transition-colors whitespace-nowrap py-0 px-2 text-left grid grid-cols-[1fr_5fr] items-center [&>svg]:mr-2  disabled:border-transparent disabled:cursor-not-allowed disabled:text-disabled-text disabled:opacity-70 disabled:bg-disabled ${presetStyles[preset]} ${thin || sm || lg || xl ? '' : 'min-h-12 min-w-39'} ${sm ? 'h-8 min-h-8 min-w-25 py-0' : ''} ${lg || xl ? 'rounded-4xl h-16 text-base' : 'h-12 text-sm'} ${lg ? 'lg:h-12' : ''} ${xl ? 'h-16' : ''} ${thin ? 'min-w-10.25 h-10.25 hover:text-text5-hover' : ''} ${thick ? 'h-13.25' : ''} rounded-base ${className}`}
      ref={ref}
      type="button"
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function SignInButton({
  mobile,
  className,
  ...rest
}: { mobile?: boolean; className?: string } & ButtonProps) {
  return (
    <Button
      className={`${mobile ? 'flex lg:hidden' : 'hidden lg:flex'} ${className}`}
      {...rest}
      as="button"
      preset="signin"
      thick
    >
      <Link to="/signin">Sign in/Sign up</Link>
    </Button>
  );
}

export function TextButton({
  children,
  ...rest
}: { children: ReactNode } & ButtonProps) {
  return <Button {...rest}>{children}</Button>;
}

export function NextButton(
  props: ButtonProps &
    (ComponentPropsWithoutRef<'button'> & HTMLAttributes<Element>),
) {
  return (
    <Button preset="accept" type="submit" {...props}>
      {m['button.next']()}
    </Button>
  );
}

export function ContinueButton(props: ButtonProps) {
  return (
    <Button preset="accept" {...props}>
      {m['button.continue']()}
    </Button>
  );
}
