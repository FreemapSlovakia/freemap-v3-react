import React from 'react';
import RichMarker from 'fm3/components/RichMarker';
import * as FmPropTypes from 'fm3/propTypes';

export default function Point({ searchResult }) {
  return (
    <RichMarker
      interactive={false}
      position={L.latLng(searchResult.lat, searchResult.lon)}
    />
  );
}

Point.propTypes = {
  searchResult: FmPropTypes.searchResult.isRequired,
};
