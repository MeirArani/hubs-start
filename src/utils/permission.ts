import type {
  TransportData,
  TransportDataPayload,
  TransportDataPayloadSyncable,
} from '#/networking/transport-for-channel';
import type { Permission } from '#/systems/aframe/permissions';
import type { Component, Schema } from '#/types/networked-aframe';

interface EntityMetadata {
  template: string;
  creator: string;
  isPinned: boolean;
}

const emptyObject = {};

const persistentSyncs: Record<string, TransportDataPayloadSyncable> = {};
function stashPersistentSync(
  message: TransportDataPayloadSyncable,
  entityData: TransportData,
) {
  if (!persistentSyncs[entityData.networkId]) {
    persistentSyncs[entityData.networkId] = {
      dataType: 'u',
      data: entityData,
      clientId: message.clientId,
      from_session_id: message.from_session_id,
    };
  } else {
    const currentData = persistentSyncs[entityData.networkId].data;
    const currentComponents = currentData.components;
    Object.assign(currentData, entityData);
    currentData.components = Object.assign(
      currentComponents,
      entityData.components,
    );
  }
}

function indexForComponent(component: Component, schema: Schema) {
  const componentName =
    typeof component === 'string' ? component : component.component;

  if (typeof component === 'string') {
    return schema.components.findIndex(
      (schemaComponent) => schemaComponent === componentName,
    );
  }
  return schema.components.findIndex((schemaComponent) => {
    if (typeof schemaComponent === 'string') return;
    schemaComponent.component === componentName &&
      schemaComponent.property === component.property;
  });
}

function getPendingOrExistingEntityMetadata(networkId: string) {
  const pendingData =
    NAF.connection.adapter.getPendingDataForNetworkId(networkId);

  if (pendingData) {
    if (pendingData.owner) {
      // If owner is no longer present, give up.
      const presenceState =
        window.APP.hubChannel?.presence?.state[pendingData.owner];
      if (!presenceState) return;
    }

    const { template, creator } = pendingData;
    const schema = Array.from(NAF.schemas.values()).find(
      (schema) => (schema.template = template),
    );
    if (!schema) return;
    const pinnableComponent =
      pendingData.components[indexForComponent('pinnable', schema)];
    const isPinned = pinnableComponent && pinnableComponent.pinned;
    return { template, creator, isPinned };
  }

  const entity = NAF.entities.getEntity(networkId);
  if (!entity) return null;

  const { template, creator } = entity.components.networked.data;
  const isPinned =
    entity.components.pinnable && entity.components.pinnable.data.pinned;
  return { template, creator, isPinned };
}

function authorizeOrSanitizeMessageData(
  data: TransportData | null,
  sender: string,
  senderPermissions: Record<Permission, boolean>,
) {
  if (!data) return false;
  const entityMetadata = getPendingOrExistingEntityMetadata(data.networkId);
  if (!entityMetadata) return false;

  if (authorizeEntityManipulation(entityMetadata, sender, senderPermissions)) {
    return true;
  } else {
    const { template } = entityMetadata;
    sanitizeMessageData(template, data);
    return true;
  }
}

let nonAuthorizedSchemas: Record<string, string[]> = {};
function initializeNonAuthorizedSchemas() {
  /*
  Takes the NAF schemas defined in network-schemas.js and produces a data structure of template name to non-authorized
  component indices:
  {
    "#interactable-media": ["4", "5", "6"]
  }
  */
  nonAuthorizedSchemas = {};
  for (const scheme of NAF.schemas.values()) {
    nonAuthorizedSchemas[scheme.template] = (
      scheme.nonAuthorizedComponents || []
    )
      .map((nonAuthorizedComponent) =>
        indexForComponent(nonAuthorizedComponent, scheme),
      )
      .map((index) => index.toString());
  }
}

function sanitizeMessageData(template: string, data: TransportData) {
  if (nonAuthorizedSchemas === null) {
    initializeNonAuthorizedSchemas();
  }
  const nonAuthorizedIndices = nonAuthorizedSchemas[template];
  for (const index in data.components) {
    if (!Object.prototype.hasOwnProperty.call(data.components, index)) continue;
    if (!nonAuthorizedIndices.includes(index)) {
      data.components[index] = null;
    }
  }
  return data;
}

function authorizeEntityManipulation(
  entityMetadata: EntityMetadata,
  sender: string,
  senderPermissions: Record<Permission, boolean>,
) {
  const { template, creator, isPinned } = entityMetadata;
  const isCreator = sender === creator;

  if (
    template.endsWith('-waypoint-avatar') ||
    template.endsWith('-media-frame')
  ) {
    return true;
  } else if (template.endsWith('-avatar')) {
    return isCreator;
  } else if (template.endsWith('-media')) {
    return (
      (!isPinned || senderPermissions.pin_objects) &&
      (isCreator || senderPermissions.spawn_and_move_media)
    );
  } else if (template.endsWith('-camera')) {
    return isCreator || senderPermissions.spawn_camera;
  } else if (template.endsWith('-pen') || template.endsWith('-drawing')) {
    return isCreator || senderPermissions.spawn_drawing;
  } else if (template.endsWith('-emoji')) {
    return isCreator || senderPermissions.spawn_emoji;
  } else {
    return false;
  }
}

export function authorizeOrSanitizeMessage(message: TransportDataPayload) {
  if (message.dataType === 'none') return null;
  const { dataType, from_session_id } = message;

  if (
    dataType === 'u' &&
    message.data.isFirstSync &&
    !message.data.persistent
  ) {
    // The server has already authorized first sync messages that result in an instantiation.
    return message;
  }

  const presenceState = from_session_id
    ? window.APP.hubChannel?.presence?.state[from_session_id]
    : null;

  if (!presenceState) {
    // We've received a manipulation message from a user that we don't have presence state for yet.
    // Since we can't make a judgement about their permissions, we'll have to ignore the message.
    return null;
  }

  const senderPermissions = presenceState.metas[0].permissions;

  switch (dataType) {
    case 'um':
      let sanitizedAny = false;
      let stashedAny = false;
      for (const index in message.data.d) {
        if (!Object.hasOwn(message.data.d, index)) continue;

        const entityData = message.data.d[index];
        if (
          entityData?.persistent &&
          !NAF.entities.getEntity(entityData.networkId)
        ) {
          stashPersistentSync(message, entityData);
          message.data.d[index] = null;
          stashedAny = true;
          continue;
        }
        const authorizedOrSanitized = authorizeOrSanitizeMessageData(
          entityData,
          from_session_id || '',
          senderPermissions,
        );
        if (!authorizedOrSanitized) {
          message.data.d[index] = null;
          sanitizedAny = true;
        }
      }

      if (sanitizedAny || stashedAny) {
        message.data.d = message.data.d.filter((x) => x != null);
      }

      return message;
    case 'u':
      if (
        message.data.persistent &&
        !NAF.entities.getEntity(message.data.networkId)
      ) {
        persistentSyncs[message.data.networkId] = message;
        return null;
      }
      const authorizedOrSanitized = authorizeOrSanitizeMessageData(
        message.data,
        from_session_id || '',
        senderPermissions,
      );
      if (authorizedOrSanitized) return message;
      return null;
    case 'r':
      const entityMetadata = getPendingOrExistingEntityMetadata(
        message.data.networkId,
      );
      if (!entityMetadata) return null;
      if (
        authorizeEntityManipulation(
          entityMetadata,
          from_session_id || '',
          senderPermissions,
        )
      )
        return message;
      return null;
    default:
      return message;
  }
}
