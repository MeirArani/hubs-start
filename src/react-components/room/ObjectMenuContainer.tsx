import { ObjectMenuButton } from './ContextMenu';
import AvatarIcon from '../icons/Avatar.svg';
import HideIcon from '../icons/Hide.svg';
import { m } from '@/paraglide/messages';
import type HubChannel from '#/core/hub-channel';
import {
  getObjectUrl,
  isMe,
  isPlayer,
  useGoToSelectedObject,
  useHideAvatar,
  usePinObject,
  useRemoveObject,
  type HubObject,
} from './object-hooks';
import type { Scene } from 'aframe';
import PinIcon from '../icons/Pin.svg';
import LinkIcon from '../icons/Link.svg';
import GoToIcon from '../icons/GoTo.svg';
import DeleteIcon from '../icons/Delete.svg';
import { useObjectList } from './hooks/useObjectList';
import ObjectMenu from './ObjectMenu';

function MyMenuItems({ onOpenProfile }: { onOpenProfile: () => void }) {
  return (
    <ObjectMenuButton onClick={onOpenProfile}>
      <AvatarIcon />
      <span>{m['object-menu.edit-avatar-button']()}</span>
    </ObjectMenuButton>
  );
}

function PlayerMenuItems({
  hubChannel,
  activeObject,
  deselectObject,
}: {
  hubChannel: HubChannel;
  activeObject: HubObject;
  deselectObject: () => void;
}) {
  const hideAvatar = useHideAvatar(hubChannel, activeObject);

  return (
    <ObjectMenuButton
      onClick={() => {
        deselectObject();
        hideAvatar();
      }}
    >
      <HideIcon />
      <span>{m['object-menu.hide-avatar-button']()}</span>
    </ObjectMenuButton>
  );
}

function ObjectMenuItems({
  hubChannel,
  scene,
  activeObject,
  deselectObject,
  onGoToObject,
}: {
  hubChannel: HubChannel;
  scene: Scene;
  activeObject: HubObject;
  deselectObject: () => void;
  onGoToObject: () => void;
}) {
  const { canPin, isPinned, togglePinned } = usePinObject(
    hubChannel,
    scene,
    activeObject,
  );
  const { canRemoveObject, removeObject } = useRemoveObject(
    hubChannel,
    scene,
    activeObject,
  );
  const { canGoTo, goToSelectedObject } = useGoToSelectedObject(
    scene,
    activeObject,
  );
  const url = getObjectUrl(activeObject);

  return (
    <>
      <ObjectMenuButton disabled={!canPin} onClick={togglePinned}>
        <PinIcon />
        <span>
          {isPinned
            ? m['object-menu.unpin-object-button']()
            : m['object-menu.pin-object-button']()}
        </span>
      </ObjectMenuButton>
      {url && (
        <ObjectMenuButton
          as="a"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <LinkIcon />
          <span>{m['object-menu.object-link-button']()}</span>
        </ObjectMenuButton>
      )}
      <ObjectMenuButton
        disabled={!canGoTo}
        onClick={() => {
          goToSelectedObject();
          deselectObject();
          onGoToObject();
        }}
      >
        <GoToIcon />
        <span>{m['object-menu.view-object-button']()}</span>
      </ObjectMenuButton>
      <ObjectMenuButton
        disabled={!canRemoveObject}
        onClick={() => {
          removeObject();
          deselectObject();
        }}
      >
        <DeleteIcon />
        <span>{m['object-menu.delete-object-button']()}</span>
      </ObjectMenuButton>
    </>
  );
}

export function ObjectMenuContainer({
  hubChannel,
  scene,
  onOpenProfile,
  onGoToObject,
}: {
  hubChannel: HubChannel;
  scene: Scene;
  onOpenProfile: () => void;
  onGoToObject: () => void;
}) {
  const {
    objects,
    activeObject,
    deselectObject,
    selectNextObject,
    selectPrevObject,
    toggleLights,
    lightsEnabled,
  } = useObjectList();
  if (!activeObject) {
    console.error(
      'Could not spawn ObjectMenuContainer — Active Object not found!',
    );
    return <></>;
  }
  if (!deselectObject) {
    console.error(
      'Could not spawn ObjectMenuContainer — deselectObject function not found!',
    );
    return <></>;
  }

  if (!selectNextObject) {
    console.error(
      'Could not spawn ObjectMenuContainer — selectNextObject function not found!',
    );
    return <></>;
  }
  if (!selectPrevObject) {
    console.error(
      'Could not spawn ObjectMenuContainer — selectPrevObject function not found!',
    );
    return <></>;
  }

  let menuItems;
  let isAvatar = false;
  if (isMe(activeObject)) {
    isAvatar = true;
    menuItems = <MyMenuItems onOpenProfile={onOpenProfile} />;
  } else if (isPlayer(activeObject)) {
    isAvatar = true;
    menuItems = (
      <PlayerMenuItems
        hubChannel={hubChannel}
        activeObject={activeObject}
        deselectObject={deselectObject}
      />
    );
  } else {
    <ObjectMenuItems
      hubChannel={hubChannel}
      scene={scene}
      activeObject={activeObject}
      deselectObject={deselectObject}
      onGoToObject={onGoToObject}
    />;
  }

  return (
    <ObjectMenu
      title={m['object-menu.title']()}
      currentObjectIndex={objects.indexOf(activeObject)}
      objectCount={objects.length}
      onClose={deselectObject}
      onBack={deselectObject}
      onNextObject={selectNextObject}
      onPrevObject={selectPrevObject}
      onToggleLights={toggleLights}
      lightsEnabled={lightsEnabled}
      isAvatar={isAvatar}
    ></ObjectMenu>
  );
}
