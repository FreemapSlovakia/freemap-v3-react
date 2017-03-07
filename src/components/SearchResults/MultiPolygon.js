import React from 'react';
import { Polygon as LeafletPolygon } from 'react-leaflet';

export default function MultiPolygon({ searchResult, theme }) {

  let polygonsLatLons = [];
  searchResult.geojson.coordinates.forEach( polygonCoords => {
    const polygonLatLons = polygonCoords[0].map(lonlat => {
      return L.latLng(lonlat[1], lonlat[0]);
    });
    polygonsLatLons.push(polygonLatLons);
  });

  let leafletOptions = { fillColor: 'grey', color: 'grey' };
  if  (theme == 'selected') {  
    leafletOptions = { fillColor: 'green', color: 'green' };
  }
  return (
    <div>
    { 
      polygonsLatLons.map(p => {
        return <LeafletPolygon positions={p} {...leafletOptions} />;
      })
    }
    </div>
    
  );
}

MultiPolygon.propTypes = {
  searchResult: React.PropTypes.any,
  theme: React.PropTypes.oneOf([ 'selected', 'highlighted' ])
};