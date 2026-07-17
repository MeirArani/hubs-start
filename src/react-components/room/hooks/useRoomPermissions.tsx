import { useState, useEffect } from 'react';

export function useRoomPermissions() {
  const [roomPermissions, setRoomPermissions] = useState(
    window.APP.hub?.member_permissions,
  );

  useEffect(() => {
    const onPermissionsUpdated = () => {
      setRoomPermissions(window.APP.hub?.member_permissions);
    };
    window.APP.hubChannel?.addEventListener(
      'permissions_updated',
      onPermissionsUpdated,
    );

    return () => {
      window.APP.hubChannel?.removeEventListener(
        'permissions_updated',
        onPermissionsUpdated,
      );
    };
  }, [roomPermissions, setRoomPermissions]);

  return {
    ...roomPermissions,
  };
}
