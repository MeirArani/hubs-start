import type { ComponentPropsWithoutRef, HTMLAttributes, ReactNode } from 'react'
import '#/styles/sass/layout/Column.module.scss'

type Size = 'sm' | 'md' | 'lg' | 'xl'
type Alignment = 'horizontal' | 'vertical' | 'both'
type ValidTag = 'div' | 'form'

export interface ColumnProps<T extends ValidTag = 'div'> {
  as?: T | ValidTag
  children: ReactNode
  lastChildMargin?: boolean
  gap?: Size | boolean
  padding?: boolean
  center?: boolean | Alignment
  centerMd?: boolean | Alignment
  grow?: boolean
  overflow?: boolean
  className?: string
}

export function Column<T extends ValidTag = 'div'>({
  as = 'div',
  children,
  lastChildMargin = true,
  gap = 'md',
  padding = false,
  center = false,
  centerMd = false,
  grow = false,
  overflow = false,
  className,
  ...rest
}: ColumnProps<T> &
  (ComponentPropsWithoutRef<T> & HTMLAttributes<HTMLOrSVGElement>)) {
  const gapClass = gap === true ? 'md-gap' : `${gap}-gap`
  const paddingClass = padding === true ? 'lg-padding' : `${padding}-padding`
  const centerClass =
    center === true || center === 'horizontal' || center === 'both'
      ? 'center'
      : undefined
  const centerVerticalClass =
    center === 'vertical' || center === 'both' ? 'center-vertical' : undefined
  const centerMdClass =
    centerMd === true || centerMd === 'horizontal' || centerMd === 'both'
      ? 'center-md'
      : undefined
  const centerVerticalMdClass =
    centerMd === 'vertical' || centerMd === 'both'
      ? 'center-vertical-md'
      : undefined

  const Tag: ValidTag = as
  return (
    <Tag
      className={`column ${gapClass} ${paddingClass} ${centerClass} ${centerVerticalClass} ${centerMdClass} ${centerVerticalMdClass} ${grow} ${overflow} ${lastChildMargin && 'margin-0-last-child'} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}
