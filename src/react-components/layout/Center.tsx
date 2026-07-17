import type { ComponentPropsWithoutRef, ReactNode } from 'react';
// import '#/styles/sass/layout/Center.module.scss'

export interface CenterProps {
  children: ReactNode;
  className?: string;
}

export function Center({
  children,
  className,
  ...rest
}: CenterProps & ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={`flex justify-center items-center flex-1 h-full ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
