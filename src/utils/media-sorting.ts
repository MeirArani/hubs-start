import {
  GLTFModel,
  MediaImage,
  MediaInfo,
  MediaPDF,
  MediaVideo,
} from '#/components/bitecs/component-defs';
import type { Entity } from 'aframe';
import { hasComponent } from 'bitecs';

export enum MediaSortOrder {
  video = 0,
  audio = 1,
  image = 2,
  pdf = 3,
  model = 4,
  unidentified = 5,
}

function mediaSortOrder(eid: number): MediaSortOrder {
  if (hasComponent(window.APP.world, eid, MediaVideo)) {
    if (hasComponent(window.APP.world, eid, MediaInfo)) {
      const contentTypeSid = MediaInfo.contentType[eid];
      const contentType = window.APP.getString(contentTypeSid);
      if (contentType?.startsWith('audio/')) {
        return MediaSortOrder.audio;
      }
    }
    return MediaSortOrder.video;
  }
  if (hasComponent(window.APP.world, eid, MediaImage))
    return MediaSortOrder.image;
  if (hasComponent(window.APP.world, eid, MediaPDF)) return MediaSortOrder.pdf;
  if (hasComponent(window.APP.world, eid, GLTFModel))
    return MediaSortOrder.model;
  return MediaSortOrder.unidentified;
}

function mediaSortOrderAframe(el: Entity): MediaSortOrder {
  if (
    el.components['media-video'] &&
    el.components['media-video'].data.contentType.startsWith('audio/')
  ) {
    return MediaSortOrder.audio;
  }
  if (el.components['media-video']) return MediaSortOrder.video;
  if (el.components['media-image']) return MediaSortOrder.image;
  if (el.components['media-pdf']) return MediaSortOrder.pdf;
  if (el.components['gltf-model-plus']) return MediaSortOrder.model;
  return MediaSortOrder.unidentified;
}

export function mediaSort(eid1: number, eid2: number) {
  return mediaSortOrder(eid1) - mediaSortOrder(eid2);
}

export function mediaSortAframe(el1: Entity, el2: Entity) {
  return mediaSortOrderAframe(el1) - mediaSortOrderAframe(el2);
}

// HACK: don't blame me—reverse mapping enums are screwy https://github.com/microsoft/TypeScript/issues/38806
export function getMediaType(eid: number): keyof typeof MediaSortOrder {
  const order = mediaSortOrder(eid);
  return MediaSortOrder[order] as keyof typeof MediaSortOrder;
}

export function getMediaTypeAframe(el: Entity): keyof typeof MediaSortOrder {
  const order = mediaSortOrderAframe(el);
  return MediaSortOrder[order] as keyof typeof MediaSortOrder;
}
