import {
  createElement,
  useRef,
  type ComponentPropsWithoutRef,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

import { m } from '#/paraglide/messages.js';
import { Link } from '@tanstack/react-router';
import type {
  PolymorphicForwardedRef,
  PolymorphicProps,
} from '@axa-ch/react-polymorphic-types';

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

export const ButtonDefaultElement = 'button';

export type ButtonAllowedElements = typeof ButtonDefaultElement | 'a' | 'span';

export type ButtonOwnProps<T extends ButtonAllowedElements> =
  ComponentPropsWithoutRef<T> & {
    preset?: ButtonPreset;
    sm?: boolean;
    lg?: boolean;
    xl?: boolean;
    leftAligned?: boolean;
    thin?: boolean;
    thick?: boolean;
    ref?: PolymorphicForwardedRef<T>;
  };

export type ButtonProps<T extends ButtonAllowedElements = 'button'> =
  PolymorphicProps<ButtonOwnProps<T>, T, ButtonAllowedElements>;

export default function Button<T extends ButtonAllowedElements>({
  as = ButtonDefaultElement,
  preset = 'basic',
  sm,
  lg,
  xl,
  thin,
  thick,
  leftAligned,
  className,
  children,
  ...rest
}: ButtonProps<T>) {
  const ref = useRef(null);

  const styles = {
    base:
      !sm && !lg && !xl && !thin && !thick ? 'min-w-39 min-h-12 text-sm' : '',
    aligned: leftAligned ? 'grid grid-cols-[1fr_5fr]' : 'flex justify-center',
    sm: sm ? 'h-8 min-h-8 min-w-25 py-0 text-sm' : '',
    lg: lg ? 'rounded-4xl h-16 text-base hg:h-12' : '',
    xl: xl ? 'rounded-4xl h-16 text-base' : '',
    thin: thin ? 'min-w-10.25 h-10.25 hover:text-text5-hover' : '',
    thick: thick ? 'h-13.25' : '',
  } as const;
  return createElement(
    as,
    {
      className: `w-min font-bold transition-colors whitespace-nowrap py-0 px-2 text-left items-center [&>svg]:mr-2  disabled:border-transparent disabled:cursor-not-allowed disabled:text-disabled-text disabled:opacity-70 disabled:bg-disabled ${presetStyles[preset]} ${styles['base']} ${styles['aligned']} ${styles['sm']} ${styles['lg']} ${styles['xl']} ${styles['thin']} ${styles['thick']} rounded-base ${className}`,
      ref: ref,
      type: 'button',
      ...rest,
    },
    children,
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

export function ApplyButton(props: ButtonProps) {
  return (
    <Button preset="accept" {...props}>
      {m['button.apply']()}
    </Button>
  );
}
