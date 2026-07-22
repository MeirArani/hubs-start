import {
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
  type SubmitEvent,
  type SubmitEventHandler,
} from 'react';
import { Column, type ColumnProps } from '../layout/Column';
import TextInputField from '../input/TextInputField';
import { m } from '#/paraglide/messages';
import Button from '../input/Button';
import { useSelector } from '@tanstack/react-store';
import { store } from '#/store/store';
import { preventOverflow } from '@popperjs/core';

export interface AvatarSettingsContentProps extends Omit<
  ColumnProps,
  'children'
> {
  disableDisplayNameInput?: boolean;
  onChangeDisplayName?: () => void;
  onChangePronouns?: () => void;
  avatarPreview?: ReactNode;
  onChangeAvatar?: () => void;
}

export function AvatarSettingsContent({
  disableDisplayNameInput,
  avatarPreview,
}: AvatarSettingsContentProps) {
  const displayNamePattern = '^[A-Za-z0-9_~\\s\\-]{3,32}$';
  const pronounsPattern = '^([a-zA-Z]{1,32}[\\/, ]\\s*){0,4}[a-zA-Z]{1,32}$';
  const nameInputRef = useRef<HTMLInputElement>(null);
  const pronounsInputRef = useRef<HTMLInputElement>(null);
  const { displayName, avatarId, pronouns } = useSelector(
    store,
    (state) => state.profile,
  );

  useEffect(() => {
    // this.scene.addEventListener("action_selected_media_result_entry", this.setAvatarFromMediaResult);

    // This handles editing avatars in the entry_step, since this component remains mounted with the same avatarId
    // this.scene.addEventListener("action_avatar_saved", this.refetchAvatar);
    // this.refetchAvatar();
    return () => {};
  });

  useEffect(() => {
    //refetchAvatar()
  }, [avatarId]);

  const saveStateAndFinish = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    // REIMP: activity.hasChangedNameOrPronouns
    store.setState((prev) => ({
      ...prev,
      activity: { ...prev.activity, hasAcceptedProfile: true },
    }));
  };

  return (
    <Column
      as="form"
      className="items-center p-6 pt-2.5 text-center gap-4"
      onSubmit={saveStateAndFinish}
    >
      <TextInputField
        disabled={disableDisplayNameInput}
        label={m['avatar-settings-content.display-name-label']()}
        value={displayName}
        pattern={displayNamePattern}
        placeholder="displayed over your avatar"
        spellCheck="false"
        required
        onKeyDown={(e) => e.stopPropagation()}
        onKeyUp={(e) => e.stopPropagation()}
        onChange={(e) =>
          store.setState((prev) => ({
            ...prev,
            profile: { ...prev.profile, displayName: e.target.value },
          }))
        }
        description={m['avatar-settings-content.display-name-description']()}
        ref={nameInputRef}
      />
      <TextInputField
        label={m['avatar-settings-content.pronouns-label']()}
        value={pronouns}
        pattern={pronounsPattern}
        placeholder="slash, comma, or space separated"
        spellCheck="false"
        onChange={(e) =>
          store.setState((prev) => ({
            ...prev,
            profile: { ...prev.profile, pronouns: e.target.value },
          }))
        }
        ref={pronounsInputRef}
      />
      <div className="flex flex-col relative items-center">
        {avatarPreview || (
          <div className="first:w-42! first:h-62.5! first:rounded first:bg-tile" />
        )}
        <Button
          preset="basic"
          className="absolute! bottom-0! mb-2!"
          onClick={() => {}}
        >
          {m['avatar-settings-content.change-avatar-button']()}
        </Button>
      </div>
      <Button preset="accept" type="submit">
        {m['button.accept']()}
      </Button>
    </Column>
  );
}
