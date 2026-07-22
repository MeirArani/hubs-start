import { memo, type ComponentPropsWithoutRef, type ReactNode } from 'react';

export interface InputFieldProps {
  id?: string;
  htmlFor?: string;
  label?: ReactNode;
  className?: string;
  children?: ReactNode;
  error?: ReactNode;
  description?: ReactNode;
  fullWidth?: boolean;
}

const InputField = memo(function InputField({
  id,
  htmlFor,
  label,
  description,
  className,
  fullWidth,
  children,
  error,
  ...rest
}: InputFieldProps & ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={`flex flex-col w-full max-w-75 whitespace-break-spaces leading-[1.2rem] ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {label && (
        <label
          id={id}
          className="mb-2 text-text-tertiary self-start"
          htmlFor={htmlFor}
        >
          {label}
        </label>
      )}
      {children}
      {error ? (
        <small className="mt-2 text-error self-start text-sm">{error}</small>
      ) : description ? (
        <small className="mt-2 text-text-secondary text-sm">
          {description}
        </small>
      ) : undefined}
    </div>
  );
});

export default InputField;
