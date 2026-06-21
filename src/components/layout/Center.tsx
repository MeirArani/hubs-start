import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import '#/styles/sass/layout/Center.module.scss'

export interface CenterProps {
  children: ReactNode
  className?: string
}

export function Center({
  children,
  className,
  ...rest
}: CenterProps & ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={`center ${className}`} {...rest}>
      {children}
    </div>
  )
}
