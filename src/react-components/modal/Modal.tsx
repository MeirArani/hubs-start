import type { ReactNode } from 'react';
// import '#/styles/sass/modal/Modal.module.scss'

export interface ModalProps {
  title?: ReactNode;
  titleNode?: ReactNode;
  beforeTitle?: ReactNode;
  afterTitle?: ReactNode;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  disableFullscreen?: boolean;
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
      className={`relative flex flex-col h-max bg-bg-primary border border-solid border-border-primary rounded-lg m-6 w-full max-w-115 ${!disableFullscreen ? 'lg:fixed lg:top-0 lg:left-0 lg:right-0 lg:bottom-0 lg:border-0 lg:rounded-none lg:m-0 lg:w-full lg:h-full lg:max-w-none' : ''} ${className}`}
    >
      {(title || beforeTitle || afterTitle) && (
        <div className="flex h-12 border-b border-solid border-b-border-primary items-center justify-center">
          <div className="absolute left-0 ml-4">{beforeTitle}</div>
          {titleNode ? titleNode : <h5>{title}</h5>}
          <div className="absolute r-0 mr-4">{afterTitle}</div>
        </div>
      )}
      <div
        className={`min-h-50 flex flex-1 flex-col ${!disableFullscreen ? 'overflow-y-auto' : ''} ${contentClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
