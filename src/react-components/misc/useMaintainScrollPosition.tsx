import { useRef, useEffect, useCallback, useState, type UIEvent } from 'react';

export function useMaintainScrollPosition(items: unknown[]) {
  const listRef = useRef<HTMLUListElement>(null);
  const [scrolledToBottom, setScrolledToBottom] = useState(true);

  const onScrollList = useCallback(
    (e: UIEvent<HTMLUListElement>) => {
      const el = e.target;
      if (!(el instanceof HTMLElement)) return;
      setScrolledToBottom(el.scrollHeight - el.scrollTop === el.clientHeight);
    },
    [setScrolledToBottom],
  );

  useEffect(() => {
    if (scrolledToBottom) {
      const el = listRef.current;

      if (!el) return;
      if (el.scrollTop !== el.scrollHeight) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }, [items, scrolledToBottom]);

  return [onScrollList, listRef, scrolledToBottom];
}
