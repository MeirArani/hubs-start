import type { Hub, HubScene } from '#/core/hub';
import { m } from '#/paraglide/messages';
import type { Attribution } from '#/types/hubs';
import Button from '../input/Button';
import { CloseButton } from '../input/CloseButton';
import IconButton from '../input/IconButton';
import InputField from '../input/InputField';
import { Column } from '../layout/Column';
import Sidebar from '../sidebar/Sidebar';

function SceneAttribution({ attribution }: { attribution: Attribution }) {
  const unknown = m['room-sidebar.unknown']();

  const name = attribution.name || attribution.title || unknown;
  const author = attribution.author || unknown;

  if (attribution.url) {
    const source = attribution.url.includes('sketchfab.com')
      ? 'Sketchfab'
      : null;

    return (
      <li className="text-sm mt-2 text-text-secondary first:mt-0">
        <div className="font-bold">
          <a href={attribution.url} target="_blank" rel="noopener noreferrer">
            {name}
          </a>
        </div>
        <div className="mt-1">
          {source
            ? m['room-sidebar.scene-attribution-with-source']({
                author,
                source,
              })
            : m['room-sidebar.scene-attribution']({ author })}
        </div>
      </li>
    );
  }

  if (attribution.author)
    return (
      <li className="attribution">
        <div className="font-bold">{name}</div>
        <div className="mt-1">
          {m['room-sidebar.scene-attribution']({ author })}
        </div>
      </li>
    );

  return null;
}

// To assist with content control, we avoid displaying scene links to users who are not the scene
// creator, unless the scene is remixable or promotable.
function allowDisplayOfSceneLink(accountId: string, scene: HubScene) {
  return true;
  //   return (
  //     scene &&
  //     ((accountId && scene.account_id === accountId) ||
  //       scene.allow_promotion ||
  //       scene.allow_remixing)
  //   );
}

export interface SceneInfoProps {
  accountId?: string;
  showAttributions?: boolean;
  canChangeScene?: boolean;
  onChangeScene?: () => void;
  scene: HubScene;
}

export function SceneInfo({
  accountId,
  scene,
  showAttributions,
  canChangeScene,
  onChangeScene,
}: SceneInfoProps) {
  const changeSceneButton = canChangeScene && (
    <Button preset="primary" onClick={onChangeScene}>
      {m['room-sidebar.scene-info.change-scene-button']()}
    </Button>
  );

  if (!scene) return changeSceneButton;

  const showSceneLink = accountId
    ? allowDisplayOfSceneLink(accountId, scene)
    : false;
  const attributions: Attribution[] = scene.attributions?.content || [];
  const creator = scene.attributions?.creator || 'unknown';

  const filteredAttributionElements = attributions
    .filter((a) => a.url || a.author)
    .map((attribution, i) => (
      <SceneAttribution attribution={attribution} key={i} />
    ));

  return (
    <>
      <h2 className="text-sm font-bold text-text-secondary my-4 first:mt-0">
        {m['room-sidebar.scene-info.title']()}
      </h2>
      <div className="relative w-full rounded-xl mb-4">
        {scene.screenshot_url &&
          (showSceneLink ? (
            <a href={scene.url} target="_blank" rel="noopener noreferrer">
              <img className="bg-tile rounded-xl" src={scene.screenshot_url} />
            </a>
          ) : (
            <img className="bg-tile rounded-xl" src={scene.screenshot_url} />
          ))}
      </div>
      <div className="mb-4">
        {showSceneLink ? (
          <b className="text-text-secondary">
            <a href={scene.url} target="_blank" rel="noopener noreferrer">
              {scene.name}
            </a>
          </b>
        ) : (
          <b className="text-text-secondary">{scene.name}</b>
        )}
        <div className="mt-1 text-sm text-text-secondary">
          {m['room-sidebar.scene-info.scene-creator']({ creator })}
        </div>
      </div>
      {showAttributions && filteredAttributionElements.length > 0 && (
        <InputField label={m['room-sidebar.scene-info.attributions']()}>
          <ul className="text-sm mt-2 text-text-secondary first:mt-0">
            {filteredAttributionElements}
          </ul>
        </InputField>
      )}
      {changeSceneButton}
    </>
  );
}

export interface RoomSidebarProps {
  room: Hub;
  accountId: string;
  onClose: () => void;
  canEdit: boolean;
  onEdit: () => void;
  onChangeScene: () => void;
}

export function RoomSidebar({
  room,
  accountId,
  onClose,
  canEdit,
  onEdit,
  onChangeScene,
}: RoomSidebarProps) {
  return (
    <Sidebar
      title={m['room-sidebar.title']()}
      beforeTitle={<CloseButton onClick={onClose} />}
      afterTitle={
        canEdit && (
          <IconButton onClick={onEdit}>
            {m['room-sidebar.edit-button']()}
          </IconButton>
        )
      }
    >
      <Column padding>
        <InputField label={m['room-sidebar.room-name']()}>
          {room.name}
        </InputField>
        {room.description && (
          <InputField label={m['room-sidebar.room-description']()}>
            {room.description}
          </InputField>
        )}
        {room.scene && (
          <SceneInfo
            accountId={accountId}
            scene={room.scene}
            showAttributions
            canChangeScene={canEdit}
            onChangeScene={onChangeScene}
          />
        )}
      </Column>
    </Sidebar>
  );
}
