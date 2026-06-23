import { useCallback, useRef } from 'react';

const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

export function useScrollClasses(
  direction: 'horizontal' | 'vertical',
): (e: HTMLDivElement | null) => void {
  const ref = useRef<HTMLDivElement | null>(null);

  const lastKnownScrollPositionRef = useRef(0);

  const tickingRef = useRef(false);

  const handleScroll = useCallback(
    (el: unknown) => {
      if (el instanceof HTMLDivElement) {
        lastKnownScrollPositionRef.current =
          direction === 'horizontal' ? el.scrollLeft : el.scrollTop;

        if (!tickingRef.current) {
          window.requestAnimationFrame(() => {
            const scrollPosition = lastKnownScrollPositionRef.current;

            el.classList.toggle(
              direction === 'horizontal' ? 'scroll-left' : 'scroll-top',
              scrollPosition > (direction === 'horizontal' ? rem / 2 : 0),
            );

            el.classList.toggle(
              direction === 'horizontal' ? 'scroll-right' : 'scroll-bottom',
              scrollPosition + 1 <
                (direction === 'horizontal'
                  ? el.scrollWidth - el.clientWidth - rem / 2
                  : el.scrollHeight - el.clientHeight),
            );

            tickingRef.current = false;
          });

          tickingRef.current = true;
        }
      }
    },
    [direction],
  );

  const handleScrollEvent = useCallback(
    (e: Event) => {
      const el = e.currentTarget;

      handleScroll(el);
    },
    [handleScroll],
  );

  // Created on first observe so callers that never attach the ref (the common
  // case) don't allocate one. A bare `useRef(new ResizeObserver(…))` would
  // construct and discard one on every render.
  const resizeObserver = useRef<ResizeObserver | undefined>(undefined);

  const refSetter = useCallback(
    (e: HTMLDivElement | null) => {
      if (ref.current) {
        ref.current.removeEventListener('scroll', handleScrollEvent);
      }

      if (e?.scrollTo) {
        e.scrollTo(0, 0);

        lastKnownScrollPositionRef.current = 0; // e.scrollLeft;

        e.addEventListener('scroll', handleScrollEvent);

        handleScroll(e);

        if (!resizeObserver.current && window.ResizeObserver) {
          resizeObserver.current = new ResizeObserver((entries) => {
            for (const entry of entries) {
              handleScroll(entry.target);
            }
          });
        }

        resizeObserver.current?.observe(e);
      } else if (e) {
        console.warn('Unscrollable element: ' + e);
      } else {
        resizeObserver.current?.disconnect();
      }

      ref.current = e;
    },
    [handleScrollEvent, handleScroll],
  );

  return refSetter;
}
