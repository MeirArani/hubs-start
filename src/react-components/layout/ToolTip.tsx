// Originally from https://github.com/mozilla/lilypad/

import { useState, type ReactNode } from 'react';
import FadeIn from '../misc/FadeIn';

export type ToolTipCategoriesT = 'primary' | 'secondary' | 'tertiary';
export type ToolTipLocationT = 'top' | 'bottom' | 'right' | 'left';

type ToolTipPropsT = {
  children: ReactNode;
  description: string;
  location?: ToolTipLocationT;
  category?: ToolTipCategoriesT;
  width?: string;
  className?: string;
};

const locationStyles = {
  top: 'left-0 top-0 -translate-y-full pb-3',
  bottom: 'left-0 bottom-0 translate-y-full pt-3',
  right: 'right-0 translate-x-full [&>p]:mt-0 [&>p]:ml-2.5',
  left: 'left-0 -translate-x-full pr-3 [&>p]:mt-0 [&>p]:mr-2.5',
} as const;

const categoryStyles = {
  primary: 'bg-black text-white',
  secondary: 'bg-[#5282ff] text-black',
  tertiary: 'bg-white text-white ',
} as const;

const ToolTip = ({
  children,
  description,
  location = 'top',
  category = 'primary',
  width = 'min-w-62.5 max-w-62.5 w-62.5',
  className = '',
}: ToolTipPropsT) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <section className="relative inline-flex">
      {/* Contents that trigger tool top */}
      <div onMouseEnter={handleOpen} onMouseLeave={handleClose} className="">
        {children}
      </div>

      {/* Tool Tip  */}
      <div className={` absolute z-2  ${locationStyles[location]}`}>
        <FadeIn visible={isOpen}>
          <p
            className={`${className} tracking-0 leading-6.25! block z-2 rounded-xl p-3.5 shadow-[0_3px_8px_rgba(#000,0.3)] text-xs ${
              categoryStyles[category]
            } ${width}`}
          >
            {description}
          </p>
        </FadeIn>
      </div>
    </section>
  );
};

export default ToolTip;
