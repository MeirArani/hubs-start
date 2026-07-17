import { emitter } from '#/core/emitter';
import type HubChannel from '#/core/hub-channel';
import { authorizeOrSanitizeMessage } from '#/utils/permission';
import transportForChannel from './transport-for-channel';
import type {
  TransportData,
  TransportDataPayload,
  TransportDataPayloadTable,
  TransportDataType,
} from './transport-for-channel';
// import * as naf from 'networked-aframe';

type ConnectionListener = (key: string) => void;
type ReceivedListener = (
  fromClientId: string | null,
  dataType: TransportDataType,
  data: TransportData,
  source: string | undefined,
) => void;
type TransportListener = (channel: unknown, reliable?: boolean) => void;
type s = TransportDataPayloadTable['u'] | TransportDataPayloadTable['r'];
export type TransportDataPayloadWithData = Extract<
  TransportDataPayload,
  { data: any }
>;
type StoreSingleMessageParams =
  | {
      message: TransportDataPayloadTable['um'];
      index: number;
    }
  | {
      message: TransportDataPayloadTable['u'] | TransportDataPayloadTable['r'];
      index?: undefined;
    };

export default class PhoenixAdapter {
  refs = new Map<string, number>();
  // TODO: Frozen messages can be handled outside this class.
  frozenUpdates = new Map<string, TransportDataPayloadWithData>();
  _blockedClients = new Map<string, unknown>();

  nafConnectSuccess: ConnectionListener | null = null;
  nafConnectFailed: ConnectionListener | null = null;
  nafOccupantJoined: ConnectionListener | null = null;
  nafOccupantLeave: ConnectionListener | null = null;
  nafMessageReceived: ReceivedListener | null = null;
  hubChannel: HubChannel | null = null;
  session_id: string = '';
  reliableTransport: ReturnType<typeof transportForChannel> | null = null;
  unreliableTransport: ReturnType<typeof transportForChannel> | null = null;
  events = emitter();

  session?: {
    options: {
      verbose: boolean;
    };
  };
  frozen = false;

  constructor() {}
  setServerUrl() {}
  setApp() {}
  setRoom() {}
  setWebRtcOptions() {}

  setServerConnectListeners(
    nafConnectSuccess: ConnectionListener,
    nafConnectFailed: ConnectionListener,
  ) {
    this.nafConnectSuccess = nafConnectSuccess;
    this.nafConnectFailed = nafConnectFailed;
  }
  setRoomOccupantListener() {}
  setDataChannelListeners(
    nafOccupantJoined: ConnectionListener,
    nafOccupantLeave: ConnectionListener,
    nafMessageReceived: ReceivedListener,
  ) {
    this.nafOccupantJoined = nafOccupantJoined;
    this.nafOccupantLeave = nafOccupantLeave;
    this.nafMessageReceived = nafMessageReceived;
  }
  async connect() {
    if (!this.hubChannel?.channel)
      return console.error(
        'Phoenix Adapter could not connect — no hubChannel found!',
      );
    this.refs.set(
      'naf',
      this.hubChannel.channel.on('naf', this.handleIncomingNAF),
    );
    // Assume the networking system parses the raw nafr message and writes the parsed data back into
    // the event object for consumption here. That way, we avoid parsing the json twice.
    this.refs.set(
      'nafr',
      this.hubChannel.channel.on('nafr', ({ parsed }) => {
        this.handleIncomingNAF(parsed);
      }),
    );

    if (this.nafConnectSuccess) this.nafConnectSuccess(this.session_id);
    this.reliableTransport = transportForChannel(this.hubChannel.channel, true);
    this.unreliableTransport = transportForChannel(
      this.hubChannel.channel,
      false,
    );

    if (this.nafOccupantJoined)
      this.hubChannel.presence
        ?.list((key) => key)
        .forEach(this.nafOccupantJoined);
    this.refs.set(
      'hub:join',
      this.events.on(
        `hub:join`,
        ({ key }: { key: string }) =>
          this.nafOccupantJoined && this.nafOccupantJoined(key),
      ),
    );

    this.refs.set(
      'hub:leave',
      this.events.on(
        `hub:leave`,
        ({ key }: { key: string }) =>
          this.nafOccupantLeave && this.nafOccupantLeave(key),
      ),
    );
  }
  shouldStartConnectionTo() {}
  startStreamConnection() {}
  closeStreamConnection() {}
  getConnectStatus() {}

  getMediaStream() {
    return Promise.reject('getMediaStream not implemented in phoenix-adapter');
  }

  getServerTime() {
    return getServerTime();
  }

  sendData<K extends keyof TransportDataPayloadTable>(
    clientId: string,
    payload: { dataType: K; data: TransportDataPayloadTable[K] },
  ) {
    if (this.unreliableTransport) {
      this.unreliableTransport(clientId);
      this.unreliableTransport(clientId, payload);
    }
  }
  sendDataGuaranteed<K extends keyof TransportDataPayloadTable>(
    clientId: string,
    payload: { dataType: K; data: TransportDataPayloadTable[K] },
  ) {
    if (this.reliableTransport) this.reliableTransport(clientId, payload);
  }
  broadcastData<K extends keyof TransportDataPayloadTable>(payload: {
    dataType: K;
    data: TransportDataPayloadTable[K];
  }) {
    if (this.unreliableTransport) this.unreliableTransport(undefined, payload);
  }
  broadcastDataGuaranteed<K extends keyof TransportDataPayloadTable>(payload: {
    dataType: K;
    data: TransportDataPayloadTable[K];
  }) {
    if (this.reliableTransport) this.reliableTransport(undefined, payload);
  }

  disconnect() {
    if (this.hubChannel) {
      if (this.nafOccupantLeave)
        this.hubChannel.presence
          ?.list((key) => key)
          .forEach(this.nafOccupantLeave);
      this.hubChannel.channel?.off('naf', this.refs.get('naf'));
      this.hubChannel.channel?.off('nafr', this.refs.get('nafr'));
    }
    this.events.off('hub:join', this.refs.get('hub:join'));
    this.events.off('hub:leave', this.refs.get('hub:leave'));
    this.refs.delete('naf');
    this.refs.delete('nafr');
    this.refs.delete('hub:join');
    this.refs.delete('hub:leave');
  }

  toggleFreeze() {
    if (this.frozen) {
      this.unfreeze();
    } else {
      this.freeze();
    }
  }

  freeze() {
    this.frozen = true;
  }

  unfreeze() {
    this.frozen = false;
    this.flushPendingUpdates();
  }

  flushPendingUpdates() {
    for (const [networkId, message] of this.frozenUpdates) {
      const data = this.getPendingData(networkId, message);
      if (!data) continue;

      // Override the data type on "um" messages types, since we extract entity updates from "um" messages into
      // individual frozenUpdates in storeSingleMessage.
      const dataType = message.dataType === 'um' ? 'u' : message.dataType;

      if (this.nafMessageReceived)
        this.nafMessageReceived(null, dataType, data, message.source);
    }
    this.frozenUpdates.clear();
  }

  getPendingData(networkId: string, message?: TransportDataPayload) {
    if (!message) return null;
    if (message.dataType === 'none' || message.dataType === 'nn') return null;

    const data =
      message.dataType === 'um'
        ? this.dataForUpdateMultiMessage(networkId, message)
        : message.data;

    // Ignore messages from users that we may have blocked while frozen.
    if (data?.owner && this._blockedClients.has(data.owner)) return null;

    return data;
  }

  // Used externally
  getPendingDataForNetworkId(networkId: string) {
    return this.getPendingData(networkId, this.frozenUpdates.get(networkId));
  }

  handleIncomingNAF = (data: TransportDataPayload) => {
    const message = authorizeOrSanitizeMessage(data);
    const source = 'phx-reliable';
    if (!message?.dataType) return;

    message.source = source;

    if (
      this.frozen &&
      (message.dataType === 'um' || message.dataType === 'u')
    ) {
      this.storeMessage(message);
      return;
    }
    if (message.dataType === 'r' && this.nafMessageReceived) {
      this.nafMessageReceived(
        message.from_session_id || null,
        message.dataType,
        message.data,
        message.source,
      );
      return;
    }
  };

  storeMessage(message: TransportDataPayloadWithData) {
    if (message.dataType === 'um') {
      // UpdateMulti
      for (let i = 0, l = message.data.d.length; i < l; i++) {
        this.storeSingleMessage({ message, index: i });
      }
    } else {
      this.storeSingleMessage({ message });
    }
  }

  storeSingleMessage({ message, index }: StoreSingleMessageParams) {
    const data =
      typeof index !== 'undefined' ? message.data.d[index] : message.data;
    if (!data)
      return console.error(
        `Could not storage message — data at at index ${index} was not found on ${message}`,
      );

    const dataType = message.dataType;

    const networkId = data.networkId;

    if (!this.frozenUpdates.has(networkId)) {
      this.frozenUpdates.set(networkId, message);
      return;
    }
    const storedMessage = this.frozenUpdates.get(networkId)!;
    const storedData =
      storedMessage.dataType === 'um'
        ? this.dataForUpdateMultiMessage(networkId, storedMessage)
        : storedMessage.data;

    // Avoid updating components if the entity data received did not come from the current owner.
    if (!storedData)
      return console.error('Could not store message — stored data not found!');

    const isOutdatedMessage = data.lastOwnerTime < storedData?.lastOwnerTime;
    const isContemporaneousMessage =
      data.lastOwnerTime === storedData.lastOwnerTime;
    if (
      isOutdatedMessage ||
      (isContemporaneousMessage && storedData.owner > data.owner)
    )
      return;

    if (dataType === 'r') {
      const createdWhileFrozen = storedData && storedData.isFirstSync;
      if (createdWhileFrozen) {
        // If the entity was created and deleted while frozen, don't bother conveying anything to the consumer.
        this.frozenUpdates.delete(networkId);
        return;
      }
      // Delete messages override any other messages for this entity
      this.frozenUpdates.set(networkId, message);
      return;
    }
    // merge in component updates
    if (storedData?.components && data.components) {
      Object.assign(storedData.components, data.components);
    }
  }
  dataForUpdateMultiMessage(
    networkId: String,
    message: TransportDataPayloadTable['um'],
  ) {
    // "d" is an array of entity datas, where each item in the array represents a unique entity and contains
    // metadata for the entity, and an array of components that have been updated on the entity.
    // This method finds the data corresponding to the given networkId.
    for (let i = 0, l = message.data.d.length; i < l; i++) {
      const data = message.data.d[i];
      if (!data) continue;
      if (data.networkId === networkId) {
        return data;
      }
    }

    return null;
  }

  block(clientId: string) {
    this._blockedClients.set(clientId, true);
  }

  unblock(clientId: string) {
    this._blockedClients.delete(clientId);
  }
}

// TODO: Use the websocket connection, not HEAD requests
const getTimeOffsetToServer = async () => {
  const precision = 1000;
  const clientSentTime = Date.now();
  const serverReceivedTime =
    new Date(
      (
        await fetch(document.location.href, {
          method: 'HEAD',
          cache: 'no-cache',
        })
      ).headers.get('Date') || Date.now().toString(),
    ).getTime() +
    precision / 2;
  const clientReceivedTime = Date.now();
  const serverTime =
    serverReceivedTime + (clientReceivedTime - clientSentTime) / 2;
  const offset = serverTime - clientReceivedTime;
  return offset;
};

const getAverageTimeOffset = (() => {
  let average = 0;
  const numOffsetsToGather = 10;
  const offsets: number[] = [];
  let n = 0;

  const update = async () => {
    offsets[n % numOffsetsToGather] = await getTimeOffsetToServer();
    n = n + 1;
    average =
      offsets.reduce((acc, offset) => (acc += offset), 0) / offsets.length;
    if (offsets.length == numOffsetsToGather) {
      setTimeout(update, 5 * 60 * 1000);
    } else {
      update();
    }
  };

  update();

  return () => {
    return average;
  };
})();

export function getServerTime() {
  return Date.now() + getAverageTimeOffset();
}

// REIMP
// naf.adapters.register('phoenix', PhoenixAdapter);
