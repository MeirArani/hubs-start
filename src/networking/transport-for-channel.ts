import { Channel } from 'phoenix';

// TODO: Fix transport data interface
export interface TransportData {
  components: Record<number, any>;
  creator: string;
  isFirstSync: boolean;
  lastOwnerTime: number;
  networkId: string;
  owner: string;
  parent: string | null;
  persistent: boolean;
  template: string;
}

export type TransportDataType = keyof TransportDataPayloadTable;

export type TransportDataPayloadTable = {
  u: {
    dataType: 'u';
    data: TransportData;
    clientId?: string;
    from_session_id?: string;
    source?: string;
  };
  um: {
    dataType: 'um';
    data: { d: (TransportData | null)[]; components: Record<number, any> };
    clientId?: string;
    from_session_id?: string;
    source?: string;
  };
  r: {
    dataType: 'r';
    data: TransportData;
    clientId?: string;
    from_session_id?: string;
    source?: string;
  };
  nn: {
    dataType: 'nn';
    creates: {
      version: 1;
      networkId: string;
      prefabName: string;
      initialData: unknown;
    }[];
    clientId?: string;
    deletes: string[];
    fromClientId?: string;
    updates: {
      componentIds: number[];
      data: unknown[];
      lastOwnerTime: number;
      nid: string;
      owner: null | string;
      timestamp: number;
    }[];
    from_session_id?: string;
    source?: string;
  };
  none: {
    dataType: 'none';
    clientId?: string;
    from_session_id?: string;
    source?: string;
  };
};

export type TransportDataPayload =
  TransportDataPayloadTable[keyof TransportDataPayloadTable];
export type TransportDataPayloadSyncable = Extract<
  TransportDataPayload,
  { data: any }
>;

export default function transportForChannel(channel: Channel, reliable = true) {
  return function transportForChannel<
    K extends keyof TransportDataPayloadTable,
  >(
    clientId: string | undefined,
    dataHolder?: { dataType: K; data: TransportDataPayloadTable[K] },
  ) {
    const payload: TransportDataPayload = dataHolder?.data || {
      dataType: 'none',
    };

    if (clientId) {
      payload.clientId = clientId;
    }

    const isOpen = channel.socket.connectionState() === 'open';

    if (isOpen || reliable) {
      const hasFirstSync =
        payload.dataType === 'none'
          ? false
          : payload.dataType === 'nn'
            ? false
            : payload.dataType === 'um'
              ? payload.data.d.find((r) => r && r.isFirstSync)
              : payload.data.isFirstSync;

      if (hasFirstSync) {
        if (isOpen) {
          channel.push('naf', payload);
        } else {
          // Memory is re-used, so make a copy
          channel.push('naf', AFRAME.utils.clone(payload));
        }
      } else {
        // Optimization: Strip isFirstSync and send payload as a string to reduce server parsing.
        // The server will not parse messages without isFirstSync keys when sent to the nafr event.
        //
        // The client must assume any payload that does not have a isFirstSync key is not a first sync.
        const nafrPayload = AFRAME.utils.clone(payload);
        if (nafrPayload.dataType === 'um') {
          for (let i = 0; i < nafrPayload.data.d.length; i++) {
            delete nafrPayload.data.d[i].isFirstSync;
          }
        } else {
          delete nafrPayload.data.isFirstSync;
        }

        channel.push('nafr', { naf: JSON.stringify(nafrPayload) });
      }
    }
  };
}
