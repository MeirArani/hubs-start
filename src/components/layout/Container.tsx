import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import '#/styles/sass/layout/Container.module.scss'

type ValidTag = 'section' | 'div'
export interface ContainerProps<T extends ValidTag = 'section'> {
  as?: T | ValidTag
  children: ReactNode
  className?: string
}

export default function Container<T extends ValidTag = 'section'>({
  as = 'section',
  children,
  className,
  ...rest
}: ContainerProps<T> & ComponentPropsWithoutRef<T>) {
  const Tag: ValidTag = as
  return (
    <Tag className={`container ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
