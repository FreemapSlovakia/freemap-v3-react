import type { LatLng } from 'leaflet';
import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';

/**
 * Fired for every way the view can change under a fixed screen position: a pan
 * ({@link https://leafletjs.com/reference.html#map-move move}), the end of an
 * animated zoom (which suppresses `move` for its whole duration), and a
 * container resize.
 */
const EVENTS = 'move zoomend viewreset resize';

/**
 * The point the middle of the screen is over, refreshed as the map moves.
 *
 * Read from Leaflet rather than from `state.map`, which only records the centre
 * once a gesture settles — anything anchored to the middle of the screen has to
 * follow the pan itself, or it would lag a whole drag behind.
 *
 * A fresh object is handed out on every event even when the centre has not
 * moved, deliberately: a zoom about the middle of the screen leaves it where it
 * was while changing where everything else sits relative to it, so a caller
 * measuring in pixels has to re-measure and would otherwise never be asked to.
 *
 * Only mount components that call this while they need it: `move` fires once
 * per animation frame of a drag, so this re-renders its caller at frame rate.
 */
export function useMapCenter(): LatLng {
  const map = useMap();

  const [center, setCenter] = useState(() => map.getCenter());

  useEffect(() => {
    const handleMove = () => {
      setCenter(map.getCenter());
    };

    // The map can have moved between the initial render and this subscription.
    handleMove();

    map.on(EVENTS, handleMove);

    return () => {
      map.off(EVENTS, handleMove);
    };
  }, [map]);

  return center;
}
