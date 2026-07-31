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
} from 'react';
import { useCssBreakpoints } from 'react-use-css-breakpoints';
import { CloseButton } from '../input/CloseButton';
import { createPortal } from 'react-dom';
import { usePopper } from 'react-popper';
import type { Placement } from '@popperjs/core';

export type PopoverAPI = {
  openPopover: () => void;
  closePopover: () => void;
  togglePopover: () => void;
};

export type PopoverAPIRef = RefObject<PopoverAPI | null>;

export interface PopoverProps {
  initiallyVisible?: boolean;
  placement?: Placement;
  title: ReactNode;
  children: ({
    togglePopover,
    openPopover,
    closePopover,
    popoverVisible,
    triggerRef,
  }: {
    togglePopover: React.MouseEventHandler;
    openPopover: () => void;
    closePopover: () => void;
    popoverVisible: boolean;
    triggerRef: Ref<HTMLButtonElement>;
  }) => ReactNode;
  content: ((props: any) => ReactElement<{ fullscreen: boolean }>) | ReactNode;
  disableFullscreen?: boolean;
  popoverApiRef?: PopoverAPIRef;
  popoverClass?: string;
  showHeader?: boolean;
  offsetSkidding?: number;
  offsetDistance?: number;
  isVisible?: boolean;
  onChangeVisible?: Dispatch<SetStateAction<boolean>>;
  arrowClass?: string;
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
  showHeader = true,
  offsetSkidding,
  offsetDistance,
  isVisible,
  onChangeVisible,
  arrowClass,
}: PopoverProps) {
  const [_visible, _setVisible] = useState(initiallyVisible);
  const visible = isVisible === undefined ? _visible : isVisible;
  const setVisible = onChangeVisible || _setVisible;
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(
    null,
  );
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
  const [arrowElement, setArrowElement] = useState<HTMLElement | null>(null);
  const {
    styles: { popper: popperStyles, arrow: arrowStyles },
    attributes,
  } = usePopper(referenceElement, popperElement, {
    placement,
    modifiers: [
      { name: 'arrow', options: { element: arrowElement } }, // https://popper.js.org/docs/v2/modifiers/arrow/
      { name: 'offset', options: { offset: [offsetSkidding, offsetDistance] } }, // https://popper.js.org/docs/v2/modifiers/offset/
    ],
  });

  const breakpoint = useCssBreakpoints();
  const fullscreen =
    !disableFullscreen && (breakpoint === 'sm' || breakpoint === 'md');
  const openPopover = useCallback(() => setVisible(true), [setVisible]);
  const closePopover = useCallback(() => setVisible(false), [setVisible]);
  const togglePopover = useCallback(
    () => setVisible((visible) => !visible),
    [setVisible],
  );

  useEffect(() => {
    if (!popoverApiRef) {
      return;
    }

    popoverApiRef.current = {
      openPopover,
      closePopover,
      togglePopover,
    };
  }, [popoverApiRef, openPopover, closePopover, togglePopover]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        // HACK: Is this kosher?
        (referenceElement && referenceElement.contains(e.target as Node)) ||
        (popperElement && popperElement.contains(e.target as Node))
      ) {
        return;
      }

      setVisible(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setVisible(false);
      }
    };

    if (visible) {
      window.addEventListener('mousedown', onClick);
      window.addEventListener('keydown', onKeyDown);
    }

    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [visible, popperElement, referenceElement, setVisible]);

  useEffect(() => {
    if (visible && fullscreen) {
      document.body.style.overflow = 'hidden';
      // document.body.classList.add('fullscreen-body');
    } else {
      // document.body.classList.remove('fullscreen-body');
      document.body.style.overflow = 'revert';
    }

    return () => {
      // document.body.classList.remove('fullscreen-body');
      document.body.style.overflow = 'revert';
    };
  }, [fullscreen, visible]);

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
            className={`flex flex-col rounded bg-bg-primary border border-border-primary min-w-40 z-10 max-h-[calc(100vh-200px)] ${fullscreen ? 'fixed top-0 left-0 bottom-0 right-0 border-0 rounded-none z-10 max-h-none ' : ''} ${popoverClass}`}
            style={fullscreen ? undefined : popperStyles}
            {...attributes.popper}
          >
            {showHeader && (
              <div
                className={`flex justify-center items-center py-0 px-2 h-12 relative shrink-0 ${fullscreen ? 'border-b border-b-border-primary' : ''}`}
              >
                <CloseButton
                  onClick={closePopover}
                  className={`absolute border-none bg-transparent *:hover:text-link-hover *:active:text-link-pressed ${fullscreen ? 'left-4' : 'left-2'}`}
                />
                <h5 className="flex font-bold">{title}</h5>
              </div>
            )}
            <div className="overflow-y-auto overflow-x-hidden popover-bottom:pt-2 popover-top:pb-2 popover-right:pl-2 popover-left:pr-2 ">
              {typeof Content === 'function' ? (
                <Content fullscreen={fullscreen} closePopover={closePopover} />
              ) : (
                Content
              )}
            </div>
            {!fullscreen && (
              <div
                ref={setArrowElement}
                className="absolute popover-bottom:-mt-2.25 popover-top:-bottom-2.25 popover-right:-left-4 popover-left:-right-4"
                style={arrowStyles}
              >
                <PopoverArrow
                  className="popover-bottom:rotate-180 popover-right:rotate-90 popover-left:rotate-270"
                  pathClassName={arrowClass}
                />
              </div>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

function PopoverArrow({
  className,
  pathClassName,
}: {
  className?: string;
  pathClassName?: string;
}) {
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
        className={`bg-bg-primary ${pathClassName}`}
      />
      <path
        d="M11.1176 9.51209L1 1H24L13.8824 9.51209C13.1092 10.1626 11.8908 10.1626 11.1176 9.51209Z"
        className={`text-border-primary ${pathClassName}`}
      />
      <path
        d="M0 1H25"
        strokeWidth="2"
        className={`arrow-bg ${pathClassName}`}
      />
    </svg>
  );
}
