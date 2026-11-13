import {
  isUrlUpdatingEnabled,
  setUrlUpdatingEnabled,
} from '@app/url/urlUpdating.js';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

type DragCommit<T> = {
  change: (value: T) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
};

/**
 * A colour picker's changes, with history writes suspended for a pointer drag
 * so its stream of values lands as one entry (Safari caps pushState at
 * 100/10s). Stable, as the picker re-attaches its window listener on a change.
 */
export function useDragCommit<T>(commit: (value: T) => void): DragCommit<T> {
  const commitRef = useRef(commit);

  // After render, not during it; the handlers only run once it has committed.
  useLayoutEffect(() => {
    commitRef.current = commit;
  });

  const [handlers] = useState(() => {
    let latest: { value: T } | null = null;

    // What the flag was before the drag, as restores and start-up set it too;
    // `null` while no drag is suspending it.
    let before: boolean | null = null;

    const end = (flush: boolean) => {
      if (before === null) {
        return;
      }

      // Restored first so the flush commits one history entry.
      setUrlUpdatingEnabled(before);

      before = null;

      const flushed = latest;

      latest = null;

      if (flush && flushed) {
        commitRef.current(flushed.value);
      }
    };

    return {
      change: (value: T) => {
        latest = { value };

        commitRef.current(value);
      },
      onDragStart: () => {
        latest = null;

        // A second start without an end keeps what the first one found.
        if (before === null) {
          before = isUrlUpdatingEnabled();
        }

        setUrlUpdatingEnabled(false);
      },
      onDragEnd: () => end(true),
      // Unmounted mid-drag: its value was committed as dragged, and what owned
      // it may be gone, so only the flag is put back.
      abandon: () => end(false),
    };
  });

  useEffect(() => handlers.abandon, [handlers]);

  return handlers;
}
