import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useEffect } from 'react';
import { mouseCursorSelector } from '../store/selectors.js';

// TODO handle also dropdown menus (.dropdown-menu.show)

export function useMouseCursor(element?: HTMLElement): void {
  const mouseCursor = useAppSelector(mouseCursorSelector);

  useEffect(() => {
    const style = element?.style;

    if (!style) {
      return;
    }

    // The cursor is written straight to the element rather than kept in state.
    // What the observer answers is DOM mutations, and rendering is one, so a
    // state update made from here can produce the very mutation that runs it
    // again — a loop React ends by throwing once it has nested far enough.
    // Nothing renders from the flag anyway; the cursor is all it ever set.
    const apply = () => {
      style.cursor = document.querySelector('*[aria-expanded=true]')
        ? 'default'
        : mouseCursor;
    };

    apply();

    const mo = new MutationObserver(apply);

    mo.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['aria-expanded'],
    });

    return () => {
      mo.disconnect();
    };
  }, [element, mouseCursor]);
}
