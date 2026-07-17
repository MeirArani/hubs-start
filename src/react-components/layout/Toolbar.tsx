// import '@/styles/sass/layout/Toolbar.module.scss';
// import '@/styles/sass/style-utils.module.scss';
import type { ReactNode } from 'react';

export function Toolbar({
  className,
  left,
  center,
  right,
  ...rest
}: {
  className?: string;
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}) {
  // center used to have absolute w-[calc(100%-48px)]
  return (
    <div
      className={`relative h-24 flex justify-between p-3 bg-background1 border-t-border1 lg:py-3 lg:px-6 lg:justify-between ${className}`}
      {...rest}
    >
      <div
        className={`flex justify-around items-center gap-y-0 gap-x-6 lg:flex-0 show-lg`}
      >
        {left}
      </div>
      <div
        className={`flex items-center gap-y-0 gap-x-6 lg:flex-0 show-lg justify-center  lg:w-full lg:relative lg:justify-around lg:gap-[unset]`}
      >
        {center}
      </div>
      <div
        className={`flex justify-around items-center gap-y-0 gap-x-6 lg:flex-0 show-lg right_content show-lg`}
      >
        {right}
      </div>
    </div>
  );
}
