import React from 'react';
import { Polygon as LeafletPolygon } from 'react-leaflet';

export default function MultiPolygon({ searchResult, theme }) {
  const polygonsLatLons = searchResult.geojson.coordinates
    .map(polygonCoords => polygonCoords[0].map(lonlat => L.latLng(lonlat[1], lonlat[0])));

  const color = theme === 'selected' ? 'green' : 'grey';
  const leafletOptions = { fillColor: color, color };
  
  return <div>{polygonsLatLons.map(p => <LeafletPolygon positions={p} {...leafletOptions} />)}</div>;
}

MultiPolygon.propTypes = {
  searchResult: React.PropTypes.any,
  theme: React.PropTypes.oneOf([ 'selected', 'highlighted' ])
};
