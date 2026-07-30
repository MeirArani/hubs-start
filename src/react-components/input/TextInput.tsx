import { handleTextFieldBlur, handleTextFieldFocus } from '#/utils/focus-utils';
import WarningIcon from '../icons/Warning.svg?react';
import {
  memo,
  type FocusEvent,
  type FocusEventHandler,
  type ReactNode,
  type Ref,
} from 'react';
import TextareaAutosize from 'react-textarea-autosize';

// import '#/styles/sass/input/TextInput.module.scss';

export interface TextInputProps extends React.ComponentPropsWithoutRef<'input'> {
  id: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  beforeInput?: ReactNode;
  afterInput?: ReactNode;
  onFocus?: FocusEventHandler;
  onBlur?: FocusEventHandler;
  ref?: Ref<HTMLInputElement>;
  textInputStyles?: string;
  maxRows?: number;
  minRows?: number;
  autosize?: boolean;
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
  autosize,
  ...rest
}: TextInputProps) {
  //const ref =  useRef(null)
  const handleFocus = (
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    handleTextFieldFocus(e.target);
  };

  const handleBlur = (
    e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    handleTextFieldBlur();

    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <div
      className={`flex relative h-10 border border-input-border rounded-base text-text-primary overflow-hidden focus-within:border-input-outline focus-within:shadow-[0_0_0_2px] focus-within:shadow-blue-500  input-group ${invalid ? 'border-error! focus-within:shadow-error' : ''} ${disabled ? 'cursor-default text-disabled-text bg-disabled' : ''} ${className} `}
    >
      <div className="flex h-10 items-center"> {beforeInput}</div>
      <div className="flex-1 h-full">
        {autosize ? (
          <TextareaAutosize
            id={id}
            className={`h-full w-full border-none bg-transparent pl-2 leading-9.5 focus:shadow-none placeholder:text-text-tertiary ${textInputStyles}`}
            disabled={disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            // TODO: FIX
            {...rest}
            ref={ref}
          />
        ) : (
          <input
            id={id}
            className={`h-full w-full border-none bg-transparent pl-2 leading-9.5 focus:shadow-none placeholder:text-text-tertiary ${textInputStyles}`}
            disabled={disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...rest}
            ref={ref}
          />
        )}
      </div>
      <div className="flex h-10 items-center">
        {invalid && <WarningIcon className="my-0 mx-2 text-error" />}
        {afterInput}
      </div>
    </div>
  );
});

export default TextInput;
