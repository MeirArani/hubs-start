import {
  getDefaultMaxResolutionHeight,
  getDefaultMaxResolutionWidth,
} from '#/utils/screen-orientation';
import { createStore } from '@tanstack/store';

interface HubsStore {
  preferences: {
    theme: string;
    maxResolution: { width: number; height: number };
  };
  activity: {
    entryCount?: number;
    hasAcceptedProfile: boolean;
    hasChangedNameOrPronouns: boolean;
    hasFoundFreeze: boolean;
    lastEnteredAt?: Date;
  };
  credentials: {
    email: string | null;
    token: string | null;
  };
  profile: {
    avatarId: string;
    displayName: string;
  };
  creatorAssignmentTokens?: { hubId: string; creatorAssignmentToken: string }[];
  embedTokens?: { hubId: string; embedToken: string }[];
  onLoadActions?: { action: string; args: any }[];
  uploadPromotionTokens?: { fieldId: string; promotionToken: string }[];
  waitingOnAudio?: boolean;
}

interface HubsStoreActions {
  updateMaxResolution: (newMaxResolution: {
    width: number;
    height: number;
  }) => void;
}

export const store = createStore<HubsStore>({
  preferences: {
    theme: 'default',
    maxResolution: {
      width: getDefaultMaxResolutionWidth(),
      height: getDefaultMaxResolutionHeight(),
    },
  },
  activity: {
    hasAcceptedProfile: false,
    hasChangedNameOrPronouns: false,
    hasFoundFreeze: false,
  },
  credentials: { email: null, token: null },
  profile: {
    avatarId: '',
    displayName: '',
  },
  waitingOnAudio: false,
});
