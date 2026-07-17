// Originally from https://github.com/mozilla/lilypad/

import {
  useRef,
  type ChangeEvent,
  type ChangeEventHandler,
  type ReactNode,
} from 'react';

export interface CheckboxProps {
  label?: string | ReactNode;
  checked?: boolean;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  onChange: (value: boolean) => void;
}

export default function Checkbox({
  className,
  label,
  disabled,
  checked,
  labelClassName,
  onChange,
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOnChange: ChangeEventHandler<HTMLInputElement> = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const checked = event.target.checked;
    onChange && onChange(checked);
  };

  return (
    <label
      className={`${className} select-none mb-4 flex items-center relative cursor-pointer box-content group`}
    >
      <input
        onChange={handleOnChange}
        type="checkbox"
        disabled={disabled}
        checked={checked}
        ref={inputRef}
        className="absolute opacity-0 w-0 h-0 peer"
      />

      <div
        className={`relative h-5.5 w-5.5 min-w-5.5 bg-gray-300 border-2 border-indigo-700 rounded-[4px] after:rotate-45 after:[content:''] after:absolute after:hidden after:left-1.75 after:top-0.5 after:w-1.25 after:h-2.75 after:border-white after:rounded-[1.5px] after:border-[0_2px_2px_0] ${disabled ? `bg-gray-200 border-2 border-gray-300` : ''} group-hover:peer-enabled:bg-gray-300 peer-checked:peer-enabled:bg-indigo-700 peer-checked:peer-hover:peer-enabled:bg-indigo-800 peer-checked:after:block `}
      />

      {label ? (
        <div
          className={`${labelClassName} text-md font-medium text-black pl-4`}
        >
          {label}
        </div>
      ) : null}
    </label>
  );
}
