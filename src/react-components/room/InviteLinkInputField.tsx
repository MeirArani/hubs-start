import { useCallback, useState } from 'react';
import { CopyableTextInputField } from '../input/CopyableTextInputField';
import { m } from '#/paraglide/messages';
import IconButton from '../input/IconButton';

export function InviteLinkInputField({
  fetchingInvite,
  inviteUrl,
  onRevokeInvite,
}: {
  fetchingInvite?: boolean;
  inviteUrl?: string;
  onRevokeInvite: () => void;
}) {
  const [showRevokeConfirmation, setShowRevokeConfirmation] = useState(false);

  const revokeInvite = useCallback(() => {
    setShowRevokeConfirmation(true);
  }, []);

  const cancelConfirmRevokeInvite = useCallback(() => {
    setShowRevokeConfirmation(false);
  }, []);

  const confirmRevokeInvite = useCallback(() => {
    onRevokeInvite();
    setShowRevokeConfirmation(false);
  }, [onRevokeInvite]);

  return (
    <CopyableTextInputField
      label={m['invite-link-input-field.label']()}
      disabled={fetchingInvite}
      value={
        fetchingInvite
          ? m['invite-link-input-field.generating-invite']()
          : inviteUrl
      }
      buttonPreset="primary"
      description={
        !fetchingInvite &&
        (showRevokeConfirmation ? (
          <>
            {m['invite-link-input-field.revoke-confirm']()}{' '}
            <IconButton
              className="inline text-link"
              onClick={confirmRevokeInvite}
            >
              {m['invite-link-input-field.revoke-confirm-yes']()}
            </IconButton>{' '}
            /{' '}
            <IconButton
              className="inline text-link"
              onClick={cancelConfirmRevokeInvite}
            >
              {m['invite-link-input-field.revoke-confirm-no']()}
            </IconButton>
          </>
        ) : (
          <IconButton className="inline text-link" onClick={revokeInvite}>
            {m['invite-link-input-field.revoke']()}
          </IconButton>
        ))
      }
      fullWidth
    />
  );
}
