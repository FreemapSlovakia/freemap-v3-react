import { type RefObject, useEffect, useRef } from 'react';

// When a menu uses submenu navigation (e.g. useMenuHandler's `submenu`), the
// same ScrollArea viewport stays mounted but its children swap. Without help
// the viewport keeps the parent menu's scrollTop when the submenu renders,
// and loses it when the user goes back. This hook:
//   - on submenu change: snapshots the previous submenu's scrollTop
//   - then either restores the new submenu's saved scrollTop, or scrolls to
//     the top if there is no saved value
export function useSubmenuScrollMemory(
  viewportRef: RefObject<HTMLDivElement | null>,
  submenu: string | null,
) {
  const positionsRef = useRef<Record<string, number>>({});
  const prevSubmenuRef = useRef<string | null>(submenu);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const prevKey = prevSubmenuRef.current ?? '__root__';
    positionsRef.current[prevKey] = viewport.scrollTop;

    const newKey = submenu ?? '__root__';
    viewport.scrollTop = positionsRef.current[newKey] ?? 0;

    prevSubmenuRef.current = submenu;
  }, [submenu, viewportRef]);
}
