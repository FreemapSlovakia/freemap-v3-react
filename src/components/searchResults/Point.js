import React from 'react';
import { Marker } from 'react-leaflet';
import * as FmPropTypes from 'fm3/propTypes';

export default function Point({ searchResult }) {
  return (
    <Marker
      interactive={false}
      position={L.latLng(searchResult.lat, searchResult.lon)}
    />
  );
}

Point.propTypes = {
  searchResult: FmPropTypes.searchResult.isRequired,
};
