import type { HTMLProps, ReactNode } from 'react';

export interface RadioInputContainerProps extends HTMLProps<HTMLDivElement> {}

export default function RadioInputContainer({
  className,
  children,
  ...rest
}: RadioInputContainerProps) {
  return (
    <div className={`flex flex-col w-full my-2 mx-0 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export interface RadioInputOptionProps extends Omit<
  HTMLProps<HTMLInputElement>,
  'label'
> {
  label: ReactNode;
  description?: ReactNode;
  labelClassName?: string;
  error?: string;
}
export function RadioInputOption({
  label,
  description,
  className,
  ref,
  labelClassName,
  ...rest
}: RadioInputOptionProps) {
  return (
    <label
      className={`flex items-center mb-4 ml-4 cursor-pointer select-none text-left last:mb-0 ${className}`}
    >
      <input
        className="w-6 h-6 rounded-3xl border border-radio-border bg-radio self-center relative appearance-none cursor-pointer after:[content:'_'] after:absolute after:bg-transparent after:top-0.75 after:left-0.75 after:right-0.75 after:bottom-0.75 after:w-4 after:h-4 after:rounded-2xl hover:after:bg-radio-hover active:after:bg-radio-pressed checked:after:bg-active checked:hover:after:bg-active-hover checked:active:after:bg-active-pressed"
        type="radio"
        ref={ref}
        {...rest}
      />
      <div
        className={`flex flex-col ml-2 text-text-secondary ${labelClassName}`}
      >
        <span className="text-sm font-bold text-text-primary">{label}</span>
        {description && (
          <span className="mt-1 text-xs font-regular text-text-secondary">
            {description}
          </span>
        )}
      </div>
    </label>
  );
}
