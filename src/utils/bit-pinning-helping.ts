import type HubChannel from '#/core/hub-channel';
import {
  createMessageDatas,
  isNetworkInstantiated,
} from '#/systems/bitecs/networking';
import { type HubsWorld } from '@/core/app';
import { createEntityState, deleteEntityState } from './entity-state-utils';
import type { EntityID } from './networking-types';
import { takeOwnership } from './take-ownership';
import { m } from '@/paraglide/messages';

export const setPinned = async (
  hubChannel: HubChannel,
  world: HubsWorld,
  eid: EntityID,
  shouldPin: boolean,
) => {
  _signInAndPinOrUnpinElement(hubChannel, world, eid, shouldPin);
};

const _pinElement = async (
  hubChannel: HubChannel,
  world: HubsWorld,
  eid: EntityID,
) => {
  try {
    await createEntityState(hubChannel, world, eid);
    takeOwnership(world, eid);
  } catch (e: any) {
    if (e.reason === 'invalid_token') {
      // TODO: Sign out and sign in again
      console.log(
        'PinningHelper: Pin failed due to invalid token, signing out and trying again',
        e,
      );
    } else {
      console.warn('PinningHelper: Pin failed for unknown reason', e);
    }
  }
};

const unpinElement = (
  hubChannel: HubChannel,
  world: HubsWorld,
  eid: EntityID,
) => {
  deleteEntityState(hubChannel, world, eid);
};

const _signInAndPinOrUnpinElement = (
  hubChannel: HubChannel,
  world: HubsWorld,
  eid: EntityID,
  shouldPin: boolean,
) => {
  const action = shouldPin
    ? () => _pinElement(hubChannel, world, eid)
    : () => unpinElement(hubChannel, world, eid);
  window.APP.entryManager!.performConditionalSignIn(
    () => hubChannel.signedIn,
    action,
    shouldPin
      ? m['sign-in-modal.signin-message.pin']()
      : m['sign-in-modal.signin-message.unpin'](),
    (e: Error) => {
      console.warn(`PinningHelper: Conditional sign-in failed. ${e}`);
    },
  );
};

export const canPin = (hubChannel: HubChannel, eid: EntityID): boolean => {
  const createMessageData = createMessageDatas.get(eid)!;
  if (createMessageData && createMessageData.prefabName !== 'media') {
    return false;
  }
  return isNetworkInstantiated(eid) && hubChannel.can('pin_objects');
};
