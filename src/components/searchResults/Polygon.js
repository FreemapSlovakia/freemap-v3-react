import React from 'react';
import { Polygon as LeafletPolygon } from 'react-leaflet';
import * as FmPropTypes from 'fm3/propTypes';

export default function Polygon({ searchResult }) {
  const positions = searchResult.geojson.coordinates[0]
    .map(lonlat => L.latLng(lonlat[1], lonlat[0]));

  return <LeafletPolygon positions={positions} interactive={false} />;
}

Polygon.propTypes = {
  searchResult: FmPropTypes.searchResult.isRequired,
};
