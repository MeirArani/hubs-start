import { SceneRoot } from '#/components/bitecs/component-defs';
import type { HubsWorld } from '#/core/app';
import { anyEntityWith } from '#/utils/bit-utils';
import type { Entity } from 'aframe';
import { removeEntity } from 'bitecs';

// REIMP
export function swapActiveScene(world: HubsWorld, src: string) {
  const currentScene = anyEntityWith(window.APP.world, SceneRoot);
  if (currentScene) {
    removeEntity(window.APP.world, currentScene);
  }

  //     const newScene = renderAsEntity(world, ScenePrefab(src));
  //   const newSceneObj = world.eid2obj.get(newScene);
  //   if (!newSceneObj) return;
  //   document.querySelector<Entity>("#environment-scene")?.object3D?.add(newSceneObj);
}
