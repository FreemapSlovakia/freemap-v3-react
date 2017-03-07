import React from 'react';
import { Polygon as LeafletPolygon } from 'react-leaflet';

export default function Polygon({ searchResult, theme }) {
  const latlongs = searchResult.geojson.coordinates[0].map(lonlat => L.latLng(lonlat[1], lonlat[0]));

  const color = theme === 'selected' ? 'green' : 'grey';
  const leafletOptions = { fillColor: color, color };

  return <LeafletPolygon positions={latlongs} {...leafletOptions} />;
}

Polygon.propTypes = {
  searchResult: React.PropTypes.any,
  theme: React.PropTypes.oneOf([ 'selected', 'highlighted' ])
};
