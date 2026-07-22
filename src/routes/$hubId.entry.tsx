import { Modal, type ModalProps } from '#/react-components/modal/Modal';
import { store } from '#/store/store';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useSelector } from '@tanstack/react-store';
import { useContext, useEffect } from 'react';
import { useCssBreakpoints } from 'react-use-css-breakpoints';
import { HubContext } from './$hubId';
import { m } from '#/paraglide/messages';
import AppLogo from '#/react-components/AppLogo';
import Button from '#/react-components/input/Button';
import { Column } from '#/react-components/layout/Column';
import EnterIcon from '#/react-components/icons/Enter.svg?react';
import VRIcon from '#/react-components/icons/VR.svg?react';
import ShowIcon from '#/react-components/icons/Show.svg?react';
import SettingsIcon from '#/react-components/icons/Settings.svg?react';

export const Route = createFileRoute('/$hubId/entry')({
  component: RoomEntryContainer,
});

export interface RoomEntryContainerProps extends ModalProps {
  hubIsBound?: boolean;
  entryDisallowed?: boolean;
  roomName?: string;
  showEnterOnDevice?: boolean;
  showSpectate?: boolean;
  onSpectate?: () => void;
  showRoomSettings?: boolean;
  onRoomSettings?: () => void;
  entering?: boolean;
}

function RoomEntryContainer({
  hubIsBound,
  entryDisallowed,
  roomName,
  showEnterOnDevice = true,
  showSpectate = true,
  showRoomSettings = true,
  entering = false,
}: RoomEntryContainerProps) {
  const params = Route.useParams();
  const navigate = useNavigate();
  const breakpoint = useCssBreakpoints();
  const { hub, hubChannel, scene } = useContext(HubContext);
  useEffect(() => {
    if (entering) hubChannel?.sendEnteringCanceledEvent();
  }, [entering]);
  const waitingOnAudio = useSelector(store, (store) => store.waitingOnAudio);
  const { hasAcceptedProfile, hasChangedNameOrPronouns } = store.state.activity;
  const promptForNameAndAvatarBeforeEntry = hubIsBound
    ? !hasAcceptedProfile
    : !hasChangedNameOrPronouns;
  const showJoinRoom = true || (waitingOnAudio && !entryDisallowed);

  console.log(promptForNameAndAvatarBeforeEntry);

  const onJoinRoom = () => {
    if (promptForNameAndAvatarBeforeEntry) {
      // dispatchState({ type: 'setEntering', entering: true });
      hubChannel?.sendEnteringEvent();
      // if (promptForNameAndAvatarBeforeEntry) {
      // this.pushHistoryState('entry_step', 'profile');
      navigate({
        to: '/$hubId/profile',
        params: { hubId: params.hubId },
      });
      // } else {
      //this.onRequestMicPermission();
      //this.pushHistoryState('entry_step', 'audio');
      // }
    } else {
      //this.handleForceEntry();
    }
  };

  const onRoomSettings = () => {};

  return (
    <Modal disableFullscreen>
      <Column
        center
        lastChildMargin={false}
        className="py-6 px-2 [&>*>button]:w-39 lg:p-6 "
      >
        {breakpoint !== 'sm' && breakpoint !== 'md' && (
          <AppLogo className="h-auto max-w-65 max-h-35 object-contain object-center mt-4 mx-4 m-8" />
        )}
        <div className="flex flex-col items-center mb-4">
          <h5>{m['room-entry-modal.room-name-label']()}</h5>
          <p className="text-sm text-center text-black">{roomName}</p>
        </div>
        <Column center gap className="mx-4 lg:mx-2">
          {showJoinRoom && (
            <Button preset="accent4" onClick={onJoinRoom}>
              <EnterIcon className="*:stroke-white" />
              <span>{m['room-entry-modal.join-room-button']()}</span>
            </Button>
          )}
          {showEnterOnDevice && (
            <Button
              preset="accent5"
              onClick={() => {
                console.log('Entering on Device...');
              }}
            >
              <VRIcon className="**:fill-white shrink-0" />
              <span>{m['room-entry-modal.enter-on-device-button']()}</span>
            </Button>
          )}
          {showSpectate && (
            <Button
              preset="accent2"
              onClick={() => {
                console.log('Spectating');
              }}
            >
              <ShowIcon className="*:stroke-white" />
              <span>{m['room-entry-modal.spectate-button']()}</span>
            </Button>
          )}
          {showRoomSettings && breakpoint !== 'sm' && (
            <>
              <hr className="max-lg:hidden!" />
              <Button
                preset="transparent"
                className="max-lg:hidden!"
                onClick={onRoomSettings}
              >
                <SettingsIcon className="shrink-0" />
                <span>{m['room-entry-modal.room-settings-button']()}</span>
              </Button>
            </>
          )}
        </Column>
      </Column>
    </Modal>
  );
}
