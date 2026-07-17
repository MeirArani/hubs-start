import type { Hub } from '#/types/hubs';
import type { Scene } from 'aframe';
import {
  InvitePopoverButton,
  type InvitePopoverButtonProps,
} from './InvitePopover';
import type HubChannel from '#/core/hub-channel';
import { useRouter } from '@tanstack/react-router';
import { store } from '#/store/store';
import { useEffect, useRef } from 'react';
import { useInviteUrl } from './hooks/useInviteUrl';
import { shareInviteUrl } from '#/utils/share';
import { m } from '#/paraglide/messages';
import type { PopoverAPI } from '../popover/Popover';

export interface InvitePopoverContainerProps extends Omit<
  InvitePopoverButtonProps,
  'url' | 'shareUrlHandler'
> {
  hub: Hub;
  scene: Scene;
  hubChannel: HubChannel;
}

export function InvitePopoverContainer({
  hub,
  hubChannel,
  scene,
  ...rest
}: InvitePopoverContainerProps) {
  const router = useRouter();

  const embedToken =
    hub.embed_token ||
    store.state.embedTokens?.find((entry) => entry.hubId === hub.hub_id)
      ?.embedToken;

  const url = `${router.origin}${
    router.buildLocation({
      to: '.',
      search: { embed_token: embedToken },
    }).publicHref
  }`;

  const embedText = embedToken
    ? `<iframe src="${url}" style="width: 1024px; height: 768px;" allow="microphone; camera; vr; speaker;"></iframe>`
    : undefined;

  const popoverApiRef = useRef<PopoverAPI | null>(null);

  // Handle clicking on the invite button in "More" menu.
  useEffect(() => {
    //   REIMP
    // function onInviteButtonClicked() {
    //     handleExitTo2DInterstitial(true, () => {}).then(() => {
    //       popoverApiRef.current?.openPopover();
    //     });
    // }
    // scene.addEventListener('action_invite', onInviteButtonClicked);
    // return () => {
    //   scene.removeEventListener('action_invite', onInviteButtonClicked);
    // };
  }, [scene, popoverApiRef]);

  const inviteRequired = hub.entry_mode === 'invite';
  const canGenerateInviteUrl = hubChannel.can('update_hub');

  const { fetchingInvite, inviteUrl, revokeInvite } = useInviteUrl({
    hubChannel,
    disabled: !inviteRequired || !canGenerateInviteUrl,
  });

  if (inviteRequired && !canGenerateInviteUrl) {
    return null;
  }

  return (
    <InvitePopoverButton
      inviteRequired={inviteRequired}
      fetchingInvite={fetchingInvite}
      inviteUrl={inviteUrl}
      revokeInvite={revokeInvite}
      shareUrlHandler={() => {
        shareInviteUrl.bind(
          null,
          inviteRequired && inviteUrl ? inviteUrl : url,
          {
            roomName: hub.name,
            appName: m['app-name'](),
          },
        );
      }}
      url={url}
      embed={embedText}
      popoverApiRef={popoverApiRef}
      {...rest}
    />
  );
}
