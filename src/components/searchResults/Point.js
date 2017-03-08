import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';

export default function Point({ searchResult, theme }) {
  const color = theme === 'selected' ? 'green' : 'grey';
  const iconUrl = require(`fm3/images/marker-icon-${color}.png`);
  const iconRetinaUrl = require(`fm3/images/marker-icon-2x-${color}.png`);

  const icon = new L.Icon({
    iconSize: [ 23, 37 ],
    iconAnchor: [ 10 , 36 ],
    iconUrl,
    iconRetinaUrl
  });

  return (
    <Marker
      position={L.latLng(searchResult.lat, searchResult.lon)}
      icon={icon}>
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
