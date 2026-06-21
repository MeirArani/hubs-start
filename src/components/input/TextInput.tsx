import { handleTextFieldBlur, handleTextFieldFocus } from '#/utils/focus'
import WarningIcon from '../icons/Warning.svg?react'
import {
  memo,
  type FocusEvent,
  type FocusEventHandler,
  type ReactNode,
  type Ref,
} from 'react'

import '#/styles/sass/input/TextInput.module.scss'

export interface TextInputProps {
  id: string
  disabled?: boolean
  invalid?: boolean
  className?: string
  beforeInput?: ReactNode
  afterInput?: ReactNode
  onFocus?: FocusEventHandler
  onBlur?: FocusEventHandler
  ref?: Ref<HTMLInputElement>
  textInputStyles?: string
}

const TextInput = memo(function TextInput({
  id,
  disabled,
  invalid,
  className,
  beforeInput,
  afterInput,
  onFocus,
  onBlur,
  ref,
  textInputStyles,
  ...rest
}: TextInputProps & React.ComponentPropsWithoutRef<'input'>) {
  //const ref =  useRef(null)
  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    handleTextFieldFocus(e.target)
  }

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    handleTextFieldBlur()

    if (onBlur) {
      onBlur(e)
    }
  }

  return (
    <div
      className={`outer-wrapper input-group ${invalid && 'invalid'} ${disabled && 'disabled'} ${className} `}
    >
      <div className="before-input"> {beforeInput}</div>
      <div className="input-wrapper">
        <input
          id={id}
          className={`text-input ${textInputStyles}`}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
          ref={ref}
        />
      </div>
      <div className="after-input">
        {invalid && <WarningIcon className="invalid-icon" />}
        {afterInput}
      </div>
    </div>
  )
})

export default TextInput
