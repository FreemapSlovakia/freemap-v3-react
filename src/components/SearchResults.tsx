import { Feature } from '@turf/helpers';
import { searchSelectResult } from 'fm3/actions/searchActions';
import { LatLng, marker } from 'leaflet';
import { ReactElement } from 'react';
import { GeoJSON } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { MarkerIcon, markerIconOptions, MarkerLeafletIcon } from './RichMarker';

const pointToLayer = (_: Feature, latLng: LatLng) =>
  marker(latLng, {
    icon: new MarkerLeafletIcon({
      ...markerIconOptions,
      icon: <MarkerIcon />,
    }),
  });

export function SearchResults(): ReactElement | null {
  const selectedResult = useSelector((state) => state.search.selectedResult);

  const dispatch = useDispatch();

  return !selectedResult ? null : (
    <GeoJSON
      interactive={!!selectedResult.tags}
      key={selectedResult.id}
      data={selectedResult.geojson}
      style={{ weight: 5 }}
      pointToLayer={pointToLayer}
      eventHandlers={{
        click() {
          dispatch(searchSelectResult(selectedResult));
        },
      }}
    />
  );
}
