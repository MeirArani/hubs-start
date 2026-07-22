import { m } from '#/paraglide/messages';
import ToolbarButton from '../input/ToolbarButton';
import ToolTip from '../layout/ToolTip';
import Popover, { type PopoverAPIRef } from '../popover/Popover';
import InviteIcon from '../icons/Invite.svg?react';
import { useState } from 'react';
import { Column } from '../layout/Column';
import { canShare } from '#/utils/share';
import Button from '../input/Button';
import ShareIcon from '../icons/Share.svg?react';
import { isMobile } from '#/utils/is-mobile.client';
import { InviteLinkInputField } from './InviteLinkInputField';
import { CopyableTextInputField } from '../input/CopyableTextInputField';
import { getLocale } from '#/paraglide/runtime';
import Checkbox from '../input/Checkbox';

export interface InvitePopoverContentProps {
  url: string;
  embed?: string;
  inviteRequired?: boolean;
  fetchingInvite?: boolean;
  inviteUrl?: string;
  revokeInvite?: () => void;
  shareUrlHandler: (isEnglish: boolean) => void;
}

function InvitePopoverContent({
  url,
  embed,
  inviteRequired,
  fetchingInvite,
  inviteUrl,
  revokeInvite = () => {},
  shareUrlHandler,
}: InvitePopoverContentProps) {
  const [isShareInEnglish, setIsShareInEnglish] = useState(false);
  const locale = getLocale();
  return (
    <Column padding center grow gap="lg" className="w-full lg:pt-2 lg:w-68">
      {inviteRequired ? (
        <>
          {canShare() && (
            <>
              <Button
                preset="primary"
                onClick={shareUrlHandler.bind(null, isShareInEnglish)}
              >
                <ShareIcon className="[&>path]:stroke-black!" />
                <span>{m['invite-popover.share-invitation']()}</span>
              </Button>
              {!locale.startsWith('en') && (
                <Checkbox
                  label={m['invite-popover.share-in-english']()}
                  checked={isShareInEnglish}
                  onChange={() => setIsShareInEnglish((prev) => !prev)}
                />
              )}
            </>
          )}
          <InviteLinkInputField
            fetchingInvite={fetchingInvite}
            inviteUrl={inviteUrl}
            onRevokeInvite={revokeInvite}
          />
        </>
      ) : (
        <>
          {canShare() && (
            <>
              <Button
                preset="primary"
                onClick={shareUrlHandler.bind(null, isShareInEnglish)}
              >
                <ShareIcon className="**:stroke-black!" />
                <span>{m['invite-popover.share-room-link']()}</span>
              </Button>
              {!locale.startsWith('en') && (
                <Checkbox
                  label={m['invite-popover.share-in-english']()}
                  checked={isShareInEnglish}
                  onChange={() => setIsShareInEnglish((prev) => !prev)}
                />
              )}
            </>
          )}
          <CopyableTextInputField
            label={m['invite-popover.room-link']()}
            value={url}
            buttonPreset="accent3"
          />
          {!isMobile() && embed && (
            <CopyableTextInputField
              label={m['invite-popover.embed-code']()}
              value={embed}
              buttonPreset="accent5"
            />
          )}
        </>
      )}
    </Column>
  );
}

export interface InvitePopoverButtonProps extends InvitePopoverContentProps {
  initiallyVisible?: boolean;
  popoverApiRef?: PopoverAPIRef;
}
export function InvitePopoverButton({
  url,
  embed,
  initiallyVisible,
  popoverApiRef,
  inviteRequired,
  fetchingInvite,
  inviteUrl,
  revokeInvite,
  shareUrlHandler,
  ...rest
}: InvitePopoverButtonProps) {
  const title = m['invite-popover.title']();
  return (
    <Popover
      title={title}
      content={() => (
        <InvitePopoverContent
          url={url}
          embed={embed}
          inviteRequired={inviteRequired}
          fetchingInvite={fetchingInvite}
          inviteUrl={inviteUrl}
          revokeInvite={revokeInvite}
          shareUrlHandler={shareUrlHandler}
        />
      )}
      placement="top-start"
      offsetDistance={28}
      initiallyVisible={initiallyVisible}
      popoverApiRef={popoverApiRef}
    >
      {({ togglePopover, popoverVisible, triggerRef }) => (
        <ToolTip description={m['invite-tooltip.description']()}>
          <ToolbarButton
            ref={triggerRef}
            icon={InviteIcon}
            selected={popoverVisible}
            onClick={togglePopover}
            label={title}
            {...rest}
          />
        </ToolTip>
      )}
    </Popover>
  );
}
