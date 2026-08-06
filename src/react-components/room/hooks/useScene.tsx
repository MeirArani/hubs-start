import type { Scene } from 'aframe';
import { useEffect, useState } from 'react';

export function UseScene() {
  const [observer, setObserver] = useState<MutationObserver | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);

  const removeObserver = () => {
    if (observer) {
      observer.disconnect();
      setObserver(null);
    }
  };

  useEffect(() => {
    const scene = document.querySelector<Scene>('a-scene');
    if (scene) {
      setScene(scene);
      return;
    }
    setObserver(
      new MutationObserver(() => {
        const scene = document.querySelector<Scene>('a-scene');
        if (scene) {
          removeObserver();
          setScene(scene);
        }
      }),
    );
    observer?.observe(document, { subtree: true, childList: true });

    return () => {
      removeObserver();
    };
  }, []);

  return [scene, setScene] as const;
}
