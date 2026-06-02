import { useMouseCursor } from '@app/hooks/useMouseCursor.js';
import { pickingModeSelector } from '@app/store/selectors.js';
import { setMapLeafletElement } from '@features/map/hooks/leafletElementHolder.js';
import { useMap } from '@features/map/hooks/useMap.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import 'leaflet/dist/leaflet.css';
import { ReactElement, ReactNode, useEffect } from 'react';
import { MapContainer, Pane, ScaleControl } from 'react-leaflet';
import './leaflet.css';

type Props = {
  children: ReactNode;
};

export function TheMap({ children }: Props): ReactElement {
  const lat = useAppSelector((state) => state.map.lat);

  const lon = useAppSelector((state) => state.map.lon);

  const zoom = useAppSelector((state) => state.map.zoom);

  const map = useMap();

  useMouseCursor(map?.getContainer());

  const maxZoom = useAppSelector((state) => state.map.maxZoom);

  // While a dedicated map mode is active (picking a home/photo location, showing
  // a photo location, or drawing an export/cache rectangle), all other map
  // features stay visible but become non-interactive (see leaflet.css) so clicks
  // reach the map and don't hijack the mode.
  const featuresNonInteractive = useAppSelector(pickingModeSelector);

  useEffect(() => {
    map
      ?.getContainer()
      .classList.toggle('fm-features-noninteractive', featuresNonInteractive);
  }, [map, featuresNonInteractive]);

  return (
    <MapContainer
      zoomControl={false}
      attributionControl={false}
      maxZoom={maxZoom}
      key={maxZoom}
      ref={setMapLeafletElement}
      center={{ lat, lng: lon }}
      zoom={zoom}
      wheelPxPerZoomLevel={100}
    >
      <ScaleControl imperial={false} position="bottomleft" />

      {/* Holds the interactive handles of the active selection mode (export/cache
          rectangle, photo-location marker); exempt from fm-features-noninteractive
          so it stays grabbable while everything else is click-through. */}
      <Pane name="fm-active-overlay" style={{ zIndex: 800 }} />

      {children}
    </MapContainer>
  );
}
