import { memo, type ComponentPropsWithoutRef, type ReactNode } from 'react'

export interface InputFieldProps {
  id?: string
  htmlFor?: string
  label?: ReactNode
  className?: string
  children?: ReactNode
  error?: ReactNode
  description?: ReactNode
  fullWidth?: boolean
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
      className={`input-field ${fullWidth && 'full-width'} ${className}`}
      {...rest}
    >
      {label && (
        <label id={id} className="label" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
      {error ? (
        <small className="error">{error}</small>
      ) : description ? (
        <small className="info">{description}</small>
      ) : undefined}
    </div>
  )
})

export default InputField
