import type { ReactNode } from 'react';

export function TestCopyGuard({ children }: { children: ReactNode }) {
  return <div className="test-copy-guard stack"
    onCopy={event => event.preventDefault()}
    onCut={event => event.preventDefault()}
    onContextMenu={event => event.preventDefault()}
    onDragStart={event => event.preventDefault()}>
    {children}
  </div>;
}
