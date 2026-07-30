import { memo } from 'react';
import type { RadioInputContainerProps } from './RadioInput';
import InputField from './InputField';
import RadioInputContainer from './RadioInput';

export interface RadioInputFieldProps extends RadioInputContainerProps {
  error?: string;
  description?: string;
  inputClassName?: string;
  label?: string;
  fullWidth?: boolean;
}

export const RadioInputField = memo(function RadioInputField({
  className,
  error,
  description,
  inputClassName,
  label,
  children,
  fullWidth,
  ...rest
}: RadioInputFieldProps) {
  return (
    <InputField
      className={className}
      label={label}
      error={error}
      description={description}
      fullWidth={fullWidth}
    >
      <RadioInputContainer className={inputClassName} {...rest}>
        {children}
      </RadioInputContainer>
    </InputField>
  );
});
