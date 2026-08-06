import { useEffect, useRef, type RefObject } from 'react';
// ResizeObserver not currently supported in Firefox Android
import {
  getMaxResolutionWidth,
  getMaxResolutionHeight,
} from '#/utils/screen-orientation';
import type { Scene } from 'aframe';
import { useSelector } from '@tanstack/react-store';
import { store } from '#/store/store';
import { PerspectiveCamera } from 'three';
import { useOrientation } from '@uidotdev/usehooks';
import useResizeObserver from '@react-hook/resize-observer';

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

// TODO: Fix canvas not resizing to fit above toolbar (wasted rendering)
export function useResizeViewport(
  viewportRef: RefObject<HTMLDivElement | null>,
  scene?: Scene,
) {
  if (!scene) return;
  const maxResolution = useSelector(
    store,
    (state) => state.preferences.maxResolution,
  );
  const orientation = useOrientation();

  useResizeObserver(viewportRef, (entry) => {
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

    const canvasRect = entry.contentRect;

    const rendererSize = calculateRendererSize(
      canvasRect,
      maxResolution,
      isVRPresenting,
    );

    scene.canvas.style.width = `${canvasRect.width} px`;
    scene.canvas.style.height = `${canvasRect.height} px`;
    (scene.camera as PerspectiveCamera).aspect =
      rendererSize.width / rendererSize.height;

    (scene.camera as PerspectiveCamera).updateProjectionMatrix();

    scene.renderer.setSize(canvasRect.width, canvasRect.height, false);
    // scene.emit('rendererresize', rendererSize, false);
  });

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
