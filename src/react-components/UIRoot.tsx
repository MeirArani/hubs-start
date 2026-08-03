import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ActionDispatch,
  type MouseEvent,
} from 'react';
// import '@/styles/sass/core/ui-root.module.scss';
// import '@/styles/sass/style-utils.module.scss';

import {
  CompactMoreMenuButton,
  MoreMenuContextProvider,
  MoreMenuPopoverButton,
} from './room/MoreMenuPopover';
import RoomEntryModal from './room/RoomEntryModal';
import { AudioContext } from './WrapWithAudio';
import PreloadOverlay from './PreloadOverlay';
import type { Hub, UserInfo } from '#/types/hubs';
import { store } from '#/store/store';
import { _useStore, useSelector } from '@tanstack/react-store';
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
import { Outlet, useNavigate } from '@tanstack/react-router';
import { HubContext } from '#/routes/$hubId';
import RoomSettingsSidebar from './room/RoomSettingsSidebar';
import AddIcon from '@/react-components/icons/Add.svg?react';
import AvatarIcon from '@/react-components/icons/Avatar.svg?react';
import FavoritesIcon from '@/react-components/icons/Favorites.svg?react';
import SettingsIcon from '@/react-components/icons/Settings.svg?react';
import HomeIcon from '@/react-components/icons/Home.svg?react';
import InviteIcon from '@/react-components/icons/Invite.svg?react';
import CameraIcon from '@/react-components/icons/Camera.svg?react';
import DeleteIcon from '@/react-components/icons/Delete.svg?react';
import DiscordIcon from '@/react-components/icons/Discord.svg?react';
import SupportIcon from '@/react-components/icons/Support.svg?react';
import ShieldIcon from '@/react-components/icons/Shield.svg?react';
import TextDocumentIcon from '@/react-components/icons/TextDocument.svg?react';
import WarningCircleIcon from '@/react-components/icons/WarningCircle.svg?react';
import StarIcon from '@/react-components/icons/Star.svg?react';
import StarOutlineIcon from '@/react-components/icons/StarOutline.svg?react';
import { configs as ConfigStore } from '#/core/configs';
import { RoomSidebar } from './room/RoomSidebar';

const isMobileVR = false;
const isMobile = false;

export interface HubUIContextParams {
  dispatchState?: ActionDispatch<[task: UITask]>;
}

export const HubUIContext = createContext<HubUIContextParams>({});

interface ConditionalSignIn {
  predicate: () => boolean;
  action: () => void;
  signInMessage: string;
  onFailure?: (e: Error) => void;
}

interface UIRootProps {
  sessionId?: string;
  showPreload?: boolean;
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
  signedIn: boolean;
  isFavorited: boolean;
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
  signedIn: false,
  isFavorited: false,
};

type UITask =
  | { type: 'setWatching'; watching: boolean }
  | { type: 'setEntering'; entering: boolean }
  | { type: 'setSidebar'; id: SidebarType | null }
  | {
      type: 'toggleSidebar';
      id: SidebarType;
      otherState?: { chatPrefix: string; chatAutofocus: false };
    };

function handleUITask(state: UIState, task: UITask): UIState {
  switch (task.type) {
    case 'setWatching': {
      return { ...state, watching: task.watching };
    }
    case 'setEntering': {
      return { ...state, entering: task.entering };
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
  const { hub, hubChannel, scene } = useContext(HubContext);
  useAccessibleOutlineStyle();
  const navigate = useNavigate();
  const breakpoint = useCssBreakpoints();
  // const { voice_chat: canVoiceChat } = usePermissions();

  const [configs, { features, link }] = _useStore(
    ConfigStore,
    (state) => state,
  );

  useEffect(() => {
    const el = document.getElementById('preload-overlay');
    if (el) {
      el.classList.add('loaded');

      const sceneEl = scene;

      sceneEl?.classList.add('scene');

      // Remove the preload overlay after the animation has finished.
      const timeout = setTimeout(() => {
        el.remove();
      }, 500);

      return () => {
        clearTimeout(timeout);
        sceneEl?.classList.remove('scene');
      };
    }
  }, [scene]);

  const [state, dispatchState] = useReducer(handleUITask, initUIState);
  const currentStreamer = getCurrentStreamer();

  const canCreateRooms = !features('disableRoomCreation') || configs.isAdmin;
  const canCloseRoom = hubChannel.canOrWillIfCreator('close_hub');
  const isModerator =
    hubChannel.canOrWillIfCreator('kick_users') && !isMobileVR;

  const renderEntryStartPanel = () => {
    const waitingOnAudio = useSelector(store, (store) => store.waitingOnAudio);
    const { hasAcceptedProfile, hasChangedNameOrPronouns } =
      store.state.activity;
    const promptForNameAndAvatarBeforeEntry = props.hubIsBound
      ? !hasAcceptedProfile
      : !hasChangedNameOrPronouns;
    const showJoinRoom = waitingOnAudio && !props.entryDisallowed;

    return (
      <>
        <RoomEntryModal
          roomName={hub.name || ''}
          showJoinRoom={true}
          //   showEnterOnDevice={
          //     !waitingOnAudio && !props.entryDisallowed && !isMobileVR
          //   }
          showEnterOnDevice={true}
          // onEnterOnDevice={() => attemptLink()}
          //   showSpectate={!waitingOnAudio}
          showSpectate={true}
          onSpectate={() => {
            dispatchState({ type: 'setWatching', watching: true });
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
            hubChannel?.sendEnteringCanceledEvent();
          }}
          onJoinRoom={() => {
            if (promptForNameAndAvatarBeforeEntry || !props.forcedVREntryType) {
              dispatchState({ type: 'setEntering', entering: true });
              hubChannel?.sendEnteringEvent();
              if (promptForNameAndAvatarBeforeEntry) {
                // this.pushHistoryState('entry_step', 'profile');
                navigate({
                  to: '.',
                });
              } else {
                this.onRequestMicPermission();
                this.pushHistoryState('entry_step', 'audio');
              }
            } else {
              this.handleForceEntry();
            }
          }}
        />
      </>
    );
  };

  const occupantCount = () => {
    return props.presences ? Object.entries(props.presences).length : 0;
  };

  const onChangeScene = () => {
    // TODO: Add logic
  };

  const moreMenu = [
    {
      id: 'user',
      label: !state.signedIn
        ? m['more-menu.not-signed-in']()
        : m['more-menu.you-signed-in-as']({
            email: 'fa.e@email.com',
          }),
      items: [
        state.signedIn
          ? {
              id: 'sign-out',
              label: m['more-menu.sign-out'](),
              icon: LeaveIcon,
              onClick: async () => {},
            }
          : {
              id: 'sign-in',
              label: m['more-menu.sign-in'](),
              icon: EnterIcon,
              onClick: () => {},
            },
        canCreateRooms && {
          id: 'create-room',
          label: m['more-menu.create-room'](),
          icon: AddIcon,
          onClick: async () => {},
        },
        {
          id: 'user-profile',
          label: m['more-menu.profile'](),
          icon: AvatarIcon,
          onClick: () => {
            dispatchState({
              type: 'setSidebar',
              id: 'profile',
            });
          },
        },
        {
          id: 'favorite-rooms',
          label: m['more-menu.favorite-rooms'](),
          icon: FavoritesIcon,
          onClick: () => {},
        },
        {
          id: 'preferences',
          label: m['more-menu.preferences'](),
          icon: SettingsIcon,
          onClick: () => {},
        },
      ].filter((item) => item), // CHECK
    },
    {
      id: 'room',
      label: m['more-menu.room'](),
      items: [
        {
          id: 'room-info',
          label: m['more-menu.room-info'](),
          icon: HomeIcon,
          onClick: () => {
            dispatchState({
              type: 'setSidebar',
              id: 'room-info',
            });
          },
        },
        breakpoint === 'sm' ||
          (breakpoint === 'md' &&
            (hub.entry_mode !== 'invite' || hubChannel.can('update_hub')) && {
              id: 'invite',
              label: m['more-menu.invite'](),
              icon: InviteIcon,
              onClick: () => {},
            }),
        state.isFavorited
          ? {
              id: 'unfavorite-room',
              label: m['more-menu.unfavorite-room'](),
              icon: StarIcon,
              onClick: () => {},
            }
          : {
              id: 'favorite-room',
              label: m['more-menu.favorite-room'](),
              icon: StarOutlineIcon,
              onClick: () => {},
            },
        isModerator &&
          state.entered && {
            id: 'streamer-mode',
            label: state.isStreaming
              ? m['more-menu.exit-streamer-mode']
              : m['more-menu.enter-streamer-mode'](),
            icon: CameraIcon,
            onClick: () => {},
          },
        (breakpoint === 'sm' || breakpoint === 'md') &&
          state.entered && {
            id: 'leave-room',
            label: m['more-menu.enter-leave-room'](),
            icon: LeaveIcon,
            onClick: () => {},
          },
        canCloseRoom && {
          id: 'close-room',
          label: m['more-menu.close-room'](),
          icon: DeleteIcon,
          onClick: () => {},
        },
      ].filter((item) => item),
    },
    {
      id: 'support',
      label: m['more-menu.support'](),
      items: [
        features('showCommunityLink') && {
          id: 'community',
          label: m['more-menu.community'](),
          icon: DiscordIcon,
          href: link('community'),
        },
        features('showIssueReportLink') && {
          id: 'report-issue',
          label: m['more-menu.report-issue'](),
          icon: WarningCircleIcon,
          href: link('issueReport'),
        },
        state.entered && {
          id: 'start-tour',
          label: m['more-menu.start-tour'](),
          icon: SupportIcon,
          onClick: () => {},
        },
        features('showDocsLink') && {
          id: 'help',
          label: m['more-menu.help'](),
          icon: SupportIcon,
          href: link('docs'),
        },
        features('showControlsLink') && {
          id: 'controls',
          label: m['more-menu.controls'](),
          icon: SupportIcon,
          href: link('controls'),
        },
        features('showWhatsNewLink') && {
          id: 'whats-new',
          label: m['more-menu.whats-new'](),
          icon: SupportIcon,
          href: '/whats-new',
        },
        features('showTerms') && {
          id: 'tos',
          label: m['more-menu.tos'](),
          icon: TextDocumentIcon,
          href: link('termsOfUse'),
        },
        features('showPrivacy') && {
          id: 'privacy',
          label: m['more-menu.privacy'](),
          icon: ShieldIcon,
          href: link('privacyNotice'),
        },
      ].filter((item) => item),
    },
  ];

  return (
    <>
      <MoreMenuContextProvider>
        <HubUIContext value={{ dispatchState: dispatchState }}>
          <AudioContext value={state.audioContext || {}}>
            <div className="w-full h-full top-0 left-0 absolute pointer-events-none ui-root">
              {props.showPreload && hub && (
                <PreloadOverlay
                  hubName={hub.name}
                  hubScene={hub.scene}
                  baseUrl={hubUrl(hub.hub_id)}
                  onLoadClicked={props.onPreloadLoadClicked}
                />
              )}
              {/* {!state.dialog && <AvatarEditor />} */}
              {/* {!state.dialog && showMediaBrowser && (<MediaBrowserContainer/>)} */}
              {hub && (
                <RoomLayout
                  scene={scene!}
                  objectFocused={!!props.selectedObject}
                  streaming={state.isStreaming}
                  viewport={
                    <>
                      <Outlet />
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
                              hubChannel?.can('spawn_and_move_media')
                            }
                            scene={scene!}
                            onClose={() => {
                              dispatchState({ type: 'setSidebar', id: null });
                            }}
                            autoFocus={state.chatAutofocus}
                            initialValue={state.chatPrefix}
                          />
                        )}
                        {state.sidebarId === 'room-settings' && (
                          <RoomSettingsSidebar
                            onClose={() =>
                              dispatchState({ type: 'setSidebar', id: null })
                            }
                            onChangeScene={() => {}}
                          />
                        )}
                        {state.sidebarId === 'room-info' && (
                          <RoomSidebar
                            accountId={props.sessionId || ''}
                            room={hub}
                            canEdit={hubChannel.canOrWillIfCreator(
                              'update_hub',
                            )}
                            onEdit={() => {}}
                            onClose={() =>
                              dispatchState({ type: 'setSidebar', id: null })
                            }
                            onChangeScene={onChangeScene}
                          />
                        )}
                      </>
                    ) : undefined
                  }
                  modal={null}
                  toolbarLeft={
                    <>
                      <InvitePopoverContainer
                        hub={hub}
                        hubChannel={hubChannel}
                        scene={scene!}
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
                            otherState: {
                              chatPrefix: '',
                              chatAutofocus: false,
                            },
                          })
                        }
                        selected={state.sidebarId === 'chat'}
                      />
                    </>
                  }
                  toolbarRight={
                    <>
                      <MoreMenuPopoverButton menu={moreMenu} />
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
        </HubUIContext>
      </MoreMenuContextProvider>
    </>
  );
}

// {/* {renderEntryStartPanel()} */}
//   {/* {state.dialog && renderEntryFlow ? entryDialog : undefined}
//   {props.selectedObject && <CompactMoreMenuButton />}
//   {!props.selectedObject ||
//     (breakpoint !== 'sm' && breakpoint !== 'md' && (
//       <ContentMenu>
//         {(state.entered || state.watching) &&
//           !isLockedDownDemoRoom() && (
//             <ObjectMenuButton
//               active={state.sidebarId === 'objects'}
//               onClick={() =>
//                 dispatchState({
//                   type: 'toggleSidebar',
//                   id: 'objects',
//                 })
//               }
//             />
//           )}
//         <PeopleMenuButton
//           active={state.sidebarId === 'people'}
//           disabled={isLockedDownDemoRoom()}
//           onClick={
//             !isLockedDownDemoRoom()
//               ? () =>
//                   dispatchState({
//                     type: 'toggleSidebar',
//                     id: 'people',
//                   })
//               : () => {}
//           }
//           presencecount={state.presenceCount}
//         />
//         {qsTruthy('ecsDebug') && (
//           <ECSDebugMenuButton
//             active={state.sidebarId === 'ecs-debug'}
//             onClick={() =>
//               dispatchState({
//                 type: 'toggleSidebar',
//                 id: 'ecs-debug',
//               })
//             }
//           />
//         )}
//       </ContentMenu>
//     ))}
//   {!state.entered &&
//     !state.isStreaming &&
//     !isMobile &&
//     currentStreamer?.streamerName && (
//       <SpectatingLabel name={currentStreamer?.streamerName} />
//     )}
//   {props.activeObject && (
//     <ObjectMenuContainer
//       hubChannel={props.hubChannel}
//       scene={props.scene}
//       onOpenProfile={() =>
//         dispatchState({ type: 'setSidebar', id: 'profile' })
//       }
//       onGoToObject={() => {
//         if (breakpoint === 'sm') {
//           dispatchState({ type: 'setSidebar', id: null });
//         }
//       }}
//     />
//   )}
//   {state.sidebarId !== 'chat' && props.hub && <PresenceLog />} */}
// </>
