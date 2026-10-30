import { type ReactNode, useEffect, useId } from 'react';
import { Pane, useMap } from 'react-leaflet';

type Props = {
  zIndex: number;
  opacity: number;
  children: ReactNode;
};

/** A preset's own stacking context in `tilePane`, its layers sharing its opacity. */
export function PresetPane({ zIndex, opacity, children }: Props): ReactNode {
  const name = `fm-preset-${useId().replace(/\W/g, '')}`;

  const map = useMap();

  // `Pane` takes its style at creation only; a remount would reload every tile.
  useEffect(() => {
    const pane = map.getPane(name);

    if (pane) {
      pane.style.opacity = String(opacity);

      pane.style.zIndex = String(zIndex);
    }
  }, [map, name, opacity, zIndex]);

  return (
    <Pane name={name} pane="tilePane" style={{ zIndex, opacity }}>
      {children}
    </Pane>
  );
}
