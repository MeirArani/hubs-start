import { configs } from '../core/configs';
import { store } from '#/store/store';
import type { Channel, Socket } from 'phoenix';
import type { Hub, HubsChannelParams } from '#/types/hubs';
import { getRouteApi } from '@tanstack/react-router';

export function hasReticulumServer() {
  return !!configs.state.reticulumServer;
}

export function isLocalClient() {
  return (
    !!hasReticulumServer() &&
    document.location.host !== configs.state.reticulumServer
  );
}

export function hubUrl(
  hubId?: string,
  extraParams?: Record<string, string>,
  // slug?: string,
  waypoint?: string,
) {
  const routeApi = getRouteApi('/$hubId');
  hubId = hubId || routeApi.useParams().hubId;

  const url = new URL(`/${hubId}`, location.href);

  for (const key in extraParams) {
    url.searchParams.set(key, extraParams[key]);
  }

  if (waypoint) url.hash = waypoint;

  return url;
}

// REIMP
// const resolverLink = document.createElement('a');
type ReticulumMeta = {
  version: string;
  pool: string;
  phx_host: string;
};
let reticulumMeta: ReticulumMeta | null = null;
let invalidatedReticulumMetaThisSession = false;

export function getReticulumFetchUrl(
  path: string,
  absolute = false,
  host?: string,
  port?: string,
) {
  if (host || hasReticulumServer()) {
    return `https://${host || configs.state.reticulumServer}${port ? `:${port}` : ''}${path}`;
  } else if (absolute) {
    // resolverLink.href = path;
    // return resolverLink.href;
    return '';
  } else {
    return path;
  }
}

export function fetchReticulumAuthenticatedWithToken({
  token,
  url,
  method = 'GET',
  payload,
}: {
  token?: string;
  url: string;
  method?: string;
  payload?: object;
}) {
  const retUrl = getReticulumFetchUrl(url);

  const headers = new Headers({ 'content-type': 'application/json' });
  if (token) headers.append('authorization', `bearer ${token}`);
  const params: RequestInit = {
    headers: headers,
    method,
  };
  if (payload) {
    params.body = JSON.stringify(payload);
  }
  return fetch(retUrl, params).then(async (r) => {
    const result = await r.text();
    try {
      return JSON.parse(result);
    } catch {
      // Some reticulum responses, particularly DELETE requests, don't return json.
      return result;
    }
  });
}

export interface ChannelMigrationData {
  hubs_requires_oauth: boolean;
  hubs: Hub[];
  perms_token: string;
  session_id: string;
  session_token: string;
  subscriptions: {
    favorites: boolean;
    web_push: boolean;
  };
}

export function migrateToChannel(oldChannel: Channel, newChannel: Channel) {
  migrateBindings(oldChannel, newChannel);

  return new Promise<ChannelMigrationData>((resolve, reject) => {
    newChannel
      .join()
      .receive('ok', (data: ChannelMigrationData) => {
        oldChannel.leave();
        oldChannel.bindings = [];
        resolve(data);
      })
      .receive('error', (data) => {
        newChannel.leave();
        reject(data);
      });
  });
}

export function fetchReticulumAuthenticated(
  url: string,
  method: string = 'GET',
  payload: object = {},
) {
  if (!store.state.credentials.token)
    return console.error('Could not fetch reticulum auth — token not found!');
  return fetchReticulumAuthenticatedWithToken({
    token: store.state.credentials.token,
    url,
    method,
    payload,
  });
}

function migrateBindings(oldChannel: Channel, newChannel: Channel) {
  const doNotDuplicate = [
    'phx_close',
    'phx_error',
    'phx_reply',
    'presence_state',
    'presence_diff',
  ];
  const shouldDuplicate = (event: string) => {
    return !event.startsWith('chan_reply_') && !doNotDuplicate.includes(event);
  };
  for (let i = 0, l = oldChannel.bindings.length; i < l; i++) {
    const item = oldChannel.bindings[i];
    if (shouldDuplicate(item.event)) {
      newChannel.bindings.push(item);
    }
  }
  newChannel.bindingRef = oldChannel.bindingRef;
}

// Takes the given channel, and creates a new channel with the same bindings
// with the given socket, joins it, and leaves the old channel after joining.
//
// NOTE: This function relies upon phoenix channel object internals, so this
// function will need to be reviewed if/when we ever update phoenix.js
export function migrateChannelToSocket(
  oldChannel: Channel,
  socket: Socket,
  params?: HubsChannelParams,
) {
  const channel = socket.channel(oldChannel.topic, params || oldChannel.params);

  migrateBindings(oldChannel, channel);

  for (let i = 0, l = oldChannel.pushBuffer.length; i < l; i++) {
    const item = oldChannel.pushBuffer[i];
    channel.push(item.event, item.payload, item.timeout);
  }

  const oldJoinPush = oldChannel.joinPush;
  const joinPush = channel.join();

  for (let i = 0, l = oldJoinPush.recHooks.length; i < l; i++) {
    const item = oldJoinPush.recHooks[i];
    joinPush.receive(item.status, item.callback);
  }

  return new Promise<Channel>((resolve) => {
    joinPush.receive('ok', () => {
      // Clear all event handlers first so no duplicate messages come in.
      oldChannel.bindings = [];
      resolve(channel);
    });
  });
}
