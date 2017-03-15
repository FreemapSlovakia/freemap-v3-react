import React from 'react';
import { connect } from 'react-redux';
import { TileLayer, LayersControl } from 'react-leaflet';

import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';

function Layers(props) {

  // eslint-disable-next-line
  function getTileLayer({ type, url, attribution, maxZoom, minZoom }) {
    return <TileLayer
      attribution={attribution}
      url={url.replace('{tileFormat}', props.tileFormat)}
      onAdd={() => handleAdd(type)}
      onRemove={() => handleRemove(type)}
      maxZoom={maxZoom} minZoom={minZoom}/>;
  }

  function handleAdd(type) {
    if (baseLayers.some(x => x.type === type)) {
      props.onMapChange(type);
    } else {
      const next = new Set(props.overlays);
      next.add(type);
      props.onOverlaysChange([ ...next ]);
    }
  }

  function handleRemove(type) {
    if (overlayLayers.some(x => x.type === type)) {
      const next = [ ...props.overlays ];
      next.splice(next.indexOf(type));
      props.onOverlaysChange(next);
    }
  }

  return (
    <LayersControl position="topright">
      {
        baseLayers.map(item => {
          const { type, name } = item;
          return <LayersControl.BaseLayer key={type} name={name} checked={props.mapType === type}>{getTileLayer(item)}</LayersControl.BaseLayer>;
        })
      }
      {
        overlayLayers && overlayLayers.map(item => {
          const { type, name } = item;
          return <LayersControl.Overlay key={type} name={name} checked={props.overlays.indexOf(type) !== -1}>{getTileLayer(item)}</LayersControl.Overlay>;
        })
      }
    </LayersControl>
  );

}

Layers.propTypes = {
  onMapChange: React.PropTypes.func.isRequired,
  onOverlaysChange: React.PropTypes.func.isRequired,
  tileFormat: React.PropTypes.oneOf([ 'jpeg', 'png' ]).isRequired,
  mapType: React.PropTypes.oneOf(baseLayers.map(({ type }) => type)).isRequired,
  overlays: React.PropTypes.arrayOf(React.PropTypes.oneOf(overlayLayers.map(({ type }) => type)))
};

export default connect(
  function (state) {
    return {
      tileFormat: state.map.tileFormat
    };
  }
)(Layers);
