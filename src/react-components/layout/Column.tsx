import type {
  ComponentPropsWithoutRef,
  HTMLAttributes,
  ReactNode,
} from 'react';
// import '#/styles/sass/layout/Column.module.scss'

type Size = '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type Alignment = 'horizontal' | 'vertical' | 'both';
type ValidTag = 'div' | 'form';

export interface ColumnProps<T extends ValidTag = 'div'> {
  as?: T | ValidTag;
  children: ReactNode;
  lastChildMargin?: boolean;
  gap?: Size | boolean;
  padding?: boolean | Size;
  center?: boolean | Alignment;
  centerMd?: boolean | Alignment;
  grow?: boolean;
  overflow?: boolean;
  className?: string;
}

export function Column<T extends ValidTag = 'div'>({
  as = 'div',
  children,
  lastChildMargin = true,
  padding = false,
  center = false,
  gap = false,
  centerMd = false,
  grow = false,
  overflow = false,
  className,
  ...rest
}: ColumnProps<T> &
  (ComponentPropsWithoutRef<T> & HTMLAttributes<HTMLOrSVGElement>)) {
  const centerClass =
    center === true || center === 'horizontal' || center === 'both'
      ? 'items-center text-center'
      : '';
  const centerVerticalClass =
    center === 'vertical' || center === 'both' ? 'justify-center' : '';
  const centerMdClass =
    centerMd === true || centerMd === 'horizontal' || centerMd === 'both'
      ? 'lg:items-center lg:text-center'
      : '';
  const centerVerticalMdClass =
    centerMd === 'vertical' || centerMd === 'both' ? 'lg:justify-center' : '';

  const gapStyles = {
    '2xs': '*:mb-1',
    xs: '*:mb-2',
    sm: '*:mb-3',
    md: '*:mb-4',
    lg: '*:mb-5',
    xl: '*:mb-6',
    '2xl': '*:mb-7',
  } as const;

  const gapStyle =
    gap === true
      ? gapStyles['md']
      : typeof gap === 'string'
        ? gapStyles[gap]
        : '';

  const Tag: ValidTag = as;
  return (
    <Tag
      className={`p-5 flex flex-col shrink-0 ${centerClass} ${centerVerticalClass} ${centerMdClass} ${centerVerticalMdClass} ${gapStyle} ${grow ? 'grow' : ''} ${overflow ? 'overflow-y-auto' : ''} ${lastChildMargin ? 'last:mb-0' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
