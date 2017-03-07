import React from 'react';
import { Polygon as LeafletPolygon } from 'react-leaflet';

export default function Polygon({ searchResult, theme }) {

  const rawLatLons = searchResult.geojson.coordinates[0];
  const latlongs = rawLatLons.map( latlon => {
    return L.latLng(latlon[1], latlon[0]);
  });

  let leafletOptions = { fillColor: 'grey', color: 'grey' };
  if  (theme == 'selected') {  
    leafletOptions = { fillColor: 'green', color: 'green' };
  }
  return (
    <LeafletPolygon positions={latlongs} {...leafletOptions} />
  );
}

Polygon.propTypes = {
  searchResult: React.PropTypes.any,
  theme: React.PropTypes.oneOf([ 'selected', 'highlighted' ])
};