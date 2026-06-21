import { useCssBreakpoints } from 'react-use-css-breakpoints'
import { Modal } from '../modal/Modal'
import { FormattedMessage } from 'react-intl'
import AppLogo from '../AppLogo'
import Button from '../input/Button'
import { Column } from '../layout/Column'
import EnterIcon from '../icons/Enter.svg?react'
import VRIcon from '../icons/VR.svg?react'
import ShowIcon from '../icons/Show.svg?react'
import SettingsIcon from '../icons/Settings.svg?react'
import '@/styles/sass/room/RoomEntryModal.module.scss'

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
  ...rest
}: {
  className?: string
  roomName: string
  showJoinRoom?: boolean
  onJoinRoom?: () => void
  showEnterOnDevice?: boolean
  onEnterOnDevice?: () => void
  showSpectate?: boolean
  onSpectate?: () => void
  showRoomSettings?: boolean
  onRoomSettings?: () => void
}) {
  const breakpoint = useCssBreakpoints()

  return (
    <Modal
      className={`room-entry-modal ${className}`}
      disableFullscreen
      {...rest}
    >
      <Column center className="content">
        {breakpoint !== 'sm' && breakpoint !== 'md' && (
          <AppLogo className="logo" />
        )}
        <div className="room-name">
          <h5>
            <FormattedMessage
              id="room-entry-modal.room-name-label"
              defaultMessage="Room Name"
            />
          </h5>
          <p>{roomName}</p>
        </div>
        <Column center className="buttons">
          {showJoinRoom && (
            <Button preset="accent4" onClick={onJoinRoom}>
              <EnterIcon />
              <span>
                <FormattedMessage
                  id="room-entry-modal.join-room-button"
                  defaultMessage="Join Room"
                />
              </span>
            </Button>
          )}
          {showEnterOnDevice && (
            <Button preset="accent5" onClick={onEnterOnDevice}>
              <VRIcon />
              <span>
                <FormattedMessage
                  id="room-entry-modal.enter-on-device-button"
                  defaultMessage="Enter On Device"
                />
              </span>
            </Button>
          )}
          {showSpectate && (
            <Button preset="accent2" onClick={onSpectate}>
              <ShowIcon />
              <span>
                <FormattedMessage
                  id="room-entry-modal.spectate-button"
                  defaultMessage="Spectate"
                />
              </span>
            </Button>
          )}
          {showRoomSettings && breakpoint !== 'sm' && (
            <>
              <hr className="show-lg" />
              <Button
                preset="transparent"
                className="show-lg"
                onClick={onRoomSettings}
              >
                <SettingsIcon />
                <span>
                  <FormattedMessage
                    id="room-entry-modal.room-settings-button"
                    defaultMessage="Room Settings"
                  />
                </span>
              </Button>
            </>
          )}
        </Column>
      </Column>
    </Modal>
  )
}
