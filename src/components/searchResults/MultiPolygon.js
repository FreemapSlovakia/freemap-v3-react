import React from 'react';
import { Polygon as LeafletPolygon } from 'react-leaflet';
import * as FmPropTypes from 'fm3/propTypes';

export default function MultiPolygon({ searchResult }) {
  const polygonsLatLons = searchResult.geojson.coordinates.map(polygonCoords => polygonCoords[0].map(lonlat => L.latLng(lonlat[1], lonlat[0])));

  return (
    <div>
      {polygonsLatLons.map((p, i) => <LeafletPolygon key={i} positions={p} interactive={false} />)}
    </div>
  );
}

MultiPolygon.propTypes = {
  searchResult: FmPropTypes.searchResult.isRequired,
};
