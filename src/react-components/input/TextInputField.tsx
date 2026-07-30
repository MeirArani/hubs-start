import { useId, useRef, type ReactNode, type RefObject } from 'react';
import InputField from './InputField';
import TextInput, { type TextInputProps } from './TextInput';

export interface TextInputFieldProps
  extends
    Omit<TextInputProps, 'id' | 'onBlur' | 'onFocus'>,
    React.ComponentPropsWithoutRef<'input'> {
  className?: string;
  label?: ReactNode;
  error?: ReactNode;
  description?: ReactNode;
  labelClassName?: string;
  inputClassName?: string;
  fullWidth?: boolean;
  // ref?: RefObject<any>;
}

export default function TextInputField({
  className,
  error,
  description,
  inputClassName,
  labelClassName,
  label,
  fullWidth,
  ...rest
}: TextInputFieldProps) {
  const ref = useRef(null);
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
      <TextInput id={id} ref={ref} className={inputClassName} {...rest} />
    </InputField>
  );
}
