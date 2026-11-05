import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import clsx from 'clsx';
import {
  type ReactElement,
  type ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
} from 'react';
import classes from './HorizontalScroller.module.css';

type Props = {
  /**
   * Scrolled to the end whenever the row widens, for one ending in the current
   * thing. The row must size to its content (`d-inline-flex`) to be seen widening.
   */
  toEnd?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * A row that scrolls sideways rather than wrapping, with the toolbars' fades on
 * a scrolled side. Full width of a panel body: it reaches over the body's
 * padding, so the content inside insets itself (`px-3`).
 */
export function HorizontalScroller({
  toEnd = false,
  className,
  children,
}: Props): ReactElement {
  const sc = useScrollClasses('horizontal');

  const ref = useRef<HTMLDivElement | null>(null);

  // On the row widening only — a new level, a name or glyph arriving — so a
  // re-render leaves a row the user scrolled back alone.
  useLayoutEffect(() => {
    const el = ref.current;

    if (!toEnd || !el) {
      return;
    }

    const observer = new ResizeObserver(() => {
      el.scrollLeft = el.scrollWidth;
    });

    for (const child of el.children) {
      observer.observe(child);
    }

    return () => observer.disconnect();
  }, [toEnd]);

  // Stable: the scroll hook scrolls back to the start on every attach.
  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      ref.current = el;

      sc(el);
    },
    [sc],
  );

  return (
    <div className={clsx('position-relative mx-n3', className)}>
      <div className={clsx('fm-ib-scroller', classes.scroller)} ref={setRef}>
        {/* The end fade's anchor; see the shared `.fm-ib-scroller` styles. */}
        <div />

        {children}
      </div>
    </div>
  );
}
