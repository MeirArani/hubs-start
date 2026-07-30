import { memo, useId, type ReactNode, type Ref } from 'react';
import InputField, { type InputFieldProps } from './InputField';
import type { TextAreaInputProps } from './TextAreaInput';
import TextAreaInput from './TextAreaInput';

export interface TextAreaInputFieldProps extends Omit<
  TextAreaInputProps,
  'id'
> {
  inputClassName?: string;
  label?: ReactNode;
  className?: string;
  error?: ReactNode;
  description?: ReactNode;
  fullWidth?: boolean;
  ref?: Ref<HTMLInputElement>;
}

export const TextAreaInputField = memo(function TextAreaInputField({
  className,
  error,
  description,
  inputClassName,
  label,
  fullWidth,
  ref,
  ...rest
}: TextAreaInputFieldProps) {
  const id = useId();
  const labelId = useId();

  return (
    <InputField
      id={labelId}
      htmlFor={id}
      className={className}
      label={label}
      error={error}
      description={description}
      fullWidth={fullWidth}
    >
      <TextAreaInput id={id} ref={ref} className={inputClassName} {...rest} />
    </InputField>
  );
});
