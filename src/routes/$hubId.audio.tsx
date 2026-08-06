import { m } from '#/paraglide/messages';
import BackButton from '#/react-components/input/BackButton';
import { Column } from '#/react-components/layout/Column';
import Spinner from '#/react-components/misc/Spinner';
import { Modal } from '#/react-components/modal/Modal';
import {
  createFileRoute,
  getRouteApi,
  useNavigate,
} from '@tanstack/react-router';
import MicrophoneIcon from '#/react-components/icons/Microphone.svg?react';
import MicrophoneMutedIcon from '#/react-components/icons/MicrophoneMuted.svg?react';
import VolumeLevelBar from '#/react-components/misc/VolumeLevelBar';
import ToolTip from '#/react-components/layout/ToolTip';
import ToggleInput from '#/react-components/input/ToggleInput';
import { useState } from 'react';
import { store } from '#/store/store';
import InfoIcon from '@/react-components/icons/Info.svg?react';
import SelectInputField from '#/react-components/input/SelectInputField';
import VolumeOffIcon from '#/react-components/icons/VolumeOff.svg?react';
import Button from '#/react-components/input/Button';

export const Route = createFileRoute('/$hubId/audio')({
  component: RouteComponent,
});

// REIMP Props
function RouteComponent() {
  const routeAPI = getRouteApi('/$hubId/audio');
  const nav = routeAPI.useNavigate();
  const isAudioInputSelectAvailable = true;
  const isAudioOutputSelectAvailable = true;
  // const { isMicEnabled, permissionStatus } = useMicrophoneStatus(scene);
  const isMicrophoneEnabled = true;
  const isMicrophoneMuted = false;
  const permissionStatus: string = 'denied';
  //   const { micDeviceChanged, micDevices } = useMicrophone(scene);
  //   const canVoiceChat = useCan("voice_chat");
  const canVoiceChat = true;
  //   const { speakerDeviceChanged, speakerDevices } = useSpeakers();
  //   const { playSound } = useSound({
  //     scene,
  //     sound: SOUND_SPEAKER_TONE
  //   });
  //   const [isMicMutedOnEntry, setIsMicMutedOnEntry] = useState(APP.store.state.preferences["muteMicOnEntry"]);
  //   const onChangeMicrophoneMuted = useCallback(({ target: { checked: muted } }) => {
  //     setIsMicMutedOnEntry(muted);
  //     APP.store.update({
  //       preferences: { muteMicOnEntry: muted }
  //     });
  //   }, []);

  const [isMicMutedOnEntry, setIsMicMutedOnEntry] = useState(
    store.state.preferences.micMuteOnEntry,
  );

  const navigate = getRouteApi('/$hubId/audio').useNavigate();

  const iconStyle = isMicrophoneEnabled
    ? 'w-12 h-12 text-text-primary [&>path]:stroke-1'
    : 'w-12 h-12 text-disabled-text [&>path]:stroke-1 [&>path]:text-disabled-icon';
  return (
    <Modal
      title={m['mic-setup-modal.title']()}
      beforeTitle={
        <BackButton
          onClick={() => {
            nav({ to: '/$hubId/profile' });
          }}
        />
      }
    >
      <Column
        center
        padding="lg"
        grow
        gap={'2xl'}
        className="**:[&>p]:text-sm **:[&>p]:font-medium **:[&>p]:leading-[1.2] last:mt-auto"
      >
        <p>{m['mic-setup-modal.check-mic']()}</p>
        <div className="flex gap-6 max-sm:flex-wrap">
          <div className="w-50 flex flex-auto flex-col gap-2.5 p-5 items-center border-1 border-toolbar-basic-border bg-transparent transition-colors">
            {(canVoiceChat && (
              <>
                <div className="flex mb-2.5">
                  <div>
                    {permissionStatus === 'prompt' && (
                      <div className="absolute -ml-2.75 -mt-2.75">
                        <Spinner />
                      </div>
                    )}
                    {permissionStatus === 'granted' &&
                    isMicrophoneEnabled &&
                    !!isMicrophoneMuted ? (
                      <MicrophoneIcon className={`${iconStyle}`} />
                    ) : (
                      <MicrophoneMutedIcon className={`${iconStyle}`} />
                    )}
                  </div>
                  {permissionStatus === 'granted' && (
                    <>{<VolumeLevelBar type="mic" className="w-6 h-full" />}</>
                  )}
                </div>
                <div className="h-12 mb-2.5 flex items-center gap-2.5">
                  {permissionStatus === 'granted' ? (
                    <>
                      <ToggleInput
                        label={m['mic-setup-modal.mute-mic-toggle-v2']()}
                        checked={isMicrophoneMuted}
                        onChange={(e) => {
                          setIsMicMutedOnEntry(e.currentTarget.checked);
                          store.setState((prev) => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              muteMicOnEntry: e.currentTarget.checked,
                            },
                          }));
                        }}
                      />
                      <ToolTip
                        location="right"
                        category="primary"
                        description="Toggle mic on/off anytime after you enter the room (M)"
                      >
                        <InfoIcon className="text-darkgrey" />
                      </ToolTip>
                    </>
                  ) : (
                    (permissionStatus === 'prompt' && (
                      <p>{m['mic-setup-modal.mic-permission-prompt']()}</p>
                    )) ||
                    (permissionStatus === 'denied' && (
                      <p>
                        <span className="text-sm font-bold">
                          {m['mic-setup-modal.error-title']()}
                        </span>{' '}
                        {m['mic-setup-modal.error-description']()}
                      </p>
                    ))
                  )}
                </div>
                {permissionStatus === 'granted' &&
                  isAudioInputSelectAvailable && (
                    <div className="flex flex-col flex-auto gap-2.5 self-stretch">
                      <p className="self-start">
                        {m['mic-setup-modal.microphone-text']()}
                      </p>
                      <SelectInputField
                        className="w-full max-w-none"
                        buttonClassName="selectionInput"
                        onChange={() => {}}
                        value=""
                        options={['test', 'test2']}
                        items={['test', 'test2']}
                        // {...microphoneOptions}
                      />
                    </div>
                  )}
              </>
            )) || (
              <div className="flex flex-col flex-auto items-center justify-center gap-5">
                <MicrophoneMutedIcon className={iconStyle} />
                <p className="text-disabled-text">
                  {m['mic-setup-modal.voice-chat-disabled']()}
                </p>
              </div>
            )}
          </div>
          <div className="w-50 flex flex-col flex-auto gap-2.5 p-5 items-center justify-center border border-toolbar-basic-border bg-transparent rounded transition-colors ">
            <div className="flex mb-2.5">
              <VolumeOffIcon className={`${iconStyle} mr-1.25`} />
              <> {<VolumeLevelBar type="mixer" className="w-6 h-full" />} </>
            </div>
            <div className="h-12 mb-2.5 flex items-center gap-2.5">
              <Button preset="basic" sm onClick={() => {}}>
                {m['mic-setup-modal.test-audio-button']()}
              </Button>
            </div>
            {permissionStatus === 'granted' && isAudioOutputSelectAvailable && (
              <div className="flex flex-col flex-auto gap-2.5 self-stretch">
                <p className="self-start">
                  {m['mic-setup-modal.speakers-text']()}
                </p>
                <SelectInputField
                  onChange={() => {}}
                  className="w-full max-w-none"
                  buttonClassName="selectionInput"
                  value={''}
                  options={[]}
                  items={[]}
                  //{...speakerOptions}
                />
              </div>
            )}
          </div>
        </div>
        <Button preset="primary" onClick={() => navigate({ to: '/$hubId' })}>
          {m['mic-setup-modal.enter-room-button']()}
        </Button>
      </Column>
    </Modal>
  );
}
