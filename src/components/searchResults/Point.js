import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';

export default function Point({ searchResult }) {

  return (
    <Marker
      interactive={false}
      position={L.latLng(searchResult.lat, searchResult.lon)}>
        <Tooltip opacity={1.0} offset={[ 14, -20 ]} direction="right">
          <span dangerouslySetInnerHTML={{ __html: `${searchResult.tags.name} (${searchResult.tags.type})` }}/>
        </Tooltip>
    </Marker>
  );
}

Point.propTypes = {
  searchResult: React.PropTypes.any,
  theme: React.PropTypes.oneOf([ 'selected', 'highlighted' ])
};
