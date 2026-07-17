import {
  AEntity,
  LocalAvatar,
  MediaInfo,
  MediaLoader,
  RemoteAvatar,
  Static,
} from '#/components/bitecs/component-defs';
import type { HubsWorld } from '#/core/app';
import type HubChannel from '#/core/hub-channel';
import { isAEntityPinned } from '#/systems/aframe/hold-system';
import {
  findAncestorWithComponent,
  shouldUseNewLoader,
} from '#/utils/bit-utils';
import type { Entity, Scene } from 'aframe';
import { hasComponent } from 'bitecs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Matrix4 } from 'three';
import { isPinned as getPinnedState } from '@/systems/bitecs/networking';
import { setPinned, canPin as canPinObject } from '#/utils/bit-pinning-helping';
import { debounce } from 'lodash-es';
import type { MediaSortOrder } from '#/utils/media-sorting';
import { deleteTheDeletableAncestor } from '#/systems/bitecs/delete-entity-system';
import { removeNetworkedObject } from '#/utils/removeNetworkedObject';
import {
  affixToWorldUp,
  rotateInPlaceAroundWorldUp,
} from '#/utils/three-utils';
import { getPromotionTokenForFile } from '#/utils/media-utils';

export interface HubObject {
  id: number;
  name: string;
  type: keyof typeof MediaSortOrder;
  eid: number;
  el?: Entity;
}

export function isMe(object: HubObject) {
  if (shouldUseNewLoader())
    return hasComponent(window.APP.world, object.eid, LocalAvatar);

  return false;
  // CHECK: id is always a number??
  //return object.id === 'avatar-rig';
}

export function isPlayer(object: HubObject) {
  if (shouldUseNewLoader()) {
    return hasComponent(window.APP.world, object.eid, RemoteAvatar);
  } else {
    return !!object.el?.components['networked-avatar'];
  }
}

export function getObjectUrl(object: HubObject) {
  let url;
  if (shouldUseNewLoader()) {
    const urlSid = MediaInfo.accessibleUrl[object.eid];
    url = window.APP.getString(urlSid);
  } else {
    const mediaLoader = object.el?.components['media-loader'];
    url = mediaLoader.data.mediaOptions.href || mediaLoader.data.src;
  }

  if (url && !url.startsWith('hubs://')) {
    return url;
  }

  return null;
}

function isObjectPinned(world: HubsWorld, eid: number) {
  if (hasComponent(world, eid, AEntity)) {
    return isAEntityPinned(window.APP.world, eid);
  } else {
    const mediaRootEid = findAncestorWithComponent(
      window.APP.world,
      MediaLoader,
      eid,
    );
    return mediaRootEid ? getPinnedState(mediaRootEid) : false;
  }
}

export function usePinObject(
  hubChannel: HubChannel,
  scene: Scene,
  object: HubObject,
) {
  const [isPinned, setIsPinned] = useState(
    isObjectPinned(window.APP.world, object.eid),
  );

  const pinObject = useCallback(() => {
    if (shouldUseNewLoader()) {
      const mediaRootEid = findAncestorWithComponent(
        window.APP.world,
        MediaLoader,
        object.eid,
      );
      if (!mediaRootEid) return;
      setPinned(hubChannel, window.APP.world, mediaRootEid, true);
      return;
    }
    const el = object.el;
    if (!NAF.utils.isMine(el) && !NAF.utils.takeOwnership(el)) return;
    if (!el) return;
    window.APP.pinningHelper?.setPinned(el, true);
  }, [object, hubChannel]);

  const unpinObject = useCallback(() => {
    if (shouldUseNewLoader()) {
      const mediaRootEid = findAncestorWithComponent(
        window.APP.world,
        MediaLoader,
        object.eid,
      );
      if (!mediaRootEid)
        return console.error(
          'Could not unpin object — mediaRootEid not found!',
        );
      setPinned(hubChannel, window.APP.world, mediaRootEid, false);
    } else {
      const el = object.el;
      if (!NAF.utils.isMine(el) && !NAF.utils.takeOwnership(el)) return;
      if (!el) return;
      window.APP.pinningHelper?.setPinned(el, false);
    }
  }, [object, hubChannel]);

  const _togglePinned = useCallback(() => {
    if (isPinned) {
      unpinObject();
    } else {
      pinObject();
    }
  }, [isPinned, pinObject, unpinObject]);

  const togglePinned = useMemo(
    () => debounce(_togglePinned, 100),
    [_togglePinned],
  );
  useEffect(() => {
    return () => {
      togglePinned.cancel();
    };
  }, [togglePinned]);

  useEffect(() => {
    if (shouldUseNewLoader()) {
      const handler = setInterval(() => {
        setIsPinned(isObjectPinned(window.APP.world, object.eid));
      }, 100);
      return () => {
        clearInterval(handler);
      };
    }

    const el = object.el;

    function onPinStateChanged() {
      setIsPinned(isObjectPinned(window.APP.world, object.eid));
    }
    el?.addEventListener('pinned', onPinStateChanged);
    el?.addEventListener('unpinned', onPinStateChanged);
    setIsPinned(isObjectPinned(window.APP.world, object.eid));
    return () => {
      el?.removeEventListener('pinned', onPinStateChanged);
      el?.removeEventListener('unpinned', onPinStateChanged);
    };
  }, [object]);

  let canBePinned = false;
  if (shouldUseNewLoader()) {
    const mediaRootEid = findAncestorWithComponent(
      window.APP.world,
      MediaLoader,
      object.eid,
    );
    canBePinned =
      window.APP.hubChannel && mediaRootEid
        ? canPinObject(window.APP.hubChannel, mediaRootEid)
        : false;
  } else {
    const el = object.el;
    if (el?.components['media-loader']) {
      const { fileIsOwned, fileId } = el.components['media-loader'].data;
      canBePinned = fileIsOwned || (fileId && getPromotionTokenForFile(fileId));
    }
  }

  let targetEid;
  if (shouldUseNewLoader()) {
    targetEid = findAncestorWithComponent(
      window.APP.world,
      MediaLoader,
      object.eid,
    );
  } else {
    targetEid = object.el?.eid;
  }
  const isStatic = targetEid
    ? hasComponent(window.APP.world, targetEid, Static)
    : false;

  const canPin = !!(
    scene.is('entered') &&
    !isPlayer(object) &&
    !isStatic &&
    hubChannel.can('pin_objects') &&
    canBePinned
  );

  return { canPin, isPinned, togglePinned, pinObject, unpinObject };
}

export function useGoToSelectedObject(scene: Scene, object: HubObject) {
  const goToSelectedObject = useCallback(() => {
    const viewingCamera = document.getElementById<Entity>('viewing-camera');
    if (!viewingCamera)
      return console.error(
        'could not useGoToSelectedObject — viewingCamera not found',
        object,
      );
    const targetMatrix = new Matrix4();
    const translation = new Matrix4();
    viewingCamera?.object3DMap.camera.updateMatrices();
    targetMatrix.copy(viewingCamera.object3DMap.camera.matrixWorld);
    affixToWorldUp(targetMatrix, targetMatrix);
    translation.makeTranslation(0, -1.6, 0.15);
    targetMatrix.multiply(translation);
    rotateInPlaceAroundWorldUp(targetMatrix, Math.PI, targetMatrix);

    scene.systems['hubs-systems'].characterController.enqueueWaypointTravelTo(
      targetMatrix,
      true,
      {
        willDisableMotion: false,
        willDisableTeleporting: false,
        snapToNavMesh: false,
        willMaintainInitialOrientation: false,
      },
    );
  }, [scene]);

  const uiRoot = useMemo(() => document.getElementById('ui-root'), []);
  const isSpectating =
    (uiRoot?.firstChild as Element).classList.contains('isGhost') || false;
  const canGoTo = !isSpectating && !isPlayer(object);

  return { canGoTo, goToSelectedObject };
}

export function useHideAvatar(hubChannel: HubChannel, avatarObj: HubObject) {
  const hideAvatar = useCallback(() => {
    // TODO This should be updated when we migrate avatars to bitECS
    const avatarEl: Entity = shouldUseNewLoader()
      ? window.APP.world.eid2obj.get(avatarObj.eid)?.el
      : avatarObj.el;

    if (avatarEl && avatarEl.components.networked) {
      const clientId = avatarEl.components.networked.data.owner;

      if (clientId && clientId !== NAF.clientId) {
        hubChannel.hide(clientId);
      }
    }
  }, [hubChannel, avatarObj]);

  return hideAvatar;
}

export function useRemoveObject(
  hubChannel: HubChannel,
  scene: Scene,
  object: HubObject,
) {
  const removeObject = useCallback(() => {
    if (shouldUseNewLoader()) {
      deleteTheDeletableAncestor(window.APP.world, object.eid);
      return;
    }

    if (object.el) removeNetworkedObject(scene, object.el);
  }, [scene, object]);

  const eid = object.eid;

  let canBePinned = false;
  if (shouldUseNewLoader()) {
    const mediaRootEid = findAncestorWithComponent(
      window.APP.world,
      MediaLoader,
      object.eid,
    );
    canBePinned =
      window.APP.hubChannel && mediaRootEid
        ? canPinObject(window.APP.hubChannel, mediaRootEid)
        : false;
  } else {
    const el = object.el;
    if (el?.components['media-loader']) {
      const { fileIsOwned, fileId } = el.components['media-loader'].data;
      canBePinned = fileIsOwned || (fileId && getPromotionTokenForFile(fileId));
    }
  }

  const canRemoveObject = !!(
    scene.is('entered') &&
    !isPlayer(object) &&
    !isObjectPinned(window.APP.world, eid) &&
    !hasComponent(window.APP.world, eid, Static) &&
    hubChannel.can('spawn_and_move_media') &&
    canBePinned
  );

  return { removeObject, canRemoveObject };
}
