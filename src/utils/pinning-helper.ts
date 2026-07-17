import type HubChannel from '#/core/hub-channel';
import type { Entity } from 'aframe';
import type AuthChannel from './auth-channel';
import { m, type LocalizedString } from '@/paraglide/messages';
import { store } from '#/store/store';
import { getPromotionTokenForFile } from './media-utils';

interface ConditionalSignInParams {
  predicate: () => boolean;
  action: () => void;
  signInMessage: LocalizedString;
  onFailure?: (e: Error) => void;
}

export default class PinningHelper {
  hubChannel: HubChannel;
  authChannel: AuthChannel;
  performConditionalSignIn: (params: ConditionalSignInParams) => void;
  constructor(
    hubChannel: HubChannel,
    authChannel: AuthChannel,
    performConditionalSignIn: (params: ConditionalSignInParams) => void,
  ) {
    this.hubChannel = hubChannel;
    this.authChannel = authChannel;
    this.performConditionalSignIn = performConditionalSignIn;
  }

  async setPinned(el: Entity, pin: boolean) {
    if (NAF.utils.isMine(el)) {
      this._signInAndPinOrUnpinElement(el, pin);
    } else {
      console.warn(
        'PinningHelper: Attempted to set pin state on object that was not mine.',
      );
    }
  }

  _signInAndPinOrUnpinElement = (el: Entity, pin?: boolean) => {
    const action = pin
      ? () => this._pinElement(el)
      : () => this.unpinElement(el);

    this.performConditionalSignIn({
      predicate: () => this.hubChannel.signedIn,
      action,
      signInMessage: pin
        ? m['sign-in-modal.signin-message.pin']()
        : m['sign-in-modal.signin-message.unpin'](),
      onFailure: (e: Error) => {
        console.warn(`PinningHelper: Conditional sign-in failed. ${e}`);
      },
    });
  };

  async _pinElement(el: Entity) {
    const { networkId } = el.components.networked.data;

    const { fileId, src } = el.components['media-loader'].data;
    let fileAccessToken, promotionToken;
    if (fileId) {
      fileAccessToken = new URL(src).searchParams.get('token');
      const storedPromotionToken = getPromotionTokenForFile(fileId);
      if (storedPromotionToken) {
        promotionToken = storedPromotionToken.promotionToken;
      }
    }

    const gltfNode = pinnedEntityToGltf(el);
    if (!gltfNode) {
      console.warn('PinningHelper: Entity did not produce a GLTF node.');
      return;
    }
    el.setAttribute('networked', { persistent: true });
    el.setAttribute('media-loader', { fileIsOwned: true });

    // CHECK: This method doesn't seem to exist
    try {
      //   await this.hubChannel.pin(
      //     networkId,
      //     gltfNode,
      //     fileId,
      //     fileAccessToken,
      //     promotionToken,
      //   );

      // If we lost ownership of the entity while waiting for the pin to go through,
      // try to regain ownership before setting the "pinned" state.
      if (!NAF.utils.isMine(el) && !NAF.utils.takeOwnership(el)) {
        console.warn(
          'PinningHelper: Pinning succeeded, but ownership was lost in the mean time',
        );
      }

      el.setAttribute('pinnable', 'pinned', true);
      el.emit('pinned', { el });
      store.setState((prev) => ({
        ...prev,
        activity: { ...prev.activity, hasPinned: true },
      }));
    } catch (e: any) {
      if (e.reason === 'invalid_token') {
        await this.authChannel.signOut(this.hubChannel);
        this._signInAndPinOrUnpinElement(el);
      } else {
        console.warn('PinningHelper: Pin failed for unknown reason', e);
      }
    }
  }

  unpinElement(el: Entity) {
    const components = el.components;
    const networked = components.networked;

    if (!networked || !networked.data || !NAF.utils.isMine(el)) {
      console.warn(
        'PinningHelper: Tried to unpin element that is not networked or not mine.',
      );
      return;
    }

    el.setAttribute('networked', { persistent: false });

    // CHECK: METHOD DOES NOT EXIST
    // const networkId = components.networked.data.networkId;
    // const mediaLoader = components['media-loader'];
    // const fileId = mediaLoader.data && mediaLoader.data.fileId;
    // this.hubChannel.unpin(networkId, fileId);
    el.setAttribute('pinnable', 'pinned', false);
    el.emit('unpinned', { el });
  }
}
