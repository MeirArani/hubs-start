import { store } from '#/store/store';
import { createClientOnlyFn, createIsomorphicFn } from '@tanstack/react-start';
import { isIOS } from './is-mobile.client';

const isNaturalOrientation = createIsomorphicFn()
  .client(() => {
    const angle =
      typeof ScreenOrientation !== 'undefined'
        ? screen.orientation.angle
        : window.orientation;
    return angle % 180 === 0;
  })
  .server(() => true);

const getScreenWidth = createIsomorphicFn()
  .client(() => {
    // Is seems screen.width value is based on the natural screen orientation on iOS
    // while it is based on the current screen orientation on Android (and other devices?).
    if (isIOS()) {
      return isNaturalOrientation() ? screen.width : screen.height;
    }
    return screen.width;
  })
  .server(() => 0);

// Return the screen height in CSS pixels based on the current screen orientation
const getScreenHeight = createIsomorphicFn()
  .client(() => {
    // Is seems screen.height value is based on the natural screen orientation on iOS
    // while it is based on the current screen orientation on Android (and other devices?).
    if (isIOS()) {
      return isNaturalOrientation() ? screen.height : screen.width;
    }
    return screen.height;
  })
  .server(() => 0);

// Physical pixels screen resolution width
// (screen.width * window.devicePixelRatio) seems to be too huge and
// can cause bad performance impact. So use CSS pixels screen width
// (screen.width) by default for now.
export const getDefaultMaxResolutionWidth = createIsomorphicFn()
  .client(() => {
    return getScreenWidth();
  })
  .server(() => 0);

// See the comment above
export const getDefaultMaxResolutionHeight = createIsomorphicFn()
  .client(() => {
    return getScreenHeight();
  })
  .server(() => 0);

export const addOrientationChangeListener = (
  callback: () => void,
  useCapture = false,
) => {
  if (typeof ScreenOrientation !== 'undefined') {
    screen.orientation.addEventListener('change', callback, useCapture);
  } else {
    window.addEventListener('orientationchange', callback, useCapture);
  }
};

export const removeOrientationChangeListener = (
  callback: () => void,
  useCapture = false,
) => {
  if (typeof ScreenOrientation !== 'undefined') {
    screen.orientation.removeEventListener('change', callback, useCapture);
  } else {
    window.removeEventListener('orientationchange', callback, useCapture);
  }
};

// Return max resolution width in physical pixels
// based on the current screen orientation
export const getMaxResolutionWidth = (
  maxResolutionWidth?: number,
  maxResolutionHeight?: number,
) => {
  const width = isNaturalOrientation()
    ? maxResolutionWidth
    : maxResolutionHeight;
  return width !== undefined ? width : getDefaultMaxResolutionWidth();
};

// Return max resolution height in physical pixels
// based on the current screen orientation
export const getMaxResolutionHeight = (
  maxResolutionWidth?: number,
  maxResolutionHeight?: number,
) => {
  const height = isNaturalOrientation()
    ? maxResolutionHeight
    : maxResolutionWidth;
  return height !== undefined ? height : getDefaultMaxResolutionHeight();
};
