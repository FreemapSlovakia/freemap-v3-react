import { useMouseCursor } from '@app/hooks/useMouseCursor.js';
import { setMapLeafletElement } from '@features/map/hooks/leafletElementHolder.js';
import { useMap } from '@features/map/hooks/useMap.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import 'leaflet/dist/leaflet.css';
import { ReactElement, ReactNode } from 'react';
import { MapContainer, ScaleControl } from 'react-leaflet';
import './leaflet.scss';

type Props = {
  children: ReactNode;
};

export function Map({ children }: Props): ReactElement {
  const lat = useAppSelector((state) => state.map.lat);

  const lon = useAppSelector((state) => state.map.lon);

  const zoom = useAppSelector((state) => state.map.zoom);

  const map = useMap();

  useMouseCursor(map?.getContainer());

  const maxZoom = useAppSelector((state) => state.map.maxZoom);

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

      {children}
    </MapContainer>
  );
}
