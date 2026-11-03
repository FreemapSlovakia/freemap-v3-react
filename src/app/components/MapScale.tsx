import { useMap } from '@features/map/hooks/useMap.js';
import { Control } from 'leaflet';
import { type ReactElement, useEffect, useState } from 'react';

/**
 * Leaflet's scale, mounted in the bottom bar rather than in a map corner, so
 * the map toolbar wraps around it instead of covering it.
 */
export function MapScale({ className }: { className?: string }): ReactElement {
  const map = useMap();

  const [host, setHost] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!map || !host) {
      return;
    }

    // `maxWidth` is the width `.scale` reserves in Main.module.css.
    const control = new Control.Scale({
      imperial: false,
      maxWidth: 100,
    }).addTo(map);

    // Out of Leaflet's corner; `remove` takes it from wherever it is.
    const container = control.getContainer();

    if (container) {
      host.append(container);
    }

    return () => {
      control.remove();
    };
  }, [map, host]);

  return <div ref={setHost} className={className} />;
}
