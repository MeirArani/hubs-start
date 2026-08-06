import type { Entity, Scene } from 'aframe';
import type HubChannel from './hub-channel';
import type SceneEntryManager from './scene-entry-manager';
import type { Attribution } from '#/types/hubs';
import type { Permission } from '#/utils/permission';
import { shouldUseNewLoader } from '#/utils/bit-utils';
import { App } from './app';
import { Cache } from 'three';
import loadingEnvironment from '#/assets/models/LoadingEnvironment.glb?url';
import { getRouteApi } from '@tanstack/react-router';
import { proxiedUrlFor } from '#/utils/media-urls';
import { swapActiveScene } from '#/systems/bitecs/scene-loading';

export interface HubScene {
  account_id?: string;
  allow_promotion: boolean;
  allow_remixing: boolean;
  attribution?: string;
  attributions?: {
    content: Attribution[];
    creator: string;
  };
  description?: string;
  model_url?: string;
  name: string;
  parent_scene_id?: string;
  project_id?: string;
  scene_id?: string;
  scene_project_url?: string;
  screenshot_url?: string;
  type?: string;
  url?: string;
}

export type Hub = {
  allow_promotion: boolean;
  description: string | null;
  entry_code: 0;
  entry_mode: 'invite' | 'allow';
  host: string;
  hub_id: string;
  lobby_count: number;
  member_count: number;
  member_permissions: Record<Permission, boolean>;
  name?: string;
  port: number;
  room_size: number;
  slug?: string;
  topics: {
    assets: { asset_type: string; src: string }[];
    janus_room_id: number;
    topic_id: string;
  }[];
  turn: TurnInfo;
  scene?: HubScene;
  embed_token?: string;
  user_data: UserData | null;
};

export interface UserData {
  hubs_use_bitecs_based_client: boolean;
}

type TurnInfoEnabled = {
  enabled: true;
  username: string;
  credential: string;
  transports: { port: number }[];
};

type TurnInfoDisabled = {
  enabled: false;
};

export type TurnInfo = TurnInfoEnabled | TurnInfoDisabled;

interface HubJoinData {
  hub_requires_oauth: boolean;
  hubs: Hub[];
  perms_token: string;
  session_id: string;
  session_token: string;
  subscriptions: { favorite: boolean; web_push: null };
}
function handleHubChannelJoined({
  entryManager,
  hubChannel,
  messageDispatch,
  data,
}: {
  entryManager: SceneEntryManager;
  hubChannel: HubChannel;
  messageDispatch: unknown;
  data: HubJoinData;
}) {
  const scene = document.querySelector<Scene>('a-scene');
  if (!scene) throw new Error('Could not handle hub join — scene not found!');

  // TODO: Networking

  const hub = data.hubs[0];

  console.log(`Dialogue host: ${hub.host}:${hub.port}`);

  // Tons of Event hook-ins
  // Startup networking features and wait for connection

  window.APP.hub = hub;
  scene.emit('hub_updated', { hub });

  const loadEnvironmentAndConnect = () => {
    console.log('Loading environment and connecting to dialogue servers');
    updateEnvironmentForHub(hub, entryManager);
  };

  loadEnvironmentAndConnect();
}

export async function updateEnvironmentForHub(
  hub: Hub,
  entryManager: SceneEntryManager,
) {
  console.log('Updating Environment for Hub');
  const sceneUrl = await getSceneUrlForHub(hub);

  if (shouldUseNewLoader()) {
    console.log('Using new loading path for scenes.');
    swapActiveScene(window.APP.world, sceneUrl);
    return;
  }

  const sceneErrorHandler = () => {
    // Error stuffs
    entryManager.exitScene();
  };

  const environmentScene = document.querySelector<Scene>('#environment-scene');
  const sceneEl = document.querySelector<Scene>('a-scene');
  if (!sceneEl)
    throw new Error('Could not update environment — Scene not found!');
  // const envSystem = sceneEl.systems[]

  console.log(`Scene URL: ${sceneUrl}`);
  const loadStart = performance.now();

  let environmentEl: Entity | null = null;

  if (environmentScene?.childNodes.length === 0) {
    const environmentEl = document.createElement('a-entity');

    environmentEl.addEventListener(
      'model-loaded',
      () => {
        environmentEl.removeEventListener('model-error', sceneErrorHandler);

        console.log(
          `Scene file initial load took ${Math.round(performance.now() - loadStart)}ms`,
        );

        // Show the canvas once the model has loaded
        document
          .querySelector<Entity>('.a-canvas')
          ?.classList.remove('a-hidden');

        sceneEl.addState('visible');

        //envSystem.updateEnvironment(environmentEl);

        // TODO: check if the environment was made with spoke to determine if a shape should be added
        //traverseMeshAndAddShapes(environmentEl);
      },
      { once: true },
    );

    environmentEl.addEventListener('model-error', sceneErrorHandler, {
      once: true,
    });

    environmentEl.setAttribute('gltf-model-plus', {
      src: sceneUrl,
      useCache: false,
      inflate: true,
    });

    environmentScene.appendChild(environmentEl);
    return;
  }

  // Change environment
  environmentEl = (environmentScene?.childNodes[0] as Entity) || null;
  if (!environmentEl)
    return console.error(
      'Could not add event listeners for environmentEl — environmentEl not found!',
    );

  // Clear the js image cache and load the loading environment before switching to the new one.
  Cache.clear();
  // const waypointSystem = sceneEl.systems["hubs-systems"].waypointSystem;
  // waypointSystem.releaseAnyOccupiedWaypoints();

  environmentEl.addEventListener(
    'model-loaded',
    () => {
      environmentEl.addEventListener(
        'model-loaded',
        () => {
          environmentEl.removeEventListener('model-error', sceneErrorHandler);

          // envSystem.updateEnvironment(environmentEl);

          console.log(
            `Scene file update load took ${Math.round(performance.now() - loadStart)}ms`,
          );

          // traverseMeshesAndAddShapes(environmentEl);

          // We've already entered, so move to new spawn point once new environment is loaded
          // if (sceneEl.is("entered")) {
          //   waypointSystem.moveToSpawnPoint();
          // }

          // const fader = document.getElementById<Entity>("viewing-camera")?.components["fader"];

          // Add a slight delay before de-in to reduce hitching.
          // if (fader) setTimeout(() => fader.fadeIn(), 2000);
        },
        { once: true },
      );

      // If we had a loop-animation component on the environment, we need to remove it
      // before loading a new model with gltf-model-plus, or else the component won't
      // find and play animations in the new scene.
      environmentEl.removeAttribute('loop-animation');

      sceneEl.emit('leaving_loading_environment');
      if (environmentEl.components['gltf-model-plus'].data.src === sceneUrl) {
        console.warn('Updating environment to the same url.');
        environmentEl.setAttribute('gltf-model-plus', { src: '' });
      }
      environmentEl.setAttribute('gltf-model-plus', { src: sceneUrl });
    },
    { once: true },
  );

  if (!sceneEl.is('entered')) {
    environmentEl.addEventListener('model-error', sceneErrorHandler, {
      once: true,
    });
  }

  if (
    environmentEl.components['gltf-model-plus'].data.src === loadingEnvironment
  ) {
    console.warn(
      'Transitioning to loading environment but was already in loading environment.',
    );
    environmentEl.setAttribute('gltf-model-plus', { src: '' });
  }
  environmentEl.setAttribute('gltf-model-plus', { src: loadingEnvironment });
}

export async function getSceneUrlForHub(hub: Hub) {
  const { debugLocalScene } = getRouteApi('/$hubId').useSearch();
  const defaultSpaceTopic = hub.topics[0];
  const glbAsset = defaultSpaceTopic.assets.find((a) => a.asset_type === 'glb');
  const bundleAsset = defaultSpaceTopic.assets.find(
    (a) => a.asset_type === 'gltf_bundle',
  );
  const sceneUrl =
    hub.scene === null
      ? loadingEnvironment
      : glbAsset
        ? glbAsset.src
        : bundleAsset
          ? bundleAsset.src
          : loadingEnvironment;

  if (debugLocalScene && sceneUrl.startsWith('blob:')) {
    return document.querySelector<Scene>('a-scene')?.is('entered')
      ? sceneUrl
      : loadingEnvironment;
  }

  return proxiedUrlFor(sceneUrl);
}
