import { memo, useRef, type ReactNode } from 'react';

// import '#/styles/sass/input/IconButton.module.scss'

type ValidTag = 'button' | 'label';
export interface IconButtonProps<T extends ValidTag = 'button'> {
  as?: T | ValidTag;
  className?: string;
  compactSm?: boolean;
  lg?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children?: ReactNode;
}
const IconButton = memo(function IconButton<T extends ValidTag = 'button'>({
  as = 'button',
  className,
  compactSm = false,
  lg = false,
  onClick,
  children,
  ...rest
}: IconButtonProps<T> & React.ComponentPropsWithoutRef<T>) {
  const Tag: ValidTag = as;
  1;
  const buttonProps =
    Tag === 'button' ? ({ type: 'button', onClick: onClick } as const) : {};
  const ref = useRef(null);
  return (
    <Tag
      className={`icon-button ${compactSm && 'compact-sm'} ${lg && 'lg'} ${className}`}
      {...buttonProps}
      {...rest}
      ref={ref}
    >
      {children}
    </Tag>
  );
});

export default IconButton;
