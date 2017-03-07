import React from 'react';
import { Polyline as LeafletPolyline } from 'react-leaflet';

export default function Polyline({ searchResult, theme }) {

  const rawLatLons = searchResult.geojson.coordinates;
  const latlongs = rawLatLons.map( latlon => {
    return L.latLng(latlon[1], latlon[0]);
  });
  let leafletOptions = { fillColor: 'grey', color: 'grey', weight: 8 };
  if  (theme == 'selected') {  
    leafletOptions = { fillColor: 'green', color: 'green', weight: 8 };
  }
  return (
    <LeafletPolyline positions={latlongs} {...leafletOptions} />
  );
}

Polyline.propTypes = {
  searchResult: React.PropTypes.any,
  theme: React.PropTypes.oneOf([ 'selected', 'highlighted' ])
};