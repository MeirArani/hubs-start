import {
  useRef,
  type ComponentPropsWithoutRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from 'react'
import '#/styles/sass/input/Button.module.scss'
import { FormattedMessage } from 'react-intl'

type Preset =
  | 'transparent'
  | 'basic'
  | 'primary'
  | 'accept'
  | 'cancel'
  | 'accent1'
  | 'accent2'
  | 'accent3'
  | 'accent4'
  | 'accent5'
  | 'accent6'
  | 'landing'
  | 'signin'
  | 'text'

interface ButtonProps {
  as?: ValidTag
  sm?: boolean
  lg?: boolean
  xl?: boolean
  thin?: boolean
  thick?: boolean
  preset?: Preset
  ref?: Ref<HTMLButtonElement>
  className?: string
  children?: ReactNode
  onClick?: (e: MouseEvent) => void
}

type ValidTag = 'button' | 'a' | 'span'
export default function Button<T extends ValidTag = 'button'>({
  as = 'button',
  sm,
  lg,
  xl,
  thin,
  thick,
  preset = 'basic',
  className,
  children,
  ...rest
}: ButtonProps & (ComponentPropsWithoutRef<T> & HTMLAttributes<Element>)) {
  const ref = useRef(null)
  const Tag: ValidTag = as
  return (
    <Tag
      className={`button ${preset} ${sm && 'sm'} ${lg && 'lg'} ${xl && 'xl'} ${thin && 'thin'} ${thick && 'thick'} ${className}`}
      ref={ref}
      type="button"
      {...rest}
    >
      {children}
    </Tag>
  )
}

export function NextButton({ className }: { className?: string }) {
  return (
    <button className={`accept button ${className}`} type="submit">
      <FormattedMessage id="button.next" defaultMessage="Next" />
    </button>
  )
}

export function CancelButton(props: ButtonProps) {
  return (
    <Button preset="cancel" {...props}>
      Cancel
    </Button>
  )
}

export function ContinueButton(props: ButtonProps) {
  return (
    <Button preset="accept" {...props}>
      <FormattedMessage id="button.continue" defaultMessage="Continue" />
    </Button>
  )
}

export function AcceptButton(props: ButtonProps) {
  return (
    <Button preset="accept" {...props}>
      Accept
    </Button>
  )
}

export function ApplyButton(props: ButtonProps) {
  return (
    <Button preset="accept" {...props}>
      Apply
    </Button>
  )
}
