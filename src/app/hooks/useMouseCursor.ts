import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useEffect, useState } from 'react';
import { mouseCursorSelector } from '../store/selectors.js';

// TODO handle also dropdown menus (.dropdown-menu.show)

export function useMouseCursor(element?: HTMLElement): void {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const mo = new MutationObserver(() => {
      setOpen(document.querySelector('*[aria-expanded=true]') !== null);
    });

    mo.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['aria-expanded'],
    });

    return () => {
      mo.disconnect();
    };
  }, []);

  const mouseCursor = useAppSelector(mouseCursorSelector);

  useEffect(() => {
    const style = element?.style;

    if (style) {
      style.cursor = open ? 'default' : mouseCursor;
    }
  }, [element, mouseCursor, open]);
}
