import type { ReactNode } from 'react'
import '#/styles/sass/modal/Modal.module.scss'

export interface ModalProps {
  title?: ReactNode
  titleNode?: ReactNode
  beforeTitle?: ReactNode
  afterTitle?: ReactNode
  children?: ReactNode
  className?: string
  contentClassName?: string
  disableFullscreen?: boolean
}

export function Modal({
  title,
  titleNode,
  beforeTitle,
  afterTitle,
  children,
  contentClassName,
  className,
  disableFullscreen = false,
}: ModalProps) {
  return (
    <div
      className={`modal ${!disableFullscreen && 'sm-fullscreen'} ${className}`}
    >
      {(title || beforeTitle || afterTitle) && (
        <div className="modal-header">
          <div className="before-title">{beforeTitle}</div>
          {titleNode ? titleNode : <h5>{title}</h5>}
          <div className="after-title">{afterTitle}</div>
        </div>
      )}
      <div className={`content ${contentClassName}`}>{children}</div>
    </div>
  )
}
