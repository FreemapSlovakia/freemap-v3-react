import React from 'react';
import { Polyline } from 'react-leaflet';

export default function MultiLineString({ searchResult }) {

  const polylinesLatLons = searchResult.geojson.coordinates
    .map(polylineCoords => polylineCoords.map(lonlat => L.latLng(lonlat[1], lonlat[0])));

  return <div>{polylinesLatLons.map((p, i) => <Polyline key={i} positions={p} interactive={false}/>)}</div>;
}

MultiLineString.propTypes = {
  searchResult: React.PropTypes.any
};
