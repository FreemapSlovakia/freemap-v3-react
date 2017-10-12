import React from 'react';
import { Polygon as LeafletPolygon } from 'react-leaflet';
import * as FmPropTypes from 'fm3/propTypes';

export default function MultiPolygon({ searchResult }) {
  return searchResult.geojson.coordinates
    .map(polygonCoords => polygonCoords[0].map(lonlat => L.latLng(lonlat[1], lonlat[0])))
    .map((p, i) => <LeafletPolygon key={`EFEEQcSHw1-${i}`} positions={p} interactive={false} />);
}

MultiPolygon.propTypes = {
  searchResult: FmPropTypes.searchResult.isRequired,
};
