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
import { store } from '#/store/store';
import {
  getMaxResolutionWidth,
  getMaxResolutionHeight,
} from '#/utils/screen-orientation';
import { useSelector } from '@tanstack/react-store';
import { useOrientation } from '@uidotdev/usehooks';
import type { PerspectiveCamera } from 'three';

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

  useResizeViewport(viewportRef, scene);
  const moreMenu = useState(false);
  return (
    <div
      className={`relative grid w-full h-full overflow-hidden pointer-events-none grid-cols-[[main]_auto_[sidebar]_minmax(0,min-content)] grid-rows-[[viewport]_auto_[toolbar]_min-content] ${objectFocused ? '[&>.toolbar]:hidden [&>.sidebar]:hidden' : ''} ${className}`}
      {...rest}
    >
      {sidebar && (
        <div
          className={`bg-red sidebar h-full overflow-hidden w-112.5 col-start-[sidebar] lg:fixed lg:top-0 lg:left-0 lg:bottom-0 lg:right-0 lg:m-0 lg:w-full lg:z-9 ${sidebarClassName}`}
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
        className={`col-start-[main] relative row-start-[viewport]  flex justify-center items-center *:pointer-events-auto  ${streaming ? ' inset-shadow-red' : ''} ${viewportClassName}`}
        ref={viewportRef}
      >
        {viewport}
      </div>
    </div>
  );
}

export function useResizeViewport(
  viewportRef: RefObject<HTMLDivElement | null>,
  scene: Scene,
) {
  if (!scene) return;
  const maxResolution = useSelector(
    store,
    (state) => state.preferences.maxResolution,
  );

  const orientation = useOrientation();

  useEffect(() => {
    if (!viewportRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const isPresenting = scene.renderer.xr.isPresenting;
      const isVRPresenting = scene.renderer.xr.enabled && isPresenting;

      // Do not update renderer, if a camera or a canvas have not been injected.
      // Also, in VR mode, WebXRManager is responsible for the framebuffer size and can not be overridden
      if (
        !scene.camera ||
        !scene.canvas ||
        (scene.is('vr-mode') && (scene.isMobile || isVRPresenting))
      ) {
        return;
      }

      const canvasRect = entries[0].contentRect;

      const rendererSize = calculateRendererSize(
        canvasRect,
        maxResolution,
        isVRPresenting,
      );

      const canvas = scene.canvas;
      canvas.style.width = `${canvasRect.width} px`;
      canvas.style.height = `${canvasRect.height} px`;
      (scene.camera as PerspectiveCamera).aspect =
        rendererSize.width / rendererSize.height;

      (scene.camera as PerspectiveCamera).updateProjectionMatrix();

      scene.emit('rendererresize', rendererSize, false);
    });

    observer.observe(viewportRef.current);

    return () => {
      observer.disconnect();
    };
  }, [viewportRef, scene, maxResolution]);

  useEffect(() => {
    store.setState((state) => {
      return {
        ...state,
        preferences: {
          ...state.preferences,
          maxResolution: {
            width: getMaxResolutionWidth(),
            height: getMaxResolutionHeight(),
          },
        },
      };
    });
  }, [orientation]);
}

function calculateRendererSize(
  canvasRect: { width: number; height: number },
  maxResolution: { width: number; height: number },
  isVR: boolean,
) {
  if (isVR) {
    return canvasRect;
  }

  // canvasRect values are CSS pixels based while
  // maxResolution values are physical pixels based (CSS pixels * pixel ratio).
  // Convert maxResolution values to CSS pixels based.
  const pixelRatio = window.devicePixelRatio;
  const maxWidth = maxResolution.width / pixelRatio;
  const maxHeight = maxResolution.height / pixelRatio;

  if (canvasRect.width <= maxWidth && canvasRect.height <= maxHeight) {
    return canvasRect;
  }

  const conversionRatio = Math.min(
    maxWidth / canvasRect.width,
    maxHeight / canvasRect.height,
  );

  return {
    width: Math.round(canvasRect.width * conversionRatio),
    height: Math.round(canvasRect.height * conversionRatio),
  };
}
