import { useState, useEffect } from 'react';

export function usePermissions() {
  const [permissions, setPermissions] = useState(
    window.APP.hubChannel?._permissions,
  );

  useEffect(() => {
    const onPermissionsUpdated = () => {
      setPermissions(window.APP.hubChannel?._permissions);
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
  }, [permissions, setPermissions]);

  return {
    ...permissions,
  };
}
