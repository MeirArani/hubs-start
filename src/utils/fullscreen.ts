import screenfull from 'screenfull'

let hasEnteredFullScreenThisSession = false

function shouldShowFullScreen() {
  // Disable full screen on iOS, since Safari's fullscreen mode does not let you prevent native pinch-to-zoom gestures.
  //   return (isMobile() || isMobileVR()) && !isIOS() && screenfull && screenfull.enabled;
  return screenfull.isEnabled
}

export function willRequireUserGesture() {
  return screenfull && !screenfull.isFullscreen && shouldShowFullScreen()
}

export async function showFullScreenIfAvailable() {
  if (shouldShowFullScreen() && screenfull && !screenfull.isFullscreen) {
    hasEnteredFullScreenThisSession = true
    await screenfull.request()
  }
}

export async function showFullScreenIfWasFullScreen() {
  if (!screenfull.isEnabled) return

  if (hasEnteredFullScreenThisSession && !screenfull.isFullscreen) {
    await screenfull.request()
  }
}
