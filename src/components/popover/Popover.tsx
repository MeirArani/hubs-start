import {
  useCallback,
  useEffect,
  useState,
  type Dispatch,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
  type SetStateAction,
} from 'react'
import { useCssBreakpoints } from 'react-use-css-breakpoints'
import { CloseButton } from '../input/CloseButton'
import { createPortal } from 'react-dom'
import { usePopper } from 'react-popper'
import type { Placement } from '@popperjs/core'

export interface PopoverProps {
  initiallyVisible?: boolean
  placement?: Placement
  title: ReactNode
  children: ({
    togglePopover,
    openPopover,
    closePopover,
    popoverVisible,
    triggerRef,
  }: {
    togglePopover: React.MouseEventHandler
    openPopover: () => void
    closePopover: () => void
    popoverVisible: boolean
    triggerRef: Ref<HTMLButtonElement>
  }) => ReactNode
  content: ((props: any) => ReactElement<{ fullscreen: boolean }>) | ReactNode
  disableFullscreen?: boolean
  popoverApiRef?: RefObject<{
    openPopover: () => void
    closePopover: () => void
    togglePopover: () => void
  }>
  popoverClass?: string
  showHeader?: boolean
  offsetSkidding?: number
  offsetDistance?: number
  isVisible?: boolean
  onChangeVisible?: Dispatch<SetStateAction<boolean>>
  arrowClass?: string
}

export default function Popover({
  initiallyVisible = false,
  placement,
  title,
  children,
  content: Content,
  disableFullscreen,
  popoverApiRef,
  popoverClass,
  showHeader,
  offsetSkidding,
  offsetDistance,
  isVisible = false,
  onChangeVisible,
  arrowClass,
}: PopoverProps) {
  const [_visible, _setVisible] = useState(initiallyVisible)
  const visible = isVisible === undefined ? _visible : isVisible
  const setVisible = onChangeVisible || _setVisible
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(
    null,
  )
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null)
  const [arrowElement, setArrowElement] = useState<HTMLElement | null>(null)
  const {
    styles: { popper: popperStyles, arrow: arrowStyles },
    attributes,
  } = usePopper(referenceElement, popperElement, {
    placement,
    modifiers: [
      { name: 'arrow', options: { element: arrowElement } }, // https://popper.js.org/docs/v2/modifiers/arrow/
      { name: 'offset', options: { offset: [offsetSkidding, offsetDistance] } }, // https://popper.js.org/docs/v2/modifiers/offset/
    ],
  })

  const breakpoint = useCssBreakpoints()
  const fullscreen =
    !disableFullscreen && (breakpoint === 'sm' || breakpoint === 'md')
  const openPopover = useCallback(() => setVisible(true), [setVisible])
  const closePopover = useCallback(() => setVisible(false), [setVisible])
  const togglePopover = useCallback(
    () => setVisible((visible) => !visible),
    [setVisible],
  )

  useEffect(() => {
    if (!popoverApiRef) {
      return
    }

    popoverApiRef.current = {
      openPopover,
      closePopover,
      togglePopover,
    }
  }, [popoverApiRef, openPopover, closePopover, togglePopover])

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        // HACK: Is this kosher?
        (referenceElement && referenceElement.contains(e.target as Node)) ||
        (popperElement && popperElement.contains(e.target as Node))
      ) {
        return
      }

      setVisible(false)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setVisible(false)
      }
    }

    if (visible) {
      window.addEventListener('mousedown', onClick)
      window.addEventListener('keydown', onKeyDown)
    }

    return () => {
      window.removeEventListener('mousedown', onClick)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [visible, popperElement, referenceElement, setVisible])

  useEffect(() => {
    if (visible && fullscreen) {
      document.body.classList.add('fullscreen-body')
    } else {
      document.body.classList.remove('fullscreen-body')
    }

    return () => {
      document.body.classList.remove('fullscreen-body')
    }
  }, [fullscreen, visible])

  return (
    <>
      {children({
        togglePopover,
        openPopover,
        closePopover,
        popoverVisible: visible,
        triggerRef: setReferenceElement,
      })}
      {visible &&
        createPortal(
          <div
            ref={setPopperElement}
            className={`popover ${fullscreen ? 'fullscreen' : undefined} ${popoverClass}`}
            style={fullscreen ? undefined : popperStyles}
            {...attributes.popper}
          >
            {showHeader && (
              <div className="header">
                <CloseButton onClick={closePopover} />
                <h5>{title}</h5>
              </div>
            )}
            <div className="content">
              {typeof Content === 'function' ? (
                <Content fullscreen={fullscreen} closePopover={closePopover} />
              ) : (
                Content
              )}
            </div>
            {!fullscreen && (
              <div ref={setArrowElement} className="arrow" style={arrowStyles}>
                <PopoverArrow arrowClass={arrowClass} />
              </div>
            )}
          </div>,
          document.body,
        )}
    </>
  )
}

function PopoverArrow({ arrowClass }: { arrowClass?: string }) {
  return (
    <svg
      width="25"
      height="11"
      viewBox="0 0 25 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 1L11.1176 9.51209C11.8908 10.1626 13.1092 10.1626 13.8824 9.51209L24 1"
        strokeWidth="2"
        className={`arrow-bg ${arrowClass}`}
      />
      <path
        d="M11.1176 9.51209L1 1H24L13.8824 9.51209C13.1092 10.1626 11.8908 10.1626 11.1176 9.51209Z"
        className={`arrow-border ${arrowClass}`}
      />
      <path d="M0 1H25" strokeWidth="2" className={`arrow-bg ${arrowClass}`} />
    </svg>
  )
}
