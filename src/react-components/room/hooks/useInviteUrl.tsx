import { useCallback, useEffect, useMemo, useState } from 'react';
import type HubChannel from '#/core/hub-channel';
import { useRouter } from '@tanstack/react-router';

export function useInviteUrl({
  hubChannel,
  disabled = false,
}: {
  hubChannel: HubChannel;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [inviteId, setInviteId] = useState<string>();

  useEffect(() => {
    setInviteId(undefined);

    if (disabled) {
      return;
    }

    hubChannel
      .fetchInvite()
      .then(({ hub_invite_id }) => {
        if (disabled) {
          return;
        }

        setInviteId(hub_invite_id);
      })
      .catch((error) => {
        console.error('Error fetching invite', error);
      });
  }, [hubChannel, disabled]);

  const revokeInvite = useCallback(() => {
    if (!inviteId) return;
    setInviteId(undefined);
    if (disabled) {
      return;
    }

    hubChannel
      .revokeInvite(inviteId)
      .then(({ hub_invite_id }) => {
        if (disabled) {
          return;
        }

        setInviteId(hub_invite_id);
      })
      .catch((error) => {
        console.error('Error revoking invite', error);
      });
  }, [inviteId, hubChannel, disabled]);

  const inviteUrl = useMemo(() => {
    if (inviteId && !disabled) {
      const url = `${router.origin}${router.buildLocation({
        to: '.',
        search: { hub_invite_id: inviteId },
      })}`;
      return url;
    }

    return undefined;
  }, [inviteId, disabled]);

  const fetchingInvite = !inviteId && !disabled;

  return { fetchingInvite, inviteUrl, revokeInvite };
}
