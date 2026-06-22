import { useState } from 'react'
import { MoreMenuContextProvider } from './room/MoreMenuPopover'
import RoomEntryModal from './room/RoomEntryModal'
import { ReactAudioContext } from './WrapWithAudio'
import PreloadOverlay from './PreloadOverlay'
import type Hub from '#/core/hub'
import { store } from '#/store/Store'
import { useSelector } from '@tanstack/react-store'
import type HubChannel from '#/core/hub-channel'

const isMobileVR = false
const isMobile = false

interface ConditionalSignIn {
  predicate: () => boolean
  action: () => void
  signInMessage: string
  onFailure?: (e: Error) => void
}
interface UIRootProps {
  showPreload?: boolean
  hub: Hub
  hubChannel: HubChannel
  onPreloadLoadClicked: () => void
  hubIsBound?: boolean
  entryDisallowed?: boolean
  forcedVREntryType?: string
  performConditionalSignIn?: (
    predicate: () => boolean,
    action: () => void,
    signInMessage: string,
    onFailure?: (e: Error) => void,
  ) => Promise<void>
}

export default function UIRoot({
  showPreload,
  hub,
  onPreloadLoadClicked,
  hubIsBound = false,
  entryDisallowed = false,
  hubChannel,
  forcedVREntryType,
  performConditionalSignIn,
}: UIRootProps) {
  const rootStyles = `ui ui-root` //`ui ui-root ${this.isInModalOrOverlay() && 'in-modal-or-overlay'} ${isGhost} ${hide}`

  const [entering, setEntering] = useState(false)
  const [watching, setWatching] = useState(false)
  const [audioContext, setAudioContext] = useState({
    playSound: (sound: string) => {},
    onMouseLeave: () => {},
  })

  const renderEntryStartPanel = () => {
    const waitingOnAudio = useSelector(store, (store) => store.waitingOnAudio)
    const { hasAcceptedProfile, hasChangedNameOrPronouns } =
      store.state.activity
    const promptForNameAndAvatarBeforeEntry = hubIsBound
      ? !hasAcceptedProfile
      : !hasChangedNameOrPronouns
    const showJoinRoom = waitingOnAudio && !entryDisallowed

    return (
      <>
        <RoomEntryModal
          roomName={hub.name}
          showJoinRoom={showJoinRoom}
          showEnterOnDevice={!waitingOnAudio && !entryDisallowed && !isMobileVR}
          onEnterOnDevice={() => attemptLink()}
          showSpectate={!waitingOnAudio}
          onSpectate={() => {
            setWatching(true)
          }}
          showRoomSettings={hubChannel.canOrWillIfCreator('update_hub')}
          onRoomSettings={() => {
            performConditionalSignIn(
              () => hubChannel.can('update_hub'),
              () => setSidebar('room-settings'),
            )
          }}
          onJoinRoom={() => {
            // if (isLockedDownDemo) {
            //   if (this.props.forcedVREntryType?.startsWith("vr")) {
            //     this.setState({ enterInVR: true }, this.onAudioReadyButton);
            //     return;
            //   }
            //   return this.onAudioReadyButton();
            // }
            // if (promptForNameAndAvatarBeforeEntry || !forcedVREntryType) {
            //   setEntering(true)
            //   // this.props.hubChannel.sendEnteringEvent();
            //    if (promptForNameAndAvatarBeforeEntry) {
            //     this.pushHistoryState("entry_step", "profile");
            //   } else {
            //     this.onRequestMicPermission();
            //     this.pushHistoryState("entry_step", "audio");
            //   }
            // } else {
            //   this.handleForceEntry();
            // }
          }}
        />
      </>
    )
  }

  return (
    <>
      <MoreMenuContextProvider>
        <ReactAudioContext.Provider value={audioContext}>
          <div className={`${rootStyles}`}>
            {showPreload && hub && (
              <PreloadOverlay
                hubName={hub.name}
                hubScene={hub.scene}
                baseUrl={hubUrl(hub.hub_id)}
                onLoadClicked={onPreloadLoadClicked}
              />
            )}
          </div>
        </ReactAudioContext.Provider>
      </MoreMenuContextProvider>
    </>
  )
}
