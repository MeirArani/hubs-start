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

export default function IconButtonInner<T extends IconButtonAllowedElements>({
  as = IconButtonDefaultElement,
  className,
  compactSm = false,
  lg = false,
  children,
  ref,
  ...rest
}: IconButtonProps<T>) {
  return createElement(
    as,
    {
      ...rest,
      ref,
      className: `icon-button ${compactSm && 'compact-sm'} ${lg && 'lg'} ${className}`,
    },
    children,
  );
}

//TODO: Re-memoize this component
