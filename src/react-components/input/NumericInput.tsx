import { memo, type ReactNode } from 'react';
import type { TextInputProps } from './TextInput';
import TextInput from './TextInput';

export interface NumericInputProps extends TextInputProps {
  afterInput?: ReactNode;
}

export const NumericInput = memo(function NumericInput({
  className,
  afterInput,
  ref,
  ...rest
}: TextInputProps) {
  return (
    <TextInput
      inputMode="numeric"
      {...rest}
      type="number"
      className={`pr-1 focus:shadow-none ${className}`}
      ref={ref}
      afterInput={afterInput}
    />
  );
});
