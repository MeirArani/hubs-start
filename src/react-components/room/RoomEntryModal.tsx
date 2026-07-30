import { useCssBreakpoints } from 'react-use-css-breakpoints';
import { Modal } from '../modal/Modal';

import AppLogo from '../AppLogo';
import Button from '../input/Button';
import { Column } from '../layout/Column';
import EnterIcon from '../icons/Enter.svg?react';
import VRIcon from '../icons/VR.svg?react';
import ShowIcon from '../icons/Show.svg?react';
import SettingsIcon from '../icons/Settings.svg?react';
// import '@/styles/sass/room/RoomEntryModal.module.scss';
import { m } from '@/paraglide/messages.js';
import { useEffect } from 'react';

export default function RoomEntryModal({
  className,
  roomName,
  showJoinRoom = true,
  onJoinRoom,
  showEnterOnDevice = true,
  onEnterOnDevice,
  showSpectate = true,
  onSpectate,
  showRoomSettings = true,
  onRoomSettings,
  entering = false,
  onEnteringCanceled,
  ...rest
}: {
  className?: string;
  roomName: string;
  showJoinRoom?: boolean;
  onJoinRoom?: () => void;
  showEnterOnDevice?: boolean;
  onEnterOnDevice?: () => void;
  showSpectate?: boolean;
  onSpectate?: () => void;
  showRoomSettings?: boolean;
  onRoomSettings?: () => void;
  entering?: boolean;
  onEnteringCanceled?: () => void;
}) {
  const breakpoint = useCssBreakpoints();

  useEffect(() => {
    if (entering && onEnteringCanceled) onEnteringCanceled();
  }, [entering, onEnteringCanceled]);

  return (
    <Modal
      className={`room-entry-modal ${className}`}
      disableFullscreen
      {...rest}
    >
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
            <Button preset="accent4" onClick={onJoinRoom} leftAligned>
              <EnterIcon className="*:stroke-white" />
              <span>{m['room-entry-modal.join-room-button']()}</span>
            </Button>
          )}
          {showEnterOnDevice && (
            <Button preset="accent5" onClick={onEnterOnDevice} leftAligned>
              <VRIcon className="**:fill-white shrink-0" />
              <span>{m['room-entry-modal.enter-on-device-button']()}</span>
            </Button>
          )}
          {showSpectate && (
            <Button preset="accent2" onClick={onSpectate} leftAligned>
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
                <SettingsIcon />
                <span>{m['room-entry-modal.room-settings-button']()}</span>
              </Button>
            </>
          )}
        </Column>
      </Column>
    </Modal>
  );
}
