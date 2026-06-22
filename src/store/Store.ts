import { createStore } from '@tanstack/react-store'

export const store = createStore({
  preferences: {
    theme: 'default',
  },
  activity: {
    hasAcceptedProfile: false,
    hasChangedNameOrPronouns: false,
  },
  waitingOnAudio: false,
})
