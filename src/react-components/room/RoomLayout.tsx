import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';

// import '@/styles/sass/room/RoomLayout.module.scss';
import { Toolbar } from '../layout/Toolbar';
import type { Scene } from 'aframe';
import { useResizeViewport } from './hooks/useResizeViewport';

export function RoomLayout({
  className,
  viewportClassName,
  sidebar,
  sidebarClassName,
  toolbarLeft,
  toolbarCenter,
  toolbarRight,
  toolbarClassName,
  modal,
  viewport,
  objectFocused,
  streaming,
  scene,
  ...rest
}: {
  className?: string;
  viewportClassName?: string;
  sidebar?: ReactNode;
  sidebarClassName?: string;
  toolbarLeft?: ReactNode;
  toolbarCenter?: ReactNode;
  toolbarRight?: ReactNode;
  toolbarClassName?: string;
  modal?: ReactNode;
  viewport?: ReactNode;
  objectFocused?: boolean;
  streaming?: boolean;
  scene: Scene;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const moreMenu = useState(false);
  useResizeViewport(viewportRef, scene);
  return (
    <div
      className={`relative grid w-full h-full overflow-hidden pointer-events-none grid-cols-[[main]_auto_[sidebar]_minmax(0,min-content)] grid-rows-[[viewport]_auto_[toolbar]_min-content] ${objectFocused ? '[&>.toolbar]:hidden [&>.sidebar]:hidden' : ''} ${className}`}
      {...rest}
    >
      {sidebar && (
        <div
          className={`bg-red sidebar h-full overflow-hidden w-112.5 col-start-[sidebar] max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:bottom-0 max-lg:right-0 max-lg:m-0 max-lg:w-full max-lg:z-9 ${sidebarClassName}`}
        >
          {sidebar}
        </div>
      )}
      <div
        className={` relative flex justify-center items-center  col-[main] row-[viewport] row-start-[viewport] *:pointer-events-auto z-10`}
      >
        {modal}
      </div>
      {(toolbarLeft || toolbarCenter || toolbarRight) && (
        <Toolbar
          className={`row-start-[toolbar] col-start-[main] -col-end-1 pointer-events-auto z-0 ${toolbarClassName}`}
          left={toolbarLeft}
          center={toolbarCenter}
          right={toolbarRight}
        />
      )}
      <div
        className={`col-start-[main] relative row-start-[viewport] w-full  flex justify-center items-center *:pointer-events-auto  ${streaming ? ' inset-shadow-red' : ''} ${viewportClassName}`}
        ref={viewportRef}
      >
        {viewport}
      </div>
    </div>
  );
}
