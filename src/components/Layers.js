import React from 'react';
import { TileLayer, LayersControl } from 'react-leaflet';

import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';

export default function Layers({ mapType, onMapChange, onOverlaysChange, overlays }) {

  // eslint-disable-next-line
  function getTileLayer({ type, url, attribution, maxZoom, minZoom }) {
    return <TileLayer attribution={attribution} url={url}
      onAdd={handleAdd.bind(null, type)}
      onRemove={handleRemove.bind(null, type)}
      maxZoom={maxZoom} minZoom={minZoom}/>;
  }

  function handleAdd(type) {
    if (baseLayers.some(x => x.type === type)) {
      onMapChange(type);
    } else {
      const next = new Set(overlays);
      next.add(type);
      onOverlaysChange([ ...next ]);
    }
  }

  function handleRemove(type) {
    if (overlayLayers.some(x => x.type === type)) {
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
          return <LayersControl.BaseLayer key={type} name={name} checked={mapType === type}>{getTileLayer(item)}</LayersControl.BaseLayer>;
        })
      }
      {
        overlayLayers && overlayLayers.map(item => {
          const { type, name } = item;
          return <LayersControl.Overlay key={type} name={name} checked={overlays.indexOf(type) !== -1}>{getTileLayer(item)}</LayersControl.Overlay>;
        })
      }
    </LayersControl>
  );
}

Layers.propTypes = {
  onMapChange: React.PropTypes.func.isRequired,
  onOverlaysChange: React.PropTypes.func.isRequired,
  mapType: React.PropTypes.oneOf(baseLayers.map(x => x.type)).isRequired,
  overlays: React.PropTypes.arrayOf(React.PropTypes.oneOf(overlayLayers.map(x => x.type)))
};
