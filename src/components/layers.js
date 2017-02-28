import React from 'react';
import { TileLayer, LayersControl } from 'react-leaflet';

import mapDefinitions from '../mapDefinitions';

export default function Layers({ mapType, onMapChange }) {
  return (
    <LayersControl position="topright">
      {
        mapDefinitions.map(({ name, type, url, attribution, maxZoom, minZoom }) => (
          <LayersControl.BaseLayer key={type} name={name} checked={mapType === type}>
            <TileLayer attribution={attribution} url={url}
              onAdd={onMapChange.bind(null, type)}
              maxZoom={maxZoom} minZoom={minZoom}/>
          </LayersControl.BaseLayer>
        ))
      }
    </LayersControl>
  );
}

Layers.propTypes = {
  onMapChange: React.PropTypes.func.isRequired,
  mapType: React.PropTypes.oneOf([ 'A', 'T', 'C', 'K' ]).isRequired
};
