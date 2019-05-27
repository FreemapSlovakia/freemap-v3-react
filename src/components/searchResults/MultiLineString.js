import React from 'react';
import { Polyline } from 'react-leaflet';
import * as FmPropTypes from 'fm3/propTypes';

export default function MultiLineString({ searchResult }) {
  return searchResult.geojson.coordinates
    .map(polylineCoords =>
      polylineCoords.map(lonlat => L.latLng(lonlat[1], lonlat[0])),
    )
    .map((p, i) => (
      <Polyline key={`xzlyQ3rC1m-${i}`} positions={p} interactive={false} />
    ));
}

MultiLineString.propTypes = {
  searchResult: FmPropTypes.searchResult.isRequired,
};
