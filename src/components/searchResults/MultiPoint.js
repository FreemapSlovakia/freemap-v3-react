import React from 'react';
import RichMarker from 'fm3/components/leaflet/RichMarker';
import * as FmPropTypes from 'fm3/propTypes';

export default function MultiPoint({ searchResult }) {
  const markersLatLons = searchResult.geojson.coordinates.map(lonlat => L.latLng(lonlat[1], lonlat[0]));
  return (
    <div>
      {markersLatLons.map((p, i) => <RichMarker key={i} interactive={false} position={p} />)}
    </div>
  );
}

MultiPoint.propTypes = {
  searchResult: FmPropTypes.searchResult.isRequired,
};
