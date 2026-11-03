import { useEffect, useState } from 'react';

/** For a `<Pane>` of the tools' features; the CSS rule fades it with them. */
export const FEATURES_PANE_CLASS = 'fm-features-pane';

/**
 * The ref of a features `<Pane>` with an opacity of its own, which the features'
 * opacity multiplies; a custom property can't go through the Pane's `style`.
 */
export function useOwnPaneOpacity(own: number) {
  const [pane, setPane] = useState<HTMLElement | null>(null);

  useEffect(() => {
    pane?.style.setProperty('--fm-pane-opacity', String(own));
  }, [pane, own]);

  return setPane;
}
