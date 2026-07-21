import { useEffect, useReducer, type MouseEvent } from 'react';
// import '@/styles/sass/core/ui-root.module.scss';
// import '@/styles/sass/style-utils.module.scss';

import {
  CompactMoreMenuButton,
  MoreMenuContextProvider,
} from './room/MoreMenuPopover';
import RoomEntryModal from './room/RoomEntryModal';
import { AudioContext } from './WrapWithAudio';
import PreloadOverlay from './PreloadOverlay';
import type { Hub, UserInfo } from '#/types/hubs';
import { store } from '#/store/store';
import { useSelector } from '@tanstack/react-store';
import type HubChannel from '#/core/hub-channel';
import { m } from '@/paraglide/messages.js';
import { hubUrl } from '#/utils/phoenix-utils';
import AvatarEditor from './AvatarEditor';
import useAccessibleOutlineStyle from './input/useAccessibleOutlineStyle';
import type { Scene } from 'aframe';
import {
  ContentMenu,
  ECSDebugMenuButton,
  ObjectMenuButton,
  PeopleMenuButton,
} from './room/ContextMenu';
import { isLockedDownDemoRoom } from '#/utils/hubs';
import { qsTruthy } from '#/utils/qs_truthy';
import { getCurrentStreamer } from '#/utils/component-utils';
import { SpectatingLabel } from './room/SpectatingLabel';
import { ObjectMenuContainer } from './room/ObjectMenuContainer';
import { RoomLayout } from './room/RoomLayout';
import { useCssBreakpoints } from 'react-use-css-breakpoints';
import ToolbarButton, { ChatToolbarButton } from './input/ToolbarButton';
import EnterIcon from './icons/Enter.svg?react';
import LeaveIcon from './icons/Leave.svg?react';
import { InvitePopoverContainer } from './room/InvitePopoverContainer';
import ChatSidebarContainer from './room/ChatSidebarContainer';

const isMobileVR = false;
const isMobile = false;

interface ConditionalSignIn {
  predicate: () => boolean;
  action: () => void;
  signInMessage: string;
  onFailure?: (e: Error) => void;
}

interface UIRootProps {
  showPreload?: boolean;
  hub: Hub;
  hubChannel: HubChannel;
  scene: Scene;
  selectedObject?: object;
  onPreloadLoadClicked?: () => void;
  hubIsBound?: boolean;
  entryDisallowed?: boolean;
  breakpoint?: string;
  activeObject?: unknown;
  forcedVREntryType?: string;
  presences?: Record<string, UserInfo>;
  performConditionalSignIn?: (
    predicate: () => boolean,
    action: () => void,
    signInMessage: string,
    onFailure?: (e: Error) => void,
  ) => Promise<void>;
  showBitECSBasedClientRefreshPrompt?: boolean;
}

type SidebarType =
  | 'chat'
  | 'objects'
  | 'people'
  | 'profile'
  | 'user'
  | 'room-info'
  | 'room-info-settings'
  | 'room-settings'
  | 'ecs-debug';

interface UIState {
  entering: boolean;
  watching: boolean;
  entered: boolean;
  presenceCount: number;
  audioContext?: AudioContext;
  sidebarId: SidebarType | null;
  chatPrefix: string;
  chatAutofocus: boolean;
  selectedUserId: string | null;
  waitingOnAudio: boolean;
  dialog: unknown;
  isStreaming: boolean;
}

const initUIState: UIState = {
  entering: false,
  watching: false,
  entered: false,
  presenceCount: 0,
  isStreaming: false,
  sidebarId: null,
  chatPrefix: '',
  chatAutofocus: false,
  selectedUserId: null,
  waitingOnAudio: false,
  dialog: null,
};

type UITask =
  | { type: 'updateWatching'; watching: boolean }
  | { type: 'setSidebar'; id: SidebarType | null }
  | {
      type: 'toggleSidebar';
      id: SidebarType;
      otherState?: { chatPrefix: string; chatAutofocus: false };
    };

function handleUITask(state: UIState, task: UITask): UIState {
  switch (task.type) {
    case 'updateWatching': {
      return { ...state, watching: task.watching };
    }
    case 'setSidebar': {
      return {
        ...state,
        sidebarId: task.id,
        chatPrefix: '',
        chatAutofocus: false,
        selectedUserId: null,
      };
    }
    case 'toggleSidebar': {
      return {
        ...state,
        sidebarId: task.id === state.sidebarId ? null : task.id,
        selectedUserId: null,
        ...task.otherState,
      };
    }
  }
}

// const rootStyles = `ui ui-root ${this.isInModalOrOverlay() && 'in-modal-or-overlay'} ${isGhost} ${hide}`
export default function UIRoot(props: UIRootProps) {
  useAccessibleOutlineStyle();
  const breakpoint = useCssBreakpoints();
  // const { voice_chat: canVoiceChat } = usePermissions();

  useEffect(() => {
    const el = document.getElementById('preload-overlay');
    if (el) {
      el.classList.add('loaded');

      const sceneEl = props.scene;

      sceneEl.classList.add('scene');

      // Remove the preload overlay after the animation has finished.
      const timeout = setTimeout(() => {
        el.remove();
      }, 500);

      return () => {
        clearTimeout(timeout);
        sceneEl.classList.remove('scene');
      };
    }
  }, [props.scene]);

  const [state, dispatchState] = useReducer(handleUITask, initUIState);
  const currentStreamer = getCurrentStreamer();

  const renderEntryStartPanel = () => {
    // const waitingOnAudio = useSelector(store, (store) => store.waitingOnAudio);
    // const { hasAcceptedProfile, hasChangedNameOrPronouns } =
    //   store.state.activity;
    // const promptForNameAndAvatarBeforeEntry = props.hubIsBound
    //   ? !hasAcceptedProfile
    //   : !hasChangedNameOrPronouns;
    // const showJoinRoom = waitingOnAudio && !props.entryDisallowed;

    return (
      <>
        <RoomEntryModal
          roomName={props.hub.name}
          //   showJoinRoom={showJoinRoom}
          showJoinRoom={true}
          //   showEnterOnDevice={
          //     !waitingOnAudio && !props.entryDisallowed && !isMobileVR
          //   }
          showEnterOnDevice={true}
          // onEnterOnDevice={() => attemptLink()}
          //   showSpectate={!waitingOnAudio}
          showSpectate={true}
          onSpectate={() => {
            dispatchState({ type: 'updateWatching', watching: true });
          }}
          showRoomSettings={false}
          //   showRoomSettings={props.hubChannel.canOrWillIfCreator('update_hub')}
          //   onRoomSettings={() => {
          //     props.performConditionalSignIn(
          //       () => props.hubChannel.can('update_hub'),
          //       () => dispatchState({ type: 'setSidebar', id: 'room-settings' }),
          //       m['sign-in-modal.signin-message.room-settings'](),
          //     );
          //   }}
          entering={state.entering}
          onEnteringCanceled={() => {
            props.hubChannel.sendEnteringCanceledEvent();
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
    );
  };

  const occupantCount = () => {
    return props.presences ? Object.entries(props.presences).length : 0;
  };

  return (
    <>
      <MoreMenuContextProvider>
        <AudioContext value={state.audioContext || {}}>
          <div className="w-full h-full top-0 left-0 absolute pointer-events-none ui-root">
            {props.showPreload && props.hub && (
              <PreloadOverlay
                hubName={props.hub.name}
                hubScene={props.hub.scene}
                baseUrl={hubUrl(props.hub.hub_id)}
                onLoadClicked={props.onPreloadLoadClicked}
              />
            )}
            {/* {!state.dialog && <AvatarEditor />} */}
            {/* {!state.dialog && showMediaBrowser && (<MediaBrowserContainer/>)} */}
            {props.hub && (
              <RoomLayout
                scene={props.scene}
                objectFocused={!!props.selectedObject}
                streaming={state.isStreaming}
                viewport={
                  <>
                    {renderEntryStartPanel()}
                    {/* {state.dialog && renderEntryFlow ? entryDialog : undefined}
                    {props.selectedObject && <CompactMoreMenuButton />}
                    {!props.selectedObject ||
                      (breakpoint !== 'sm' && breakpoint !== 'md' && (
                        <ContentMenu>
                          {(state.entered || state.watching) &&
                            !isLockedDownDemoRoom() && (
                              <ObjectMenuButton
                                active={state.sidebarId === 'objects'}
                                onClick={() =>
                                  dispatchState({
                                    type: 'toggleSidebar',
                                    id: 'objects',
                                  })
                                }
                              />
                            )}
                          <PeopleMenuButton
                            active={state.sidebarId === 'people'}
                            disabled={isLockedDownDemoRoom()}
                            onClick={
                              !isLockedDownDemoRoom()
                                ? () =>
                                    dispatchState({
                                      type: 'toggleSidebar',
                                      id: 'people',
                                    })
                                : () => {}
                            }
                            presencecount={state.presenceCount}
                          />
                          {qsTruthy('ecsDebug') && (
                            <ECSDebugMenuButton
                              active={state.sidebarId === 'ecs-debug'}
                              onClick={() =>
                                dispatchState({
                                  type: 'toggleSidebar',
                                  id: 'ecs-debug',
                                })
                              }
                            />
                          )}
                        </ContentMenu>
                      ))}
                    {!state.entered &&
                      !state.isStreaming &&
                      !isMobile &&
                      currentStreamer?.streamerName && (
                        <SpectatingLabel name={currentStreamer?.streamerName} />
                      )}
                    {props.activeObject && (
                      <ObjectMenuContainer
                        hubChannel={props.hubChannel}
                        scene={props.scene}
                        onOpenProfile={() =>
                          dispatchState({ type: 'setSidebar', id: 'profile' })
                        }
                        onGoToObject={() => {
                          if (breakpoint === 'sm') {
                            dispatchState({ type: 'setSidebar', id: null });
                          }
                        }}
                      />
                    )}
                    {state.sidebarId !== 'chat' && props.hub && <PresenceLog />} */}
                  </>
                }
                sidebar={
                  state.sidebarId ? (
                    <>
                      {state.sidebarId === 'chat' && (
                        <ChatSidebarContainer
                          presences={props.presences}
                          occupantCount={occupantCount()}
                          canSpawnMessages={
                            state.entered &&
                            props.hubChannel.can('spawn_and_move_media')
                          }
                          scene={props.scene}
                          onClose={() => {
                            dispatchState({ type: 'setSidebar', id: null });
                          }}
                          autoFocus={state.chatAutofocus}
                          initialValue={state.chatPrefix}
                        />
                      )}
                    </>
                  ) : undefined
                }
                modal={null}
                toolbarLeft={
                  <>
                    <InvitePopoverContainer
                      hub={props.hub}
                      hubChannel={props.hubChannel}
                      scene={props.scene}
                    />
                  </>
                }
                toolbarCenter={
                  <>
                    {/* <ToolbarButton
                      icon={EnterIcon}
                      label={m['toolbar.join-room-button']()}
                      preset="accept"
                      onClick={() => {
                        console.log('clickly');
                      }}
                    /> */}
                    <ChatToolbarButton
                      onClick={() =>
                        dispatchState({
                          type: 'toggleSidebar',
                          id: 'chat',
                          otherState: { chatPrefix: '', chatAutofocus: false },
                        })
                      }
                      selected={state.sidebarId === 'chat'}
                    />
                  </>
                }
                toolbarRight={
                  <>
                    <ToolbarButton
                      icon={LeaveIcon}
                      label={m['toolbar.leave-room-button']()}
                      preset="cancel"
                      className="**:stroke-white"
                      onClick={() => {
                        console.log('clickly');
                      }}
                    />
                  </>
                }
              />
            )}
            {/* {props.showBitECSBasedClientRefreshPrompt && (
              <div className="bitecs-based-client-refresh-prompt">
                {m['ui-root.bitecs-based-client-refresh-prompt']()}
              </div>
            )} */}
          </div>
        </AudioContext>
      </MoreMenuContextProvider>
    </>
  );
}
