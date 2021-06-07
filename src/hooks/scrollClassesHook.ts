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

  const resizeObserver = useRef(
    window.ResizeObserver
      ? new ResizeObserver((entries) => {
          for (const entry of entries) {
            handleScroll(entry.target);
          }
        })
      : undefined,
  );

  const refSetter = useCallback(
    (e: HTMLDivElement | null) => {
      if (ref.current) {
        ref.current.removeEventListener('scroll', handleScrollEvent);
      }

      if (e) {
        e.scrollTo(0, 0);

        lastKnownScrollPositionRef.current = 0; // e.scrollLeft;

        e.addEventListener('scroll', handleScrollEvent);

        handleScroll(e);

        resizeObserver.current?.observe(e);
      } else {
        resizeObserver.current?.disconnect();
      }

      ref.current = e;
    },
    [handleScrollEvent, handleScroll],
  );

  return refSetter;
}
