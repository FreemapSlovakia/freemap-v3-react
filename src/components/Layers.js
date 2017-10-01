import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TileLayer } from 'react-leaflet';
import { BingLayer } from 'react-leaflet-bing';
import GalleryLayer from 'fm3/components/GalleryLayer';

import { mapRefocus } from 'fm3/actions/mapActions';
import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';
import * as FmPropTypes from 'fm3/propTypes';

class Layers extends React.Component {
  static propTypes = {
    onMapTypeChange: PropTypes.func.isRequired,
    onOverlaysChange: PropTypes.func.isRequired,
    tileFormat: FmPropTypes.tileFormat.isRequired,
    overlays: FmPropTypes.overlays,
    mapType: FmPropTypes.mapType.isRequired,
    overlayOpacity: FmPropTypes.overlayOpacity.isRequired,
    expertMode: PropTypes.bool,
    disableKeyboard: PropTypes.bool,
    galleryDirtySeq: PropTypes.number.isRequired,
    galleryFilter: FmPropTypes.galleryFilter.isRequired,
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
          key="S"
          bingkey="AuoNV1YBdiEnvsK1n4IALvpTePlzMXmn2pnLN5BvH0tdM6GujRxqbSOAYALZZptW"
          maxNativeZoom={maxNativeZoom}
          maxZoom={20}
        />
      );
    }

    if (type === 'I') {
      const { galleryFilter, galleryDirtySeq } = this.props;
      return (
        <GalleryLayer
          key={`I-${galleryDirtySeq}-${JSON.stringify(galleryFilter)}`}
          filter={galleryFilter}
        />
      );
    }

    return (
      <TileLayer
        key={type}
        attribution={attribution}
        url={url.replace('{tileFormat}', this.props.tileFormat)}
        minZoom={minZoom}
        maxZoom={20}
        maxNativeZoom={maxNativeZoom}
        opacity={this.props.overlayOpacity[type] || 1.0}
      />
    );
  }

  handleKeydown = (event) => {
    if (this.props.disableKeyboard || ['input', 'select', 'textarea'].includes(event.target.tagName.toLowerCase())) {
      return;
    }

    const baseLayer = baseLayers.find(l => l.key === event.key);
    if (baseLayer) {
      this.props.onMapTypeChange(baseLayer.type);
    }

    const overlayLayer = overlayLayers.find(l => l.key === event.key);
    if (overlayLayer) {
      const { type } = overlayLayer;
      const next = new Set(this.props.overlays);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      this.props.onOverlaysChange([...next]);
    }
  }

  render() {
    const { expertMode } = this.props;

    return (
      <span>
        {
          baseLayers
            .filter(({ showOnlyInExpertMode }) => !showOnlyInExpertMode || expertMode)
            .filter(({ type }) => type === this.props.mapType)
            .map(item => this.getTileLayer(item))
        }
        {
          overlayLayers
            .filter(({ type }) => this.props.overlays.includes(type))
            .map(item => ((!item.showOnlyInExpertMode || expertMode) ? this.getTileLayer(item) : null))
        }
      </span>
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
    galleryFilter: state.gallery.filter,
    galleryDirtySeq: state.gallery.dirtySeq,
  }),
  (dispatch, props) => ({
    onMapTypeChange(mapType) {
      if (props.mapType !== mapType) {
        dispatch(mapRefocus({ mapType }));
      }
    },
    onOverlaysChange(overlays) {
      dispatch(mapRefocus({ overlays }));
    },
  }),
)(Layers);
