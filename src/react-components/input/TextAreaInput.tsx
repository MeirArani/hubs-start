import type { TextInputProps } from './TextInput';

import TextInput from './TextInput';

export interface TextAreaInputProps extends TextInputProps {}

export default function TextAreaInput({
  className,
  ref,
  ...rest
}: TextAreaInputProps) {
  return (
    <TextInput className={`h-auto ${className}`} {...rest} autosize ref={ref} />
  );
}
