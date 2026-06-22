import type { Permission } from '#/systems/aframe/permissions'

type HubCreatorPermission =
  | 'update_hub'
  | 'update_hub_promotion'
  | 'update_roles'
  | 'close_hub'
  | 'mute_users'
  | 'kick_users'
  | 'amplify_audio'

type ValidPermission = HubCreatorPermission &
  (
    | 'tweet'
    | 'spawn_camera'
    | 'spawn_drawing'
    | 'spawn_and_move_media'
    | 'pin_objects'
    | 'spawn_emoji'
    | 'fly'
    | 'voice_chat'
    | 'text_chat'
  )

export default class HubChannel {
  _permissions: Partial<Record<Permission, any>> = {}
  can(permission: ValidPermission): boolean {
    // if (!VALID_PERMISSIONS.includes(permission))
    //   throw new Error(`Invalid permission name: ${permission}`)
    return this._permissions && this._permissions[permission] ? true : false
  }
  canOrWillIfCreator(permission: Permission) {
    // return !!window.APP.hubChannel?.canOrWillIfCreator(permission);
    return true
  }
}
