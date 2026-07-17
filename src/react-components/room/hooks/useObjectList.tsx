import {
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
  type ReactElement,
} from 'react';
import { anyEntityWith, shouldUseNewLoader } from '../../../utils/bit-utils.js';
import { addComponent, query, hasComponent, removeComponent } from 'bitecs';
import { Inspected, MediaInfo } from '#/components/bitecs/component-defs.js';
import type { Entity, Scene } from 'aframe';
import {
  getMediaType,
  getMediaTypeAframe,
  mediaSort,
  mediaSortAframe,
} from '#/utils/media-sorting.js';
import type { HubObject } from '../object-hooks.js';

function getUrl(eid: number) {
  return hasComponent(window.APP.world, eid, MediaInfo)
    ? window.APP.getString(MediaInfo.accessibleUrl[eid])
    : '';
}

function getUrlAframe(el: Entity) {
  // Having a listed-media component does not guarantee the existence of a media-loader component,
  // so don't crash if there isn't one.
  return (
    (el.components['media-loader'] && el.components['media-loader'].data.src) ||
    ''
  );
}

function getDisplayString(url: string) {
  const split = url.split('/');
  const resourceName = split[split.length - 1].split('?')[0];
  let httpIndex = -1;
  for (let i = 0; i < split.length; i++) {
    if (split[i].indexOf('http') !== -1) {
      httpIndex = i;
    }
  }

  let host = '';
  let lessHost = '';
  if (httpIndex !== -1 && split.length > httpIndex + 3) {
    host = split[httpIndex + 2];
    const hostSplit = host.split('.');
    if (hostSplit.length > 1) {
      lessHost = `${hostSplit[hostSplit.length - 2]}.${hostSplit[hostSplit.length - 1]}`;
    }
  }

  const firstPart =
    url.indexOf('sketchfab.com') !== -1
      ? 'Sketchfab'
      : url.indexOf('youtube.com') !== -1
        ? 'YouTube'
        : lessHost;

  return `${firstPart} ... ${resourceName.substr(0, 4)}`;
}

const ObjectListContext = createContext<{
  objects: HubObject[];
  activeObject: HubObject | null;
  focusedObject: HubObject | null;
  selectedObject: HubObject | null;
  focusObject?: (object: HubObject) => void;
  unfocusObject?: (object: HubObject | null) => void;
  selectObject?: (object: HubObject) => void;
  deselectObject?: () => void;
  selectPrevObject?: () => void;
  selectNextObject?: () => void;
  toggleLights?: () => void;
  lightsEnabled?: boolean;
  inspectObject?: (object: HubObject) => void;
  uninspectObject?: (object: HubObject | null) => void;
}>({
  objects: [],
  focusedObject: null,
  selectedObject: null,
  activeObject: null,
});

function handleInspect(
  scene: Scene,
  object: HubObject,
  callback: (object: HubObject) => void,
) {
  const cameraSystem = scene.systems['hubs-systems'].cameraSystem;

  callback(object);

  if (shouldUseNewLoader()) {
    const inspected = anyEntityWith(window.APP.world, Inspected);
    if (inspected != object.eid) {
      if (inspected) {
        removeComponent(window.APP.world, inspected, Inspected);
      }
      addComponent(window.APP.world, object.eid, Inspected);
    }
  } else {
    if (object.el?.object3D !== cameraSystem.inspectable) {
      if (cameraSystem.inspectable) {
        cameraSystem.uninspect(false);
      }

      cameraSystem.inspect(object.el?.object3D, 1.5, false);
    }
  }
}

function handleDeselect(
  scene: Scene,
  object: HubObject | null,
  callback: (object: HubObject | null) => void,
) {
  const cameraSystem = scene.systems['hubs-systems'].cameraSystem;

  callback(null);

  if (shouldUseNewLoader()) {
    const inspected = anyEntityWith(window.APP.world, Inspected);
    if (inspected) {
      removeComponent(window.APP.world, inspected, Inspected);
    }
    if (object) {
      addComponent(window.APP.world, object.eid, Inspected);
    }
  } else {
    cameraSystem.uninspect(false);

    if (object) {
      cameraSystem.inspect(object.el?.object3D, 1.5, false);
    }
  }
}

export function ObjectListProvider({
  scene,
  children,
}: {
  scene: Scene;
  children?: ReactElement;
}) {
  const [objects, setObjects] = useState<HubObject[]>([]);
  const [focusedObject, setFocusedObject] = useState<HubObject | null>(null); // The object currently shown in the viewport
  const [selectedObject, setSelectedObject] = useState<HubObject | null>(null); // The object currently selected in the object list
  const cameraSystem = scene.systems['hubs-systems'].cameraSystem;
  const [lightsEnabled, setLightsEnabled] = useState(
    cameraSystem.lightsEnabled,
  );

  useEffect(() => {
    function updateMediaEntities() {
      if (shouldUseNewLoader()) {
        const objects: HubObject[] = [];

        query(window.APP.world, [MediaInfo])
          .slice()
          .sort(mediaSort)
          .forEach((eid) => {
            const obj = window.APP.world.eid2obj.get(eid);
            const url = getUrl(eid);
            if (obj && url) {
              objects.push({
                id: obj.id,
                name: getDisplayString(url),
                type: getMediaType(eid),
                eid: eid,
              });
            }
          });
        setObjects(objects);

        const inspected = anyEntityWith(window.APP.world, Inspected);
        if (!inspected || !objects.find((o) => o.eid === inspected)) {
          setSelectedObject(null);
        }
      } else {
        const objects: HubObject[] = [];
        scene.systems['listed-media'].els
          .sort(mediaSortAframe)
          .map((el: Entity) => ({
            id: el.object3D.id,
            name: getDisplayString(getUrlAframe(el)),
            type: getMediaTypeAframe(el),
            eid: el.eid,
            el,
          }));
        setObjects(objects);

        const cameraSystem = scene.systems['hubs-systems'].cameraSystem;
        const inspectedEl =
          cameraSystem.inspectable && cameraSystem.inspectable.el;

        if (!inspectedEl || !objects.find((o) => o.el === inspectedEl)) {
          setSelectedObject(null);
        }
      }
    }

    let timeout: number;

    function onListedMediaChanged() {
      // HACK: The listed-media component exists before the media-loader component does, in cases where an entity is created from a network template because of an incoming message, so don't updateMediaEntities right away.
      // Sorry in advance for the day this comment is out of date.
      timeout = window.setTimeout(() => updateMediaEntities(), 0);
    }

    scene.addEventListener('listed_media_changed', onListedMediaChanged);

    updateMediaEntities();

    return () => {
      scene.removeEventListener('listed_media_changed', updateMediaEntities);
      window.clearTimeout(timeout);
    };
  }, [scene, setObjects, setSelectedObject]);

  useEffect(() => {
    function onInspectTargetChanged() {
      if (shouldUseNewLoader()) {
        const inspected = anyEntityWith(window.APP.world, Inspected);

        if (!inspected) {
          setSelectedObject(null);
          return;
        }

        const object = objects.find((o) => o.eid === inspected);

        if (object) {
          setSelectedObject(object);
          return;
        }

        const id = window.APP.world.eid2obj.get(inspected)?.id;
        if (!id) {
          setSelectedObject(null);
          return;
        }

        const nameUrl = getUrl(inspected);

        if (!nameUrl) return;

        setSelectedObject({
          id: id,
          name: getDisplayString(nameUrl),
          type: getMediaType(inspected),
          eid: inspected,
        });

        return;
      }

      const cameraSystem = scene.systems['hubs-systems'].cameraSystem;
      const inspectedEl =
        cameraSystem.inspectable && cameraSystem.inspectable.el;

      if (!inspectedEl) setSelectedObject(null);

      const object = objects.find((o) => o.el === inspectedEl);

      if (object) {
        setSelectedObject(object);
        return;
      }

      setSelectedObject({
        id: inspectedEl.object3D.id,
        name: getDisplayString(getUrlAframe(inspectedEl)),
        type: getMediaTypeAframe(inspectedEl),
        eid: inspectedEl.eid,
        el: inspectedEl,
      });
    }

    scene.addEventListener('inspect-target-changed', onInspectTargetChanged);

    return () => {
      scene.removeEventListener(
        'inspect-target-changed',
        onInspectTargetChanged,
      );
    };
  }, [scene, setSelectedObject, objects]);

  useEffect(() => {
    function onLightsChanged() {
      const cameraSystem = scene.systems['hubs-systems'].cameraSystem;
      setLightsEnabled(cameraSystem.lightsEnabled);
    }

    scene.addEventListener('inspect-lights-changed', onLightsChanged);

    return () => {
      scene.removeEventListener('inspect-lights-changed', onLightsChanged);
    };
  }, [scene]);

  const selectObject = useCallback(
    (object: HubObject) => handleInspect(scene, object, setSelectedObject),
    [scene, setSelectedObject],
  );

  const deselectObject = useCallback(
    () => handleDeselect(scene, focusedObject, setSelectedObject),
    [scene, setSelectedObject, focusedObject],
  );

  const focusObject = useCallback(
    (object: HubObject) => handleInspect(scene, object, setFocusedObject),
    [scene, setFocusedObject],
  );

  const unfocusObject = useCallback(
    () => handleDeselect(scene, selectedObject, setFocusedObject),
    [scene, setFocusedObject, selectedObject],
  );

  const selectNextObject = useCallback(() => {
    if (!selectedObject) return;
    const curObjIdx = objects.indexOf(selectedObject);

    if (curObjIdx !== -1) {
      const nextObjIdx = (curObjIdx + 1) % objects.length;
      selectObject(objects[nextObjIdx]);
    }
  }, [selectObject, objects, selectedObject]);

  const selectPrevObject = useCallback(() => {
    if (!selectedObject) return;
    const curObjIdx = objects.indexOf(selectedObject);

    if (curObjIdx !== -1) {
      const nextObjIdx = curObjIdx === 0 ? objects.length - 1 : curObjIdx - 1;
      selectObject(objects[nextObjIdx]);
    }
  }, [selectObject, objects, selectedObject]);

  const toggleLights = useCallback(() => {
    const cameraSystem = scene.systems['hubs-systems'].cameraSystem;
    cameraSystem.toggleLights();
  }, [scene]);

  const context = {
    objects,
    activeObject: focusedObject || selectedObject,
    focusedObject,
    selectedObject,
    focusObject,
    unfocusObject,
    selectObject,
    deselectObject,
    selectPrevObject,
    selectNextObject,
    toggleLights,
    lightsEnabled,
  };

  // Note: If we move ui-root to a functional component and use hooks,
  // we can use the useObjectList hook instead of cloneElement.

  return <ObjectListContext value={context}>{children}</ObjectListContext>;
}

export function useObjectList() {
  return useContext(ObjectListContext);
}
