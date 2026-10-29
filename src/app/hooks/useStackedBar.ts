import { useEffect, useState } from 'react';

/**
 * The width plus the named margins: an `auto` margin is left out, as it reads
 * as whatever room it takes up on its line.
 */
function outerWidth(
  el: Element | null | undefined,
  margins: ('marginLeft' | 'marginRight')[],
) {
  if (!(el instanceof HTMLElement)) {
    return 0;
  }

  const style = getComputedStyle(el);

  return margins.reduce(
    (width, side) => width + Number.parseFloat(style[side]),
    el.offsetWidth,
  );
}

/**
 * How the bottom bar's scale, map toolbar and credits share its width: on one
 * line, with the scale gone up a line, or with the toolbar alone at the bottom.
 * Measured rather than left to wrapping, which would give each its own line.
 */
export type BarLayout = 'line' | 'scale-up' | 'stacked';

export function useStackedBar(): [
  (el: HTMLDivElement | null) => void,
  BarLayout,
] {
  const [bar, setBar] = useState<HTMLDivElement | null>(null);

  const [layout, setLayout] = useState<BarLayout>('line');

  useEffect(() => {
    if (!bar) {
      return;
    }

    const [scale, controls, credits] = bar.children;

    // Main.module.css: the scale's right margin and the credits' left are auto.
    const update = () => {
      // The toolbar's own width, not the stretched box it sits in; it mounts
      // with the map.
      const toolbar = controls?.querySelector('.fm-toolbar');

      const rest =
        outerWidth(toolbar, ['marginLeft', 'marginRight']) +
        outerWidth(credits, []);

      const width = bar.clientWidth;

      setLayout(
        outerWidth(scale, ['marginLeft']) + rest <= width
          ? 'line'
          : rest <= width
            ? 'scale-up'
            : 'stacked',
      );
    };

    const observer = new ResizeObserver(update);

    observer.observe(bar);

    // The toolbar changes width with the maps on it; observed through the
    // scroller, which shrink-wraps it.
    const scroller = controls?.firstElementChild;

    if (scroller) {
      observer.observe(scroller);
    }

    return () => {
      observer.disconnect();
    };
  }, [bar]);

  return [setBar, layout];
}
