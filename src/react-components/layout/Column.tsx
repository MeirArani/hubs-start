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
  const padStyles = {
    '2xs': 'p-1',
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
    xl: 'p-6',
    '2xl': 'p-7',
  } as const;
  const gapStyles = {
    '2xs': '*:mb-1',
    xs: '*:mb-2',
    sm: '*:mb-3',
    md: '*:mb-4',
    lg: '*:mb-5',
    xl: '*:mb-6',
    '2xl': '*:mb-7',
  } as const;

  const styles = {
    centerHorz:
      center === true || center === 'horizontal'
        ? 'items-center text-center'
        : '',
    centerVert:
      center === 'vertical' || center === 'both' ? 'justify-center' : '',
    centerMdHorz:
      centerMd === true || centerMd === 'horizontal'
        ? 'lg:items-center lg:text-center'
        : '',
    centerMdVert:
      centerMd === 'vertical' || centerMd === 'both' ? 'lg:justify-center' : '',
    gap:
      gap === true
        ? gapStyles['md']
        : typeof gap === 'string'
          ? gapStyles[gap]
          : '',
    pad:
      padding === true
        ? padStyles['md']
        : typeof padding === 'string'
          ? padStyles[padding]
          : '',
    grow: grow ? 'grow' : '',
    overflow: overflow ? 'overflow-y-auto' : '',
    lastChild: lastChildMargin ? 'last:mb-0' : '',
  } as const;

  const Tag: ValidTag = as;
  return (
    <Tag
      className={`flex flex-col shrink-0 ${styles['centerHorz']} ${styles['centerVert']} ${styles['centerMdHorz']} ${styles['centerMdVert']} ${styles['gap']} ${styles['grow']} ${styles['overflow']} ${styles['lastChild']} ${styles['pad']} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
