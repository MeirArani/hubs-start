interface ComponentSelector {
  component: string;
  selector?: string;
  property?: string;
  requiresNetworkUpdate?: RequiresNetworkUpdate;
}

interface Schema {
  template: string;
  components: Component[];
  nonAuthorizedComponents?: Component[];
}

// export type Component = ComponentSelector | string;

declare module 'networked-aframe' {
  const naf: naf;
  interface naf {
    clientId: string;
    adapters: {
      IS_CONNECTED: 'IS_CONNECTED';
      CONNECTING: 'CONNECTING';
      NOT_CONNECTED: 'NOT_CONNECTED';
      make(adapterName: string): AdapterClass | null;
      register(adapterName: string, AdapterClass: any): void;
      adapters: Record<string, AdapterClass>;
    };
    connection: {
      connectedClients: Record<string, string>;
      activeDataChannels: Record<string, boolean>;
      onConnect: (Function) => void;
      getServerTime: () => number;
      isConnected: () => boolean;
      adapter: PhoenixAdapter;
      entities: NetworkEntities;
      hasActiveDataChannel: (string) => boolean;
      subscribeToDataChannel: (
        dataType: string,
        callback: (fromClientId: string, _dataType: string, data: any) => void,
      ) => void;
      unsubscribeToDataChannel: (
        dataType: string,
        callback: (fromClientId: string, _dataType: string, data: any) => void,
      ) => void;
      sendDataGuaranteed<K extends keyof TransportDataPayloadTable>(
        clientId: string,
        payload: { dataType: K; data: TransportDataPayloadTable[K] },
      );
      broadcastDataGuaranteed<
        K extends keyof TransportDataPayloadTable,
      >(payload: {
        dataType: K;
        data: TransportDataPayloadTable[K];
      });
    };
    entities: {
      removeRemoteEntities(
        toClient?: unknown,
        dataType?: unknown,
        data?: unknown,
        source?: unknown,
      ): Entity | null;
      removeEntity(string: id): Entity | null;
      getEntity(string: id): Entity | null;
    };
    options: {
      debug: boolean;
      updateRate: number;
      useLerp: boolean;
      firstSyncSource: null | string;
      syncSource: null | string;
    };
    schemas: Set<Schema>;
    utils: {
      now: () => number;
      isMine: (el: Entity) => boolean;
      takeOwnership: (el: Entity) => boolean;
      createNetworkId: () => string;
      getNetworkedEntity: (el: Entity) => Promise<Entity>;
      getNetworkId: (el: Entity) => string | null;
      getNetworkOwner: (el: Entity) => string | null;
      getCreator: (string) => string | null;
      whenEntityLoaded: (Entity, Function) => void;
      createHtmlNodeFromString: (string) => Element;
      almostEqualVec3: (u: Vector3, v: Vector3, number) => boolean;
      vectorRequiresUpdate: (epsilon: number) => boolean;
    };
  }
}
