import { useState } from 'react'
import { MoreMenuContextProvider } from './room/MoreMenuPopover'
import RoomEntryModal from './room/RoomEntryModal'
import { ReactAudioContext } from './wrap-with-audio'
import PreloadOverlay from './preload-overlay'
import type Hub from '#/core/hub'

interface UIRootProps {
  showPreload?: boolean
  hub: Hub
  onPreloadLoadClicked: () => void
}

export default function UIRoot({
  showPreload,
  hub,
  onPreloadLoadClicked,
}: UIRootProps) {
  const rootStyles = `ui ui-root` //`ui ui-root ${this.isInModalOrOverlay() && 'in-modal-or-overlay'} ${isGhost} ${hide}`

  const [audioContext, setAudioContext] = useState({
    playSound: (sound: string) => {},
    onMouseLeave: () => {},
  })

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
