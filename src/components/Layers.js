import React from 'react';
import { connect } from 'react-redux';
import { TileLayer, LayersControl } from 'react-leaflet';

import { overlayLayers } from 'fm3/mapDefinitions';

class Layers extends React.Component {

  constructor(props) {
    super(props);
    this.state = { baseLayers: this.getBaseLayers(props.tileFormat) };
  }

  componentWillReceiveProps(newProps) {
    this.setState({ baseLayers: this.getBaseLayers(newProps.tileFormat) });
  }

  getBaseLayers(tileFormat) {
    const baseLayers = [ [ 'A', 'Automapa' ], [ 'T', 'Turistická' ], [ 'C', 'Cyklomapa' ], [ 'K', 'Lyžiarska' ] ].map(([ type, name ]) => {
      return {
        name: `${name}`,
        type,
        url: `https://{s}.freemap.sk/${type}/{z}/{x}/{y}.${tileFormat}`,
        attribution: 'prispievatelia © <a href="https://osm.org/copyright">OpenStreetMap</a>',
        minZoom: 7,
        maxZoom: 16
      };
    });

    return baseLayers;
  }

  // eslint-disable-next-line
  getTileLayer({ type, url, attribution, maxZoom, minZoom }) {
    return <TileLayer attribution={attribution} url={url}
      onAdd={() => this.handleAdd(type)}
      onRemove={() => this.handleRemove(type)}
      maxZoom={maxZoom} minZoom={minZoom}/>;
  }

  handleAdd(type) {
    if (this.state.baseLayers.some(x => x.type === type)) {
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
          this.state.baseLayers.map(item => {
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
  tileFormat: React.PropTypes.string.isRequired,
  mapType: React.PropTypes.any.isRequired,
  overlays: React.PropTypes.arrayOf(React.PropTypes.oneOf(overlayLayers.map(x => x.type)))
};

export default connect(
  function (state) {
    return {
      tileFormat: state.map.tileFormat
    };
  },
  function (/*dispatch*/) {
    return {};
  }
)(Layers);
