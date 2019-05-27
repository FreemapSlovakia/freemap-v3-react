import React from 'react';
import RichMarker from 'fm3/components/RichMarker';
import * as FmPropTypes from 'fm3/propTypes';

export default function MultiPoint({ searchResult }) {
  return searchResult.geojson.coordinates
    .map(lonlat => L.latLng(lonlat[1], lonlat[0]))
    .map((p, i) => (
      <RichMarker key={`j7dH36snGH-${i}`} interactive={false} position={p} />
    ));
}

MultiPoint.propTypes = {
  searchResult: FmPropTypes.searchResult.isRequired,
};
