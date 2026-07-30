import { memo, type HTMLProps } from 'react';

export interface ToggleInputProps extends React.ComponentProps<'input'> {
  description?: string;
  label?: string;
}

const ToggleInput = memo(function ToggleInput({
  className,
  disabled,
  label,
  description,
  ref,
  ...rest
}: ToggleInputProps) {
  return (
    <label
      className={`flex items-center select-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer '} ${className}`}
    >
      <input
        className={`peer absolute w-0 h-0 opacity-0`}
        type="checkbox"
        disabled={disabled}
        ref={ref}
        {...rest}
      />
      <div className="relative w-11 h-6 border border-radio-border rounded-[44px] focus-within:border-active focus-within:shadow-[0_0_0_2px_var(--color-active)] peer-checked:*:bg-active peer-checked:*:left-auto peer-checked:*:right-px">
        <div className="absolute top-px left-px w-5 h-5 rounded-[20px] bg-toggle-button" />
      </div>
      {label && (
        <div className="ml-4 flex flex-col">
          <p className="text-sm">{label}</p>
          {description && (
            <p className="mt-2 text-xs font-regular">{description}</p>
          )}
        </div>
      )}
    </label>
  );
});

export default ToggleInput;
