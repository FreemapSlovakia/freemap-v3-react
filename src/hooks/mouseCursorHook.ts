import { mouseCursorSelector } from 'fm3/selectors/mainSelectors';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export function useMouseCursor(element?: HTMLElement): void {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const mo = new MutationObserver(() => {
      setOpen(
        document.querySelector('*[data-popper-reference-hidden=false]') !==
          null,
      );
    });

    mo.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-popper-reference-hidden'],
    });

    return () => {
      mo.disconnect();
    };
  }, []);

  const mouseCursor = useSelector(mouseCursorSelector);

  useEffect(() => {
    const style = element?.style;

    if (style) {
      style.cursor = open ? 'default' : mouseCursor;
    }
  }, [element, mouseCursor, open]);
}
