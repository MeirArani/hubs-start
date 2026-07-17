import type { ComponentPropsWithoutRef, ReactNode } from 'react';
// import '#/styles/sass/layout/Container.module.scss'

type ValidTag = 'section' | 'div';
export interface ContainerProps<T extends ValidTag = 'section'> {
  as?: T | ValidTag;
  children: ReactNode;
  className?: string;
}

export default function Container<T extends ValidTag = 'section'>({
  as = 'section',
  children,
  className,
  ...rest
}: ContainerProps<T> & ComponentPropsWithoutRef<T>) {
  const Tag: ValidTag = as;
  return (
    <Tag
      className={`flex m-auto max-w-full sm:max-w-135 md:max-w-180 lg:max-w-240 xl:max-w-285 ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
