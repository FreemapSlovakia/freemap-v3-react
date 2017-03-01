import React from 'react';
import { TileLayer, LayersControl } from 'react-leaflet';

import { baseLayers, overlayLayers } from '../mapDefinitions';

export default function Layers({ mapType, onMapChange, onOverlaysChange, overlays }) {

  // eslint-disable-next-line
  function t({ type, url, attribution, maxZoom, minZoom }) {
    return <TileLayer attribution={attribution} url={url}
      onAdd={handleAdd.bind(null, type)}
      onRemove={handleRemove.bind(null, type)}
      maxZoom={maxZoom} minZoom={minZoom}/>;
  }

  function handleAdd(type) {
    if (baseLayers.some(x => x[0] === type)) {
      onMapChange(type);
    } else {
      onOverlaysChange([ ...overlays, type ]);
    }
  }

  function handleRemove(type) {
    if (overlayLayers.some(x => x[0] === type)) {
      const next = [ ...overlays ];
      next.splice(next.indexOf(type));
      onOverlaysChange(next);
    }
  }

  return (
    <LayersControl position="topright">
      {
        baseLayers.map(item => {
          const { type, name } = item;
          return <LayersControl.BaseLayer key={type} name={name} checked={mapType === type}>{t(item)}</LayersControl.BaseLayer>;
        })
      }
      {
        overlayLayers && overlayLayers.map(item => {
          const { type, name } = item;
          return <LayersControl.Overlay key={type} name={name} checked={mapType === type}>{t(item)}</LayersControl.Overlay>;
        })
      }
    </LayersControl>
  );
}

Layers.propTypes = {
  onMapChange: React.PropTypes.func.isRequired,
  onOverlaysChange: React.PropTypes.func.isRequired,
  mapType: React.PropTypes.oneOf(baseLayers.map(x => x[0])).isRequired,
  overlays: React.PropTypes.oneOf([], React.PropTypes.oneOf(overlayLayers.map(x => x[0])))
};
