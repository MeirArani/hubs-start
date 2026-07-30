import { memo, useId } from 'react';
import { NumericInput, type NumericInputProps } from './NumericInput';
import InputField from './InputField';

export interface NumericInputFieldProps extends Omit<NumericInputProps, 'id'> {
  error?: string;
  description?: string;
  inputClassName?: string;
  label?: string;
  fullWidth?: boolean;
}

export const NumericInputField = memo(function NumericInputField({
  className,
  error,
  description,
  inputClassName,
  ref,
  label,
  fullWidth,
  ...rest
}: NumericInputFieldProps) {
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
      <NumericInput id={id} ref={ref} className={inputClassName} {...rest} />
    </InputField>
  );
});
