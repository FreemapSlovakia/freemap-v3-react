import React from 'react';
import { Polyline } from 'react-leaflet';

export default function MultiLineString({ searchResult, theme }) {

  const polylinesLatLons = searchResult.geojson.coordinates
    .map(polylineCoords => polylineCoords.map(lonlat => L.latLng(lonlat[1], lonlat[0])));

  const color = theme === 'selected' ? 'green' : 'grey';
  const leafletOptions = { fillColor: color, color };

  return <div>{polylinesLatLons.map((p, i) => <Polyline key={i} positions={p} interactive={false} {...leafletOptions}/>)}</div>;
}

MultiLineString.propTypes = {
  searchResult: React.PropTypes.any,
  theme: React.PropTypes.oneOf([ 'selected', 'highlighted' ])
};
