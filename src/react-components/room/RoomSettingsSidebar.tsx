import { configs } from '#/core/configs';
import { useSelector } from '@tanstack/react-store';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useInviteUrl } from './hooks/useInviteUrl';
import { HubContext } from '../context/HubsContext';
import { useForm } from 'react-hook-form';
import Sidebar from '../sidebar/Sidebar';
import { m } from '#/paraglide/messages';
import BackButton from '../input/BackButton';
import { CloseButton } from '../input/CloseButton';
import { Column } from '../layout/Column';
import TextInputField from '../input/TextInputField';
import { TextAreaInputField } from '../input/TextAreaInputField';
import { NumericInputField } from '../input/NumericInputField';
import { RadioInputField } from '../input/RadioInputField';
import { RadioInputOption } from '../input/RadioInput';
import ToggleInput from '../input/ToggleInput';
import InputField from '../input/InputField';
import Button, { ApplyButton } from '../input/Button';
import { canShare } from '#/utils/share';
import ShareIcon from '../icons/Share.svg?react';
import { getLocale } from '#/paraglide/runtime';
import Checkbox from '../input/Checkbox';
import { InviteLinkInputField } from './InviteLinkInputField';
import { SceneInfo } from './RoomSidebar';
import type { Hub } from '#/core/hub';

const NotifiablePermissions = ['text_chat', 'voice_chat'] as const;

export interface RoomSettingsSidebarProps {
  onChangeScene?: () => void;
  onClose?: () => void;
  showBackButton?: boolean;
}

export default function RoomSettingsSidebar({
  showBackButton,
  onChangeScene,
  onClose,
}: RoomSettingsSidebarProps) {
  const { hub, hubChannel } = useContext(HubContext);
  const maxRoomSize = useSelector(
    configs,
    (state) => state.appConfig.features.maxRoomSize,
  );
  const { fetchingInvite, inviteUrl, revokeInvite } = useInviteUrl({
    hubChannel,
  });

  const locale = getLocale();

  // TODO: Apply Room Setting changes
  const applyChanges = useCallback(
    (settings: Hub) => {
      hubChannel.updateHub(settings);
      if (onClose) onClose();

      NotifiablePermissions.forEach((perm) => {
        if (
          window.APP.member_permissions[perm] !==
          settings.member_permissions[perm]
        ) {
          hubChannel.sendMessage(
            {
              permission: perm,
              status: settings.member_permissions[perm],
            },
            'permission',
          );
        }
      });
    },
    [hubChannel, onClose],
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<Hub>({ defaultValues: hub });

  const entryMode = watch('entry_mode');
  const spawnAndMoveMedia = watch('member_permissions.spawn_and_move_media');

  const [isShareInEnglish, setIsShareInEnglish] = useState(false);

  useEffect(() => {
    if (!spawnAndMoveMedia) {
      setValue('member_permissions.spawn_camera', false, { shouldDirty: true });
      setValue('member_permissions.pin_objects', false, { shouldDirty: true });
    }
  }, [spawnAndMoveMedia, setValue]);

  return (
    <Sidebar
      title={m['room-settings-sidebar.title']()}
      beforeTitle={
        showBackButton ? (
          <BackButton onClick={onClose} />
        ) : (
          <CloseButton onClick={onClose} />
        )
      }
    >
      <Column
        padding
        as="form"
        gap
        onSubmit={handleSubmit(applyChanges)}
        className="*:max-w-full"
      >
        {hub.scene && (
          <SceneInfo
            scene={hub.scene}
            canChangeScene
            onChangeScene={() => {}}
          />
        )}
        <TextInputField
          type="text"
          required
          autoComplete="off"
          placeholder={m['room-settings-sidebar.name-placeholder']()}
          minLength={1}
          maxLength={64}
          label={m['room-settings-sidebar.name']()}
          error={errors?.name?.message}
          fullWidth
          {...register('name')}
        />
        <TextAreaInputField
          autoComplete="off"
          placeholder={m['room-settings-sidebar.description-placeholder']()}
          label={m['room-settings-sidebar.description']()}
          minRows={3}
          error={errors?.description?.message}
          fullWidth
          {...register('description')}
        />
        <NumericInputField
          required
          min={0}
          max={maxRoomSize}
          placeholder={m['room-settings-sidebar.room-size-placeholder']()}
          label={m['room-settings-sidebar.room-size']()}
          error={errors?.room_size?.message}
          fullWidth
          {...register('room_size')}
        />
        <RadioInputField
          label={m['room-settings-sidebar.room-access']()}
          fullWidth
        >
          <RadioInputOption
            value="allow"
            label={m['room-settings-sidebar.access-shared-link']()}
            description={m[
              'room-settings-sidebar.access-shared-link-description'
            ]()}
            error={errors?.entry_mode?.message}
            {...register('entry_mode')}
          />
          <RadioInputOption
            value="invite"
            label={m['room-settings-sidebar.access-invite']()}
            description={m['room-settings-sidebar.access-invite-description']()}
            error={errors?.entry_mode?.message}
            {...register('entry_mode')}
          />
        </RadioInputField>
        {entryMode === 'invite' && (
          <>
            {canShare() && (
              <>
                <Button preset="primary" onClick={() => {}}>
                  <ShareIcon />
                  <span>{m['invite-popover.share-invitation']()}</span>
                </Button>
                {!locale.startsWith('en') && (
                  <Checkbox
                    label={m['invite-popover.share-in-english']()}
                    checked={isShareInEnglish}
                    onChange={() =>
                      setIsShareInEnglish((inEnglish) => !inEnglish)
                    }
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
        )}
        {hubChannel.can('update_hub_promotion') && (
          <ToggleInput
            label={m['room-settings-sidebar.access-public']()}
            description={m['room-settings-sidebar.access-public-description']()}
            {...register('allow_promotion')}
          />
        )}
        <InputField label={m['room-settings-sidebar.permissions']()} fullWidth>
          <div className="ml-5 *:mt-3 last:mr-0">
            <ToggleInput
              label={m['room-settings-sidebar.voice-chat']()}
              {...register('member_permissions.voice_chat')}
              onClick={() => {}}
            />
            <ToggleInput
              label={m['room-settings-sidebar.text-chat']()}
              {...register('member_permissions.text_chat')}
            />
            <ToggleInput
              label={m['room-settings-sidebar.spawn-and-move-media']()}
              {...register('member_permissions.spawn_and_move_media')}
            />
            <div className="ml-5 *:mt-3 last:mr-0">
              <ToggleInput
                label={m['room-settings-sidebar.spawn-camera']()}
                {...register('member_permissions.spawn_camera')}
              />
              <ToggleInput
                label={m['room-settings-sidebar.pin-objects']()}
                {...register('member_permissions.pin_objects')}
              />
            </div>
            <ToggleInput
              label={m['room-settings-sidebar.spawn-drawing']()}
              {...register('member_permissions.spawn_drawing')}
            />
            <ToggleInput
              label={m['room-settings-sidebar.spawn-emoji']()}
              {...register('member_permissions.spawn_emoji')}
            />
            <ToggleInput
              label={m['room-settings-sidebar.fly']()}
              {...register('member_permissions.fly')}
            />
          </div>
        </InputField>
        <InputField
          label={m['room-settings-sidebar.bitecs-client']()}
          fullWidth
        >
          <ToggleInput
            label={m['room-settings-sidebar.bitecs-client-activation']()}
            description={m[
              'room-settings-sidebar.bitecs-client-activation-description'
            ]()}
            {...register('user_data.hubs_use_bitecs_based_client')}
          />
        </InputField>
        <ApplyButton type="submit" />
      </Column>
    </Sidebar>
  );
}
