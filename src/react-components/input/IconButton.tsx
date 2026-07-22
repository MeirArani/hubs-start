import { createElement, type ComponentPropsWithoutRef } from 'react';
import type {
  PolymorphicForwardedRef,
  PolymorphicProps,
} from '@axa-ch/react-polymorphic-types';

export const IconButtonDefaultElement = 'button';

export type IconButtonAllowedElements =
  | typeof IconButtonDefaultElement
  | 'label';

export type IconButtonOwnProps<T extends IconButtonAllowedElements> =
  ComponentPropsWithoutRef<T> & {
    compactSm?: boolean;
    lg?: boolean;
    ref?: PolymorphicForwardedRef<T>;
  };

export type IconButtonProps<T extends IconButtonAllowedElements = 'button'> =
  PolymorphicProps<IconButtonOwnProps<T>, T, IconButtonAllowedElements>;

export default function IconButton<T extends IconButtonAllowedElements>({
  as = IconButtonDefaultElement,
  className,
  compactSm = false,
  lg = false,
  children,
  ref,
  ...rest
}: IconButtonProps<T>) {
  const styles = {
    compactSm: compactSm
      ? 'max-lg:flex-col max-lg: justify-center max-lg:*:mr-0 max-lg:*:mb-1 max-lg:last:mb-0'
      : '',
    lg: lg ? 'lg:text-sm lg:[&>svg]:w-6 lg:[&>svg]:h-6' : '',
  } as const;
  return createElement(
    as,
    {
      ...rest,
      ref,
      className: `group flex items-center gb-transparent border-0 border-transparent text-xs font-bold cursor-pointer *:mr-1 *:last:mr-0 hover:text-primary-hover active:text-primary-pressed focus:outline-none disabled:text-disabled-icon cursor-not-allowed ${compactSm} ${lg} ${className}`,
    },
    children,
  );
}

//TODO: Re-memoize this component
