import { useLeafletContext } from '@react-leaflet/core';
import { type ReactNode, useEffect, useId } from 'react';
import { Pane, useMap } from 'react-leaflet';

type Props = {
  zIndex: number;
  opacity: number;
  children: ReactNode;
};

/**
 * A stacking context of its own, its layers sharing its opacity: a preset's in
 * `tilePane`, or a map's of several layers, in its preset's pane when in one.
 */
export function PresetPane({ zIndex, opacity, children }: Props): ReactNode {
  const name = `fm-preset-${useId().replace(/\W/g, '')}`;

  const map = useMap();

  const parent = useLeafletContext().pane ?? 'tilePane';

  // `Pane` takes its style at creation only; a remount would reload every tile.
  useEffect(() => {
    const pane = map.getPane(name);

    if (pane) {
      pane.style.opacity = String(opacity);

      pane.style.zIndex = String(zIndex);
    }
  }, [map, name, opacity, zIndex]);

  return (
    <Pane name={name} pane={parent} style={{ zIndex, opacity }}>
      {children}
    </Pane>
  );
}
