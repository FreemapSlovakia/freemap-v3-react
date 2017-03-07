import React from 'react';
import { Polyline as LeafletPolyline } from 'react-leaflet';

export default function Polyline({ searchResult, theme }) {
  const latlongs = searchResult.geojson.coordinates.map(latlon => L.latLng(latlon[1], latlon[0]));

  const color = theme === 'selected' ? 'green' : 'grey';
  const leafletOptions = { fillColor: color, color, weight: 8 };

  return <LeafletPolyline positions={latlongs} {...leafletOptions} />;
}

Polyline.propTypes = {
  searchResult: React.PropTypes.any,
  theme: React.PropTypes.oneOf([ 'selected', 'highlighted' ])
};
