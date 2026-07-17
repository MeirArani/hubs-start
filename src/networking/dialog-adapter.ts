import * as mediasoupClient from 'mediasoup-client';
import protooClient, { Peer } from 'protoo-client';
import { debug as newDebug } from 'debug';
import EventEmitter from 'eventemitter3';
import { MediaDevices } from '@/utils/media-devices';
import type { TurnInfo } from '#/core/hub';
import type { Scene } from 'aframe';
import type {
  ConnectionState,
  MediaKind,
  Producer,
  RtpParameters,
  Transport,
} from 'mediasoup-client/types';

type RTCEventLevel = 'log' | 'error' | 'info' | 'warn';
type RTCTag = 'RTC' | 'Adapter' | 'Signaling';

// Used for VP9 webcam video.
//const VIDEO_KSVC_ENCODINGS = [{ scalabilityMode: "S3T3_KEY" }];

// Used for VP9 desktop sharing.
//const VIDEO_SVC_ENCODINGS = [{ scalabilityMode: "S3T3", dtx: true }];

// TODO
// - look into requestConsumerKeyframe
// - look into applyNetworkThrottle
// SFU todo
// - remove active speaker stuff
// - remove score stuff

// Based upon mediasoup-demo RoomClient

const debug = newDebug('naf-dialog-adapter:debug');
//const warn = newDebug("naf-dialog-adapter:warn");
const error = newDebug('naf-dialog-adapter:error');
const info = newDebug('naf-dialog-adapter:info');

const PC_PROPRIETARY_CONSTRAINTS = {
  optional: [{ googDscp: true }],
};

const WEBCAM_SIMULCAST_ENCODINGS = [
  { scaleResolutionDownBy: 4, maxBitrate: 500000 },
  { scaleResolutionDownBy: 2, maxBitrate: 1000000 },
  { scaleResolutionDownBy: 1, maxBitrate: 5000000 },
];

// Used for simulcast screen sharing.
const SCREEN_SHARING_SIMULCAST_ENCODINGS = [
  { dtx: true, maxBitrate: 1500000 },
  { dtx: true, maxBitrate: 6000000 },
];

export const DIALOG_CONNECTION_CONNECTED = 'dialog-connection-connected';
export const DIALOG_CONNECTION_ERROR_FATAL = 'dialog-connection-error-fatal';

const mediaStreamKinds = ['audio', 'video'] as const;
export type MediaStreamKind = (typeof mediaStreamKinds)[number];
interface ServerParams {
  host: string;
  port: number;
  turn: TurnInfo;
}

interface ServerNotification {
  newPeer: { displayName: string; id: string; device: mediasoupClient.Device };
  peerClosed: { peerId: string };
  consumerClosed: { consumerId: string };
  peerBlocked: { peerId: string };
  peerUnblocked: { peerId: string };
  downlinkBwe: {
    desiredBitrate: number;
    effectiveDesiredBitrate: number;
    availableBitrate: number;
  };
  consumerLayersChanged: {
    consumerId: string;
    spatialLayer: number;
    temporalLayer: number;
  };
  consumerScore: { consumerId: string; score: number };
}

declare module 'protoo-client' {
  interface Peer extends EventTarget {}
}

interface NewConsumerRequest {
  peerId: string;
  producerId: string;
  id: string;
  kind: MediaKind;
  rtpParameters: RtpParameters;
  type: 'simple';
  appData: { peerId: string };
  producerPaused: boolean;
}
interface ServerRequest {
  newConsumer: NewConsumerRequest;
}

export class DialogAdapter extends EventEmitter {
  _micShouldBeEnabled = false;
  _micProducer: Producer | null = null;
  _cameraProducer: Producer | null = null;
  _shareProducer: Producer | null = null;
  _localMediaStream: MediaStream | null = null;
  _consumers = new Map();
  _pendingMediaRequests = new Map<
    string,
    Record<
      MediaStreamTrack['kind'],
      {
        promise?: Promise<MediaStream | null>;
        resolve: (value: MediaStream | PromiseLike<MediaStream> | null) => void;
        reject: (reason?: any) => void;
      }
    >
  >();
  _blockedClients = new Map();
  _forceTcp = false;
  _forceTurn = false;
  scene: null | Scene = null;
  _serverParams: ServerParams | null = null;
  _consumerStats: Record<
    string,
    { spatialLayers?: number; temporalLayers?: number; score?: number }
  > = {};
  _serverUrl = '';
  _downlinkBwe: ServerNotification['downlinkBwe'] | null = null;
  _protoo: Peer | null = null;
  _sendTransport: Transport | null = null;
  _recvTransport: Transport | null = null;
  _mediasoupDevice: mediasoupClient.Device | null = null;
  _roomId = '';
  _clientId = '';
  _iceTransportPolicy: RTCIceTransportPolicy = 'all';
  room = '';
  _device: mediasoupClient.Device | null = null;
  _useDataChannel = false;
  _videoProducer: Producer | null = null;

  constructor() {
    super();
  }

  get consumerStats() {
    return this._consumerStats;
  }

  get downlinkBwe() {
    return this._downlinkBwe;
  }

  getIceServers(host: string, port: number, turn: TurnInfo) {
    const iceServers = [];

    this._serverUrl = `wss://${host}:${port}`;

    if (turn && turn.enabled) {
      turn.transports.forEach((ts) => {
        // Try both TURN DTLS and TCP/TLS
        if (!this._forceTcp) {
          iceServers.push({
            urls: `turns:${host}:${ts.port}`,
            username: turn.username,
            credential: turn.credential,
          });
        }

        iceServers.push({
          urls: `turns:${host}:${ts.port}?transport=tcp`,
          username: turn.username,
          credential: turn.credential,
        });
      });
      iceServers.push({ urls: 'stun:stun1.l.google.com:19302' });
    } else {
      iceServers.push(
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      );
    }

    return iceServers;
  }

  // TODO: Re-implement server stats
  /**
   * Gets transport/consumer/producer stats on the server side.
   */
  async getServerStats() {
    return;
    // if (!this._protoo?.connected) {
    //   // Signaling channel not connected, no reason to get remote RTC stats.
    //   return;
    // }

    // const result: Record<
    //   string,
    //   | { name: "Send"; stats: { transportId: string }; producers: Record<string, { producerId: string }> }
    //   | { name: "Receive"; stats: { transportId: string }; consumers: Record<string, { consumerId: string }> }
    // > = {};
    // try {
    //   if (this._sendTransport && !this._sendTransport.closed) {
    //     const stats = await this._protoo.request("getTransportStats", {
    //       transportId: this._sendTransport.id
    //     });
    //     result[this._sendTransport.id] = { name: "Send", stats: stats, producers: {} };
    //     // HACK Using a private field
    //     // @ts-ignore
    //     for (const producer of this._sendTransport._producers) {
    //       const id = producer[0];
    //       result[this._sendTransport.id]["producers"][id] = await this._protoo.request("getProducerStats", {
    //         producerId: id
    //       });
    //     }
    //   }
    //   if (this._recvTransport && !this._recvTransport.closed) {
    //     const stats = await this._protoo.request("getTransportStats", {
    //       transportId: this._recvTransport.id
    //     });
    //     result[this._recvTransport.id] = { name: "Receive", stats: stats, consumers: {} };
    //     result[this._recvTransport.id]["consumers"] = {};
    //     // HACK: Using private field
    //     // @ts-ignore
    //     for (const consumer of this._recvTransport._consumers) {
    //       const id = consumer[0];
    //       result[this._recvTransport.id]["consumers"][id] = await this._protoo.request("getConsumerStats", {
    //         consumerId: id
    //       });
    //     }
    //   }
    //   return result;
    // } catch (e) {
    //   this.emitRTCEvent("error", "Adapter", () => `Error getting the server status: ${e}`);
    //   return { error: `Error getting the server status: ${e}` };
    // }
  }

  async iceRestart(transport: Transport) {
    // Force an ICE restart to gather new candidates and trigger a reconnection
    this.emitRTCEvent(
      'log',
      'RTC',
      () =>
        `Restarting ${transport.id === (this._sendTransport && this._sendTransport.id) ? 'send' : 'receive'} transport ICE`,
    );
    const iceParameters = await this._protoo?.request('restartIce', {
      transportId: transport.id,
    });
    await transport.restartIce({ iceParameters });
  }

  async recreateSendTransport(iceServers: RTCIceServer[]) {
    this.emitRTCEvent('log', 'RTC', () => `Recreating send transport ICE`);
    await this.closeSendTransport();
    await this.createSendTransport(iceServers);
  }

  /**
   * Restart ICE in the underlying send peerconnection.
   */
  async restartSendICE() {
    // Do not restart ICE if Signaling is disconnected.
    if (!this._protoo || !this._protoo.connected) {
      return;
    }

    try {
      // CHECK swapped "_closed" for loaded attribute
      if (this._sendTransport && !this._sendTransport.closed) {
        await this.iceRestart(this._sendTransport);
      } else {
        // If the transport is closed but the signaling is connected, we try to recreate
        const { host, port, turn } = this._serverParams || {
          host: '',
          port: 0,
          turn: { enabled: false },
        };
        const iceServers = this.getIceServers(host, port, turn);
        await this.recreateSendTransport(iceServers);
      }
    } catch (err) {
      this.emitRTCEvent(
        'error',
        'RTC',
        () => `Send transport [recreate] failed: ${err}`,
      );
    }
  }

  /**
   * Checks the Send Transport ICE status and restarts it in case is in failed state.
   * This is called by the Send Transport "connectionstatechange" event listener.
   * @param {boolean} connectionState The transport connnection state (ICE connection state)
   */
  checkSendIceStatus(connectionState: ConnectionState) {
    // If the ICE connection state is failed, we force an ICE restart
    if (connectionState === 'failed') {
      this.restartSendICE();
    }
  }

  async recreateRecvTransport(iceServers: RTCIceServer[]) {
    this.emitRTCEvent('log', 'RTC', () => `Recreating receive transport ICE`);
    await this.closeRecvTransport();
    await this.createRecvTransport(iceServers);
    await this._protoo?.request('refreshConsumers');
  }

  /**
   * Restart ICE in the underlying receive peerconnection.
   * @param {boolean} force Forces the execution of the reconnect.
   */
  async restartRecvICE() {
    if (!this._protoo || !this._protoo.connected) {
      return;
    }

    try {
      if (this._recvTransport && !this._recvTransport?.closed) {
        await this.iceRestart(this._recvTransport);
      } else {
        // If the transport is closed but the signaling is connected, we try to recreate
        const { host, port, turn } = this._serverParams || {
          host: '',
          port: 0,
          turn: { enabled: false },
        };
        const iceServers = this.getIceServers(host, port, turn);
        await this.recreateRecvTransport(iceServers);
      }
    } catch (err) {
      this.emitRTCEvent(
        'error',
        'RTC',
        () => `Receive transport [recreate] failed: ${err}`,
      );
    }
  }

  /**
   * Checks the ReeceiveReeceive Transport ICE status and restarts it in case is in failed state.
   * This is called by the Reeceive Transport "connectionstatechange" event listener.
   * @param {boolean} connectionState The transport connection state (ICE connection state)
   */
  checkRecvIceStatus(connectionState: ConnectionState) {
    // If the ICE connection state is failed, we force an ICE restart
    if (connectionState === 'failed') {
      this.restartRecvICE();
    }
  }

  async connect({
    serverUrl,
    roomId,
    serverParams,
    scene,
    clientId,
    forceTcp,
    forceTurn,
    iceTransportPolicy,
  }: {
    serverUrl: string;
    roomId: string;
    serverParams: ServerParams;
    scene: Scene | null;
    clientId: string;
    forceTcp: boolean;
    forceTurn: boolean;
    iceTransportPolicy: RTCIceTransportPolicy;
  }) {
    this._serverUrl = serverUrl;
    this._roomId = roomId;
    this._serverParams = serverParams;
    this._clientId = clientId;
    this.scene = scene;
    this._forceTcp = forceTcp;
    this._forceTurn = forceTurn;
    this._iceTransportPolicy = iceTransportPolicy;

    const urlWithParams = new URL(this._serverUrl);
    urlWithParams.searchParams.append('roomId', this._roomId);
    urlWithParams.searchParams.append('peerId', this._clientId);

    // TODO: Establishing connection could take a very long time.
    //       Inform the user if we are stuck here.
    const protooTransport = new protooClient.WebSocketTransport(
      urlWithParams.toString(),
      {
        retry: { retries: 2 },
      },
    );
    this._protoo = new protooClient.Peer(protooTransport);

    this._protoo?.on('disconnected', () => {
      this.emitRTCEvent('info', 'Signaling', () => `Disconnected`);
      this.cleanUpLocalState();
    });

    this._protoo?.on('failed', (attempt) => {
      this.emitRTCEvent(
        'error',
        'Signaling',
        () => `Failed: ${attempt}, retrying...`,
      );
    });

    this._protoo?.on('close', async () => {
      // We explicitly disconnect event handlers when closing the socket ourselves,
      // so if we get into here, we were not the ones closing the connection.
      this.emitRTCEvent('error', 'Signaling', () => `Closed`);
      this._retryConnectWithNewHost();
    });

    // eslint-disable-next-line no-unused-vars
    this._protoo.on('request', async (request, accept, reject) => {
      this.emitRTCEvent(
        'info',
        'Signaling',
        () => `Request [${request.method}]: ${request.data?.id}`,
      );
      debug(
        'proto "request" event [method:%s, data:%o]',
        request.method,
        request.data?.id,
      );

      switch (request.method) {
        case 'newConsumer': {
          const {
            peerId,
            producerId,
            id,
            kind,
            rtpParameters,
            /*type, */ appData /*, producerPaused */,
          }: {
            peerId: string;
            producerId: string;
            id: string;
            kind: MediaStreamKind;
            rtpParameters: RtpParameters;
            appData: { peerId: string };
          } = request.data;

          try {
            const consumer = await this._recvTransport?.consume({
              id,
              producerId,
              kind,
              rtpParameters,
              appData: { ...appData, peerId }, // Trick.
            });
            if (!consumer) throw new Error('Could not access new Consumer');
            // Store in the map.
            this._consumers.set(consumer.id, consumer);

            consumer.on('transportclose', () => {
              this.emitRTCEvent(
                'error',
                'RTC',
                () => `Consumer transport closed`,
              );
              this.removeConsumer(consumer.id);
            });

            if (kind === 'video') {
              const { spatialLayers, temporalLayers } =
                mediasoupClient.parseScalabilityMode(
                  consumer.rtpParameters.encodings?.at(0)?.scalabilityMode,
                );

              this._consumerStats[consumer.id] =
                this._consumerStats[consumer.id] || {};
              this._consumerStats[consumer.id]['spatialLayers'] = spatialLayers;
              this._consumerStats[consumer.id]['temporalLayers'] =
                temporalLayers;
            }

            // We are ready. Answer the protoo request so the server will
            // resume this Consumer (which was paused for now if video).
            accept();

            this.resolvePendingMediaRequestForTrack(peerId, consumer.track);

            // Notify of an stream update event
            this.emit('stream_updated', peerId, kind);
          } catch (err) {
            this.emitRTCEvent('error', 'Adapter', () => `Error: ${err}`);
            error('"newConsumer" request failed:%o', err);

            throw err;
          }

          break;
        }
      }
    });

    this._protoo.on('notification', (notification) => {
      debug(
        'proto "notification" event [method:%s, data:%o]',
        notification.method,
        notification.data,
      );

      switch (notification.method) {
        case 'newPeer': {
          break;
        }

        case 'peerClosed': {
          const { peerId } =
            notification.data as ServerNotification['peerClosed'];
          this.closePeer(peerId);

          break;
        }

        case 'consumerClosed': {
          const { consumerId } =
            notification.data as ServerNotification['consumerClosed'];
          const consumer = this._consumers.get(consumerId);

          if (!consumer) {
            info(
              `consumerClosed event received without related consumer: ${consumerId}`,
            );
            break;
          }

          consumer.close();
          this.removeConsumer(consumer.id);

          break;
        }

        case 'peerBlocked': {
          const { peerId } =
            notification.data as ServerNotification['peerBlocked'];
          document.body.dispatchEvent(
            new CustomEvent('blocked', { detail: { clientId: peerId } }),
          );

          break;
        }

        case 'peerUnblocked': {
          const { peerId } =
            notification.data as ServerNotification['peerUnblocked'];
          document.body.dispatchEvent(
            new CustomEvent('unblocked', { detail: { clientId: peerId } }),
          );

          break;
        }

        case 'downlinkBwe': {
          this._downlinkBwe =
            notification.data as ServerNotification['downlinkBwe'];
          break;
        }

        case 'consumerLayersChanged': {
          const { consumerId, spatialLayer, temporalLayer } =
            notification.data as ServerNotification['consumerLayersChanged'];

          const consumer = this._consumers.get(consumerId);

          if (!consumer) {
            info(
              `consumerLayersChanged event received without related consumer: ${consumerId}`,
            );
            break;
          }

          this._consumerStats[consumerId] =
            this._consumerStats[consumerId] || {};
          this._consumerStats[consumerId]['spatialLayers'] = spatialLayer;
          this._consumerStats[consumerId]['temporalLayers'] = temporalLayer;

          // TODO: If spatialLayer/temporalLayer are null, that's probably because the current downlink
          // it's not enough forany spatial layer bitrate. In that case the server has paused the consumer.
          // At this point we it would be nice to give the user some visual cue that this stream is paused.
          // ie. A grey overlay with some icon or replacing the video stream por a generic person image.
          break;
        }

        case 'consumerScore': {
          const { consumerId, score } =
            notification.data as ServerNotification['consumerScore'];

          const consumer = this._consumers.get(consumerId);

          if (!consumer) {
            info(
              `consumerScore event received without related consumer: ${consumerId}`,
            );
            break;
          }

          this._consumerStats[consumerId] =
            this._consumerStats[consumerId] || {};
          this._consumerStats[consumerId]['score'] = score;
        }
      }
    });

    return new Promise<void>((resolve, reject) => {
      this._protoo?.on('open', async () => {
        this.emitRTCEvent('info', 'Signaling', () => `Open`);

        try {
          await this._joinRoom();
          resolve();
          this.emit(DIALOG_CONNECTION_CONNECTED);
        } catch (err) {
          this.emitRTCEvent(
            'warn',
            'Adapter',
            () => `Error during connect: ${error}`,
          );
          reject(err);
          this.emit(DIALOG_CONNECTION_ERROR_FATAL);
        }
      });
    });
  }

  async _retryConnectWithNewHost() {
    this.cleanUpLocalState();
    // TODO: Fix EventEmitter logic
    // this._protoo?.removeAllListeners();
    const serverParams = await APP.hubChannel.getHost();
    const { host, port } = serverParams;
    const newServerUrl = `wss://${host}:${port}`;
    if (this._serverUrl === newServerUrl) {
      console.error('Reconnect to dialog failed.');
      this.emit(DIALOG_CONNECTION_ERROR_FATAL);
      return;
    }
    console.log(
      `The Dialog server has changed to ${newServerUrl}, reconnecting with the new server...`,
    );
    await this.connect({
      serverUrl: newServerUrl,
      roomId: this._roomId,
      serverParams,
      scene: this.scene,
      clientId: this._clientId,
      forceTcp: this._forceTcp,
      forceTurn: this._forceTurn,
      iceTransportPolicy: this._iceTransportPolicy,
    });
  }

  closePeer(peerId: string) {
    const pendingMediaRequests = this._pendingMediaRequests.get(peerId);

    if (pendingMediaRequests) {
      const msg = 'The user disconnected before the media stream was resolved.';
      info(msg);

      if (pendingMediaRequests.audio) {
        pendingMediaRequests.audio.resolve(null);
      }

      if (pendingMediaRequests.video) {
        pendingMediaRequests.video.resolve(null);
      }

      this._pendingMediaRequests.delete(peerId);
    }
  }

  resolvePendingMediaRequestForTrack(
    clientId: string,
    track: MediaStreamTrack,
  ) {
    const requests = this._pendingMediaRequests.get(clientId);
    if (!requests) return;

    const tr: Partial<Record<string, number>> = {};
    const f = tr['5'];

    const s = requests['test'];

    if (requests[track.kind]) {
      const resolve = requests[track.kind]!.resolve;
      delete requests[track.kind];
      resolve(new MediaStream([track]));
    }

    if (Object.keys(requests).length === 0) {
      this._pendingMediaRequests.delete(clientId);
    }
  }

  removeConsumer(consumerId: string) {
    this.emitRTCEvent('info', 'RTC', () => `Consumer removed: ${consumerId}`);
    this._consumers.delete(consumerId);
  }

  getMediaStream(clientId: string, kind = 'audio') {
    let track;

    if (this._clientId === clientId) {
      if (kind === 'audio' && this._micProducer) {
        track = this._micProducer.track;
      } else if (kind === 'video') {
        if (this._cameraProducer && !this._cameraProducer.closed) {
          track = this._cameraProducer.track;
        } else if (this._shareProducer && !this._shareProducer.closed) {
          track = this._shareProducer.track;
        }
      }
    } else {
      this._consumers.forEach((consumer) => {
        if (
          consumer.appData.peerId === clientId &&
          kind == consumer.track.kind
        ) {
          track = consumer.track;
        }
      });
    }

    if (track) {
      debug(`Already had ${kind} for ${clientId}`);
      return Promise.resolve(new MediaStream([track]));
    }

    debug(`Waiting on ${kind} for ${clientId}`);
    if (!this._pendingMediaRequests.has(clientId)) {
      this._pendingMediaRequests.set(clientId, {});
    }

    const requests = this._pendingMediaRequests.get(clientId);
    if (!requests) return;
    const promise = new Promise<MediaStream | null>(
      (resolve, reject) => (requests[kind] = { resolve, reject }),
    );
    requests[kind].promise = promise;
    promise.catch((e) => {
      this.emitRTCEvent('error', 'Adapter', () => `getMediaStream error: ${e}`);
      console.warn(`${clientId} getMediaStream Error`, e);
    });
    return promise;
  }

  async createSendTransport(iceServers: RTCIceServer[]) {
    if (!this._mediasoupDevice) return;
    // Create mediasoup Transport for sending (unless we don't want to produce).
    const sendTransportInfo = await this._protoo?.request(
      'createWebRtcTransport',
      {
        producing: true,
        consuming: false,
        sctpCapabilities: undefined,
      },
    );

    this._sendTransport = this._mediasoupDevice.createSendTransport({
      id: sendTransportInfo.id,
      iceParameters: sendTransportInfo.iceParameters,
      iceCandidates: sendTransportInfo.iceCandidates,
      dtlsParameters: sendTransportInfo.dtlsParameters,
      sctpParameters: sendTransportInfo.sctpParameters,
      iceServers,
      iceTransportPolicy: this._iceTransportPolicy,
      // CHECK: This proprietaryConstraints stuff
      //proprietaryConstraints: PC_PROPRIETARY_CONSTRAINTS
    });

    this._sendTransport.on(
      'connect',
      ({ dtlsParameters }, callback, errback) => {
        this.emitRTCEvent('info', 'RTC', () => `Send transport [connect]`);
        this._sendTransport?.observer.on('close', () => {
          this.emitRTCEvent('info', 'RTC', () => `Send transport [close]`);
        });
        this._sendTransport?.observer.on('newproducer', (producer) => {
          this.emitRTCEvent(
            'info',
            'RTC',
            () => `Send transport [newproducer]: ${producer.id}`,
          );
        });
        this._sendTransport?.observer.on('newconsumer', (consumer) => {
          this.emitRTCEvent(
            'info',
            'RTC',
            () => `Send transport [newconsumer]: ${consumer.id}`,
          );
        });

        this._protoo
          ?.request('connectWebRtcTransport', {
            transportId: this._sendTransport?.id,
            dtlsParameters,
          })
          .then(callback)
          .catch(errback);
      },
    );

    this._sendTransport.on('connectionstatechange', (connectionState) => {
      let level: RTCEventLevel = 'info';
      if (connectionState === 'failed' || connectionState === 'disconnected') {
        level = 'error';
      }
      this.emitRTCEvent(
        level,
        'RTC',
        () => `Send transport [connectionstatechange]: ${connectionState}`,
      );

      this.checkSendIceStatus(connectionState);
    });

    this._sendTransport.on(
      'produce',
      async ({ kind, rtpParameters, appData }, callback, errback) => {
        this.emitRTCEvent(
          'info',
          'RTC',
          () => `Send transport [produce]: ${kind}`,
        );
        try {
          const { id } = await this._protoo?.request('produce', {
            transportId: this._sendTransport?.id,
            kind,
            rtpParameters,
            appData,
          });

          callback({ id });
        } catch (error: any) {
          this.emitRTCEvent(
            'error',
            'Signaling',
            () => `[produce] error: ${error}`,
          );
          errback(error);
        }
      },
    );
  }

  async closeSendTransport() {
    if (this._micProducer) {
      this._micProducer.close();
      this._protoo?.connected &&
        this._protoo?.request('closeProducer', {
          producerId: this._micProducer.id,
        });
      this._micProducer = null;
    }

    if (this._videoProducer) {
      this._videoProducer.close();
      this._protoo?.connected &&
        this._protoo?.request('closeProducer', {
          producerId: this._videoProducer.id,
        });
      this._videoProducer = null;
    }

    // TODO: If _sendTransport is falsey then return
    const transportId = this._sendTransport?.id;
    if (this._sendTransport && !this._sendTransport.closed) {
      this._sendTransport.close();
      this._sendTransport = null;
    }

    if (this._protoo?.connected) {
      try {
        await this._protoo.request('closeWebRtcTransport', { transportId });
      } catch (err) {
        error(err);
      }
    }
  }

  // REIMP
  async createRecvTransport(iceServers: RTCIceServer[]) {
    //     if (!this._protoo)
    //       return console.error(
    //         'Could not create RecvTransport — _protoo is not defined!',
    //       );
    //     if (!this._mediasoupDevice)
    //       return console.error(
    //         'Could not create RecvTransport — mediaSoupDevice is not defined!',
    //       );
    //     // Create mediasoup Transport for sending (unless we don't want to consume).
    //     const recvTransportInfo = await this._protoo.request(
    //       'createWebRtcTransport',
    //       {
    //         producing: false,
    //         consuming: true,
    //         sctpCapabilities: undefined,
    //       },
    //     );
    //     this._recvTransport = this._mediasoupDevice.createRecvTransport({
    //       id: recvTransportInfo.id,
    //       iceParameters: recvTransportInfo.iceParameters,
    //       iceCandidates: recvTransportInfo.iceCandidates,
    //       dtlsParameters: recvTransportInfo.dtlsParameters,
    //       sctpParameters: recvTransportInfo.sctpParameters,
    //       iceServers,
    //       iceTransportPolicy: this._iceTransportPolicy,
    //     });
    //     this._recvTransport.on(
    //       'connect',
    //       ({ dtlsParameters }, callback, errback) => {
    //         this.emitRTCEvent('info', 'RTC', () => `Receive transport [connect]`);
    //         this._recvTransport?.observer.on('close', () => {
    //           this.emitRTCEvent('info', 'RTC', () => `Receive transport [close]`);
    //         });
    //         this._recvTransport?.observer.on('newproducer', (producer) => {
    //           this.emitRTCEvent(
    //             'info',
    //             'RTC',
    //             () => `Receive transport [newproducer]: ${producer.id}`,
    //           );
    //         });
    //         this._recvTransport?.observer.on('newconsumer', (consumer) => {
    //           this.emitRTCEvent(
    //             'info',
    //             'RTC',
    //             () => `Receive transport [newconsumer]: ${consumer.id}`,
    //           );
    //         });
    //         this._protoo
    //           ?.request('connectWebRtcTransport', {
    //             transportId: this._recvTransport?.id,
    //             dtlsParameters,
    //           })
    //           .then(callback)
    //           .catch(errback);
    //       },
    //     );
    //     this._recvTransport.on('connectionstatechange', (connectionState) => {
    //       let level: RTCEventLevel = 'info';
    //       if (connectionState === 'failed' || connectionState === 'disconnected') {
    //         level = 'error';
    //       }
    //       this.emitRTCEvent(
    //         level,
    //         'RTC',
    //         () => `Receive transport [connectionstatechange]: ${connectionState}`,
    //       );
    //       this.checkRecvIceStatus(connectionState);
    //     });
    //   }
    //   async closeRecvTransport() {
    //     const transportId = this._recvTransport?.id;
    //     if (this._recvTransport && !this._recvTransport.closed) {
    //       this._recvTransport.close();
    //       this._recvTransport = null;
    //     }
    //     if (this._protoo?.connected) {
    //       try {
    //         await this._protoo.request('closeWebRtcTransport', { transportId });
    //       } catch (err) {
    //         error(err);
    //       }
    //     }
    //   }
    //   async _joinRoom() {
    //     debug('_joinRoom()');
    //     if (!this._protoo)
    //       return console.error('Could not join room — _protoo is not defined!');
    //     this._mediasoupDevice = new mediasoupClient.Device({});
    //     const routerRtpCapabilities = await this._protoo.request(
    //       'getRouterRtpCapabilities',
    //     );
    //     await this._mediasoupDevice.load({ routerRtpCapabilities });
    //     const { host, port, turn } = this._serverParams || {
    //       host: '',
    //       port: 0,
    //       turn: { enabled: false },
    //     };
    //     const iceServers = this.getIceServers(host, port, turn);
    //     await this.createSendTransport(iceServers);
    //     await this.createRecvTransport(iceServers);
    //     await this._protoo.request('join', {
    //       displayName: this._clientId,
    //       device: this._device,
    //       rtpCapabilities: this._mediasoupDevice.rtpCapabilities,
    //       sctpCapabilities: this._useDataChannel
    //         ? this._mediasoupDevice.sctpCapabilities
    //         : undefined,
    //       token: APP.hubChannel.token,
    //     });
    //     if (this._localMediaStream) {
    //       // TODO: Refactor to be "Create producers"
    //       await this.setLocalMediaStream(this._localMediaStream);
    //     }
  }

  // REIMP
  async setLocalMediaStream(stream: MediaStream) {
    // if (!this._sendTransport) {
    //   console.error(
    //     'Tried to setLocalMediaStream before a _sendTransport existed',
    //   );
    //   return;
    // }
    // this.emitRTCEvent('info', 'RTC', () => `Creating missing producers`);
    // let sawAudio = false;
    // let sawVideo = false;
    // await Promise.all(
    //   stream.getTracks().map(async (track) => {
    //     if (!this._sendTransport) return;
    //     if (track.kind === 'audio') {
    //       sawAudio = true;
    //       // TODO multiple audio tracks?
    //       if (this._micProducer) {
    //         if (this._micProducer.track !== track) {
    //           this._micProducer.track?.stop();
    //           this._micProducer.replaceTrack({ track });
    //         }
    //       } else {
    //         // stopTracks = false because otherwise the track will end during a temporary disconnect
    //         this._micProducer = await this._sendTransport.produce({
    //           track,
    //           // CHECK
    //           //  pause: !this._micShouldBeEnabled,
    //           stopTracks: false,
    //           codecOptions: { opusStereo: false, opusDtx: true },
    //           zeroRtpOnPause: true,
    //           disableTrackOnPause: true,
    //         });
    //         this._micProducer?.on('transportclose', () => {
    //           this.emitRTCEvent('info', 'RTC', () => `Mic transport closed`);
    //           this._micProducer = null;
    //         });
    //         this.emit('mic-state-changed', { enabled: this.isMicEnabled });
    //       }
    //     } else {
    //       sawVideo = true;
    //       if (track._hubs_contentHint === MediaDevices.SCREEN) {
    //         await this.disableCamera();
    //         await this.enableShare(track);
    //       } else if (track._hubs_contentHint === MediaDevices.CAMERA) {
    //         await this.disableShare();
    //         await this.enableCamera(track);
    //       }
    //     }
    //     this.resolvePendingMediaRequestForTrack(this._clientId, track);
    //   }),
    // );
    // if (!sawAudio && this._micProducer) {
    //   this._protoo?.request('closeProducer', {
    //     producerId: this._micProducer.id,
    //   });
    //   this._micProducer.close();
    //   this._micProducer = null;
    // }
    // if (!sawVideo) {
    //   this.disableCamera();
    //   this.disableShare();
    // }
    // this._localMediaStream = stream;
  }

  async enableCamera(track: MediaStreamTrack) {
    if (!this._sendTransport)
      return console.error('Could not enable camera — SendTransport is null! ');
    // stopTracks = false because otherwise the track will end during a temporary disconnect
    this._cameraProducer = await this._sendTransport.produce({
      track,
      stopTracks: false,
      codecOptions: { videoGoogleStartBitrate: 1000 },
      encodings: WEBCAM_SIMULCAST_ENCODINGS,
      zeroRtpOnPause: true,
      disableTrackOnPause: true,
    });

    this._cameraProducer.on('transportclose', () => {
      this.emitRTCEvent('info', 'RTC', () => `Camera transport closed`);
      this.disableCamera();
    });
    this._cameraProducer.observer.on('trackended', () => {
      this.emitRTCEvent('info', 'RTC', () => `Camera track ended`);
      this.disableCamera();
    });
  }

  async disableCamera() {
    if (!this._protoo)
      return console.error(
        'Could not disable camera — _protoo is not defined!',
      );
    if (!this._sendTransport)
      return console.error(
        'Could not disable camera — sendTransport is not defined!',
      );
    if (!this._cameraProducer) return;

    this._cameraProducer.close();

    try {
      if (!this._sendTransport.closed) {
        await this._protoo?.request('closeProducer', {
          producerId: this._cameraProducer.id,
        });
      }
    } catch (error) {
      console.error(`disableCamera(): ${error}`);
    }

    this._cameraProducer = null;
  }

  async enableShare(track: MediaStreamTrack) {
    // stopTracks = false because otherwise the track will end during a temporary disconnect
    if (!this._sendTransport)
      return console.error(
        'Could not enable share — sendTransport is not defined!',
      );

    this._shareProducer = await this._sendTransport.produce({
      track,
      stopTracks: false,
      codecOptions: { videoGoogleStartBitrate: 1000 },
      encodings: SCREEN_SHARING_SIMULCAST_ENCODINGS,
      zeroRtpOnPause: true,
      disableTrackOnPause: true,
      appData: {
        share: true,
      },
    });

    this._shareProducer.on('transportclose', () => {
      this.emitRTCEvent('info', 'RTC', () => `Desktop Share transport closed`);
      this.disableShare();
    });
    this._shareProducer.observer.on('trackended', () => {
      this.emitRTCEvent(
        'info',
        'RTC',
        () => `Desktop Share transport track ended`,
      );
      this.disableShare();
    });
  }

  async disableShare() {
    if (!this._shareProducer) return;
    if (!this._sendTransport)
      return console.error(
        'Could not disable share — sendTransport is not defined!',
      );
    if (!this._protoo)
      return console.error('Could not disable share — _protoo is not defined!');

    this._shareProducer.close();

    try {
      if (!this._sendTransport.closed) {
        await this._protoo.request('closeProducer', {
          producerId: this._shareProducer.id,
        });
      }
    } catch (error) {
      console.error(`disableShare(): ${error}`);
    }

    this._shareProducer = null;
  }

  toggleMicrophone() {
    if (this.isMicEnabled) {
      this.enableMicrophone(false);
    } else {
      this.enableMicrophone(true);
    }
  }

  enableMicrophone(enabled: boolean) {
    if (!this._protoo)
      return console.error(
        'Could not enable microphone — _protoo is not defined!',
      );
    if (!this._micProducer)
      return console.error("Tried to toggle mic but there's no producer.");

    if (enabled && !this.isMicEnabled) {
      this._micProducer.resume();
      this._protoo.request('resumeProducer', {
        producerId: this._micProducer.id,
      });
    } else if (!enabled && this.isMicEnabled) {
      this._micProducer.pause();
      this._protoo.request('pauseProducer', {
        producerId: this._micProducer.id,
      });
    }
    this._micShouldBeEnabled = enabled;
    this.emit('mic-state-changed', { enabled: this.isMicEnabled });
  }

  get isMicEnabled() {
    return this._micProducer && !this._micProducer.paused;
  }

  cleanUpLocalState() {
    this._sendTransport && this._sendTransport.close();
    this._sendTransport = null;
    this._recvTransport && this._recvTransport.close();
    this._recvTransport = null;
    this._micProducer = null;
    this._shareProducer = null;
    this._cameraProducer = null;
  }

  // REIMP
  disconnect() {
    debug('disconnect()');
    // this.cleanUpLocalState();
    // if (this._protoo) {
    //   this._protoo.removeAllListeners();
    //   if (this._protoo.connected) {
    //     this._protoo.close();
    //     this.emitRTCEvent('info', 'Signaling', () => `[close]`);
    //   }
    // }
  }

  // REIMP
  kick(clientId: string) {
    // if (!this._protoo)
    //   return console.error('Could not kick user — _protoo is not defined!');
    // return this._protoo
    //   .request('kick', {
    //     room_id: this.room,
    //     user_id: clientId,
    //     token: APP.hubChannel.token,
    //   })
    //   .then(() => {
    //     document.body.dispatchEvent(
    //       new CustomEvent('kicked', { detail: { clientId: clientId } }),
    //     );
    //   });
  }

  block(clientId: string) {
    if (!this._protoo)
      return console.error('Could not block user — _protoo is not defined!');
    return this._protoo.request('block', { whom: clientId }).then(() => {
      this._blockedClients.set(clientId, true);
      document.body.dispatchEvent(
        new CustomEvent('blocked', { detail: { clientId: clientId } }),
      );
    });
  }

  unblock(clientId: string) {
    if (!this._protoo)
      return console.error('Could not unblock user — _protoo is not defined!');
    return this._protoo.request('unblock', { whom: clientId }).then(() => {
      this._blockedClients.delete(clientId);
      document.body.dispatchEvent(
        new CustomEvent('unblocked', { detail: { clientId: clientId } }),
      );
    });
  }

  emitRTCEvent(level: RTCEventLevel, tag: RTCTag, msgFunc: () => void) {
    if (!APP.store.state.preferences.showRtcDebugPanel) return;
    const time = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    this.scene?.emit('rtc_event', { level, tag, time, msg: msgFunc() });
  }
}
