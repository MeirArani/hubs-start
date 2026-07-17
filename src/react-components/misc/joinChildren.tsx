import { Children, type ReactNode } from 'react';

export function joinChildren(children: ReactNode, renderSeparator: () => void) {
  // HACK
  const result = (Children.toArray(children) as ReactNode[]).reduce(
    (acc, child) =>
      acc === null ? (
        child
      ) : (
        <>
          {acc}
          {renderSeparator()}
          {child}
        </>
      ),
    null,
  );

  return result;
}
