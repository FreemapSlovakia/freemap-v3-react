import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';

export default function Point({ searchResult, theme }) {

  let iconUrl = require('fm3/images/marker-icon-grey.png');
  let iconRetinaUrl = require('fm3/images/marker-icon-2x-grey.png');

  if (theme === 'selected') {
    iconUrl = require('fm3/images/marker-icon-green.png');
    iconRetinaUrl = require('fm3/images/marker-icon-2x-green.png');
  } 

  const icon = new L.Icon({
      iconSize: [ 23, 37 ],
      iconAnchor: [ 10 , 36 ],
      iconUrl,
      iconRetinaUrl
  });
  const tooltipContent = `${searchResult.tags.name} (${searchResult.tags.type})` ;

  return (
    <Marker
      position={L.latLng(searchResult.lat, searchResult.lon)}
      icon={icon}>
        <Tooltip opacity={1.0} offset={[ 14, -20 ]} direction="right">
          <span dangerouslySetInnerHTML={{ __html: tooltipContent }}/>
        </Tooltip>
    </Marker>
  );
}

Point.propTypes = {
  searchResult: React.PropTypes.any,
  theme: React.PropTypes.oneOf([ 'selected', 'highlighted' ])
};