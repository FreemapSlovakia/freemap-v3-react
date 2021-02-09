import { RootState } from 'fm3/storeCreator';
import { Feature } from 'geojson';
import { LatLng, marker } from 'leaflet';
import { ReactElement } from 'react';
import { GeoJSON } from 'react-leaflet';
import { useSelector } from 'react-redux';
import { MarkerIcon, markerIconOptions, MarkerLeafletIcon } from './RichMarker';

const pointToLayer = (_: Feature, latLng: LatLng) =>
  marker(latLng, {
    icon: new MarkerLeafletIcon({
      ...markerIconOptions,
      icon: <MarkerIcon />,
    }),
  });

export function SearchResults(): ReactElement | null {
  const selectedResult = useSelector(
    (state: RootState) => state.search.selectedResult,
  );

  return !selectedResult ? null : (
    <GeoJSON
      interactive={false}
      key={selectedResult.id}
      data={selectedResult.geojson}
      style={{ weight: 5 }}
      pointToLayer={pointToLayer}
    />
  );
}
