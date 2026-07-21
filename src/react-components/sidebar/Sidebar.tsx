import type { ReactNode } from 'react';

export interface SidebarProps {
  title?: ReactNode;
  beforeTitle?: ReactNode;
  afterTitle?: ReactNode;
  children?: ReactNode;
  className?: string;
  disableOverflowScroll?: boolean;
}

export default function Sidebar({
  title,
  beforeTitle,
  afterTitle,
  children,
  className,
  disableOverflowScroll,
}: SidebarProps) {
  return (
    <div
      className={`relative flex flex-col h-full bg-bg-primary pointer-events-auto wrap-break-word lg:border-l lg:border-l-border-primary ${className}`}
    >
      {(title || beforeTitle || afterTitle) && (
        <div className="flex h-12 shrink-0 border-b border-b-border-primary items-center justify-center">
          <div className="absolute left-0 ml-4">{beforeTitle}</div>
          <h5>{title}</h5>
          <div className="absolute right-0 mr-4">{afterTitle}</div>
        </div>
      )}
      <div
        className={`absolute top-12 left-0 right-0 bottom-0 flex flex-1 flex-col ${disableOverflowScroll ? '' : 'overflow-y-auto'}`}
      >
        {children}
      </div>
    </div>
  );
}
