import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TileLayer } from 'react-leaflet';
import GalleryLayer from 'fm3/components/GalleryLayer';

import { mapRefocus } from 'fm3/actions/mapActions';
import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';
import * as FmPropTypes from 'fm3/propTypes';
import { BingLayer } from 'react-leaflet-bing';

class Layers extends React.Component {
  static propTypes = {
    onMapTypeChange: PropTypes.func.isRequired,
    onOverlaysChange: PropTypes.func.isRequired,
    tileFormat: FmPropTypes.tileFormat.isRequired,
    overlays: FmPropTypes.overlays,
    mapType: FmPropTypes.mapType.isRequired,
    overlayOpacity: FmPropTypes.overlayOpacity.isRequired,
    disableKeyboard: PropTypes.bool,
    galleryDirtySeq: PropTypes.number.isRequired,
    galleryFilter: FmPropTypes.galleryFilter.isRequired,
    isAdmin: PropTypes.bool,
    embedFeatures: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeydown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeydown);
  }

  getTileLayer({ type, url, minZoom, maxNativeZoom, zIndex = 1 }) {
    if (type === 'S') {
      return (
        <BingLayer
          key="S"
          bingkey="AuoNV1YBdiEnvsK1n4IALvpTePlzMXmn2pnLN5BvH0tdM6GujRxqbSOAYALZZptW"
          maxNativeZoom={maxNativeZoom}
          maxZoom={20}
          zIndex={zIndex}
        />
      );
    }

    if (type === 'I') {
      const { galleryFilter, galleryDirtySeq } = this.props;
      return (
        <GalleryLayer
          key={`I-${galleryDirtySeq}-${JSON.stringify(galleryFilter)}`}
          filter={galleryFilter}
          opacity={this.props.overlayOpacity[type] || 1}
          zIndex={zIndex}
        />
      );
    }

    return (
      <TileLayer
        key={type}
        url={url.replace('{tileFormat}', this.props.tileFormat)}
        minZoom={minZoom}
        maxZoom={20}
        maxNativeZoom={maxNativeZoom}
        opacity={this.props.overlayOpacity[type] || 1}
        zIndex={zIndex}
      />
    );
  }

  handleKeydown = (event) => {
    const { disableKeyboard, onMapTypeChange, isAdmin, overlays, onOverlaysChange, embedFeatures } = this.props;

    const embed = window.self !== window.top;

    if (disableKeyboard || event.ctrlKey || event.altKey || event.metaKey || event.isComposing
      || ['input', 'select', 'textarea'].includes(event.target.tagName.toLowerCase())
      || embed && embedFeatures.includes('noMapSwitch')
    ) {
      return;
    }

    const baseLayer = baseLayers.find(l => l.key === event.key);
    if (baseLayer) {
      onMapTypeChange(baseLayer.type);
    }

    const overlayLayer = overlayLayers.find(l => l.key === event.key);
    if (overlayLayer && (!overlayLayer.adminOnly || isAdmin)) {
      const { type } = overlayLayer;
      const next = new Set(overlays);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      onOverlaysChange([...next]);
    }
  }

  render() {
    const { mapType, overlays, isAdmin } = this.props;

    return [
      ...baseLayers
        .filter(({ type }) => type === mapType)
        .filter(({ adminOnly }) => isAdmin || !adminOnly)
        .map(item => this.getTileLayer(item)),
      ...overlayLayers
        .filter(({ type }) => overlays.includes(type))
        .filter(({ adminOnly }) => isAdmin || !adminOnly)
        .map(item => this.getTileLayer(item)),
    ];
  }
}

export default connect(
  state => ({
    tileFormat: state.map.tileFormat,
    overlays: state.map.overlays,
    mapType: state.map.mapType,
    overlayOpacity: state.map.overlayOpacity,
    disableKeyboard: !!(state.main.activeModal
      || state.gallery.activeImageId && !state.gallery.showPosition && !state.gallery.pickingPositionForId), // NOTE there can be lot more things
    galleryFilter: state.gallery.filter,
    galleryDirtySeq: state.gallery.dirtySeq,
    isAdmin: !!(state.auth.user && state.auth.user.isAdmin),
    embedFeatures: state.main.embedFeatures,
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
