import { useId, useRef, type ReactNode } from 'react'
import InputField from './InputField'
import TextInput from './TextInput'

export interface TextInputField {
  className?: string
  label?: ReactNode
  error?: ReactNode
  description?: ReactNode
  labelClassName?: string
  inputClassName?: string
  fullWidth?: boolean
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
}: TextInputField & React.ComponentPropsWithoutRef<'input'>) {
  const ref = useRef(null)
  const id = useId()
  const labelId = useId()

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
  )
}
