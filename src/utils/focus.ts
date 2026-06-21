// TODO: Investigate supposed firefox bug mentioned in original file
// import screenfull from "screenfull";

import { showFullScreenIfWasFullScreen } from './fullscreen'

let isExitingFullscreenDueToFocus = false

export function handleTextFieldFocus(target: HTMLInputElement) {
  target.select()
}

export function handleTextFieldBlur() {
  if (isExitingFullscreenDueToFocus) {
    isExitingFullscreenDueToFocus = false
    return
  }

  showFullScreenIfWasFullScreen()
}
