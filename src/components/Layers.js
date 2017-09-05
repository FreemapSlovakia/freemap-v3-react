import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TileLayer, LayersControl } from 'react-leaflet';
import { BingLayer } from 'react-leaflet-bing';

import { mapRefocus } from 'fm3/actions/mapActions';
import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';
import * as FmPropTypes from 'fm3/propTypes';

const keyToLayer = { t: 'T', a: 'A', s: 'S', c: 'C', o: 'O', l: 'K' };

class Layers extends React.Component {
  static propTypes = {
    onMapChange: PropTypes.func.isRequired,
    onOverlaysChange: PropTypes.func.isRequired,
    tileFormat: FmPropTypes.tileFormat.isRequired,
    overlays: FmPropTypes.overlays,
    mapType: FmPropTypes.mapType.isRequired,
    overlayOpacity: FmPropTypes.overlayOpacity.isRequired,
    expertMode: PropTypes.bool,
    disableKeyboard: PropTypes.bool,
  };

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
  }

  getTileLayer({ type, url, attribution, minZoom, maxNativeZoom }) {
    if (type === 'S') {
      return (
        <BingLayer
          bingkey="AuoNV1YBdiEnvsK1n4IALvpTePlzMXmn2pnLN5BvH0tdM6GujRxqbSOAYALZZptW"
          onAdd={() => this.handleAdd(type)}
          onRemove={() => this.handleRemove(type)}
          maxZoom={20}
          maxNativeZoom={18}
        />
      );
    }

    return (
      <TileLayer
        attribution={attribution}
        url={url.replace('{tileFormat}', this.props.tileFormat)}
        onAdd={() => this.handleAdd(type)}
        onRemove={() => this.handleRemove(type)}
        maxZoom={20}
        minZoom={minZoom}
        maxNativeZoom={maxNativeZoom}
        opacity={this.props.overlayOpacity[type] || 1.0}
      />
    );
  }

  handleAdd(type) {
    if (baseLayers.some(x => x.type === type)) {
      this.props.onMapChange(type);
    } else {
      const next = new Set(this.props.overlays);
      next.add(type);
      this.props.onOverlaysChange([...next]);
    }
  }

  handleRemove(type) {
    const i = this.props.overlays.indexOf(type);
    if (i !== -1) {
      const next = [...this.props.overlays];
      next.splice(i);
      this.props.onOverlaysChange(next);
    }
  }

  handleKeydown = (event) => {
    if (this.props.disableKeyboard || ['input', 'select', 'textarea'].includes(event.target.tagName.toLowerCase())) {
      return;
    }

    const layer = keyToLayer[event.key];
    if (layer) {
      this.props.onMapChange(layer);
    }
  }

  render() {
    const { overlays, mapType, expertMode } = this.props;

    return (
      <LayersControl position="topright">
        {
          baseLayers.filter(({ showOnlyInExpertMode }) => !showOnlyInExpertMode || expertMode).map((item) => {
            const { type, name } = item;
            return (
              <LayersControl.BaseLayer key={type} name={name} checked={mapType === type}>
                {this.getTileLayer(item)}
              </LayersControl.BaseLayer>
            );
          })
        }
        {
          overlayLayers && overlayLayers.map((item) => {
            const { type, name } = item;
            return (!item.showOnlyInExpertMode || expertMode) && (
              <LayersControl.Overlay key={type} name={name} checked={overlays.indexOf(type) !== -1}>
                {this.getTileLayer(item)}
              </LayersControl.Overlay>
            );
          })
        }
      </LayersControl>
    );
  }
}

export default connect(
  state => ({
    tileFormat: state.map.tileFormat,
    overlays: state.map.overlays,
    mapType: state.map.mapType,
    overlayOpacity: state.map.overlayOpacity,
    expertMode: state.main.expertMode,
    disableKeyboard: !!(state.main.activeModal || state.gallery.activeImageId), // NOTE there can be lot more things
  }),
  (dispatch, props) => ({
    onMapChange(mapType) {
      if (props.mapType !== mapType) {
        dispatch(mapRefocus({ mapType }));
      }
    },
    onOverlaysChange(overlays) {
      dispatch(mapRefocus({ overlays }));
    },
  }),
)(Layers);
