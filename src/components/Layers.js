import React from 'react';
import { connect } from 'react-redux';
import { TileLayer, LayersControl } from 'react-leaflet';

import { overlayLayers } from 'fm3/mapDefinitions';

class Layers extends React.Component {

  // eslint-disable-next-line
  getTileLayer({ type, url, attribution, maxZoom, minZoom }) {
    return <TileLayer attribution={attribution} url={url}
      onAdd={() => this.handleAdd(type)}
      onRemove={() => this.handleRemove(type)}
      maxZoom={maxZoom} minZoom={minZoom}/>;
  }

  handleAdd(type) {
    if (this.props.baseLayers.some(x => x.type === type)) {
      this.props.onMapChange(type);
    } else {
      const next = new Set(this.props.overlays);
      next.add(type);
      this.props.onOverlaysChange([ ...next ]);
    }
  }

  handleRemove(type) {
    if (overlayLayers.some(x => x.type === type)) {
      const next = [ ...this.props.overlays ];
      next.splice(next.indexOf(type));
      this.props.onOverlaysChange(next);
    }
  }

  render() {
    return (
      <LayersControl position="topright">
        {
          this.props.baseLayers.map(item => {
            const { type, name } = item;
            return <LayersControl.BaseLayer key={type} name={name} checked={this.props.mapType === type}>{this.getTileLayer(item)}</LayersControl.BaseLayer>;
          })
        }
        {
          overlayLayers && overlayLayers.map(item => {
            const { type, name } = item;
            return <LayersControl.Overlay key={type} name={name} checked={this.props.overlays.indexOf(type) !== -1}>{this.getTileLayer(item)}</LayersControl.Overlay>;
          })
        }
      </LayersControl>
    );
  }
}

Layers.propTypes = {
  onMapChange: React.PropTypes.func.isRequired,
  onOverlaysChange: React.PropTypes.func.isRequired,
  baseLayers: React.PropTypes.any.isRequired,
  mapType: React.PropTypes.any.isRequired,
  overlays: React.PropTypes.arrayOf(React.PropTypes.oneOf(overlayLayers.map(x => x.type)))
};

export default connect(
  function (state) {
    return {
      baseLayers: state.map.baseLayers
    };
  },
  function (dispatch) {
    return {
    };
  }
)(Layers);
