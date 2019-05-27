import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TileLayer } from 'react-leaflet';
import GalleryLayer from 'fm3/components/gallery/GalleryLayer';

import { mapRefocus } from 'fm3/actions/mapActions';
import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';
import * as FmPropTypes from 'fm3/propTypes';
import { BingLayer } from 'react-leaflet-bing';

function Layers({
  mapType,
  overlays,
  isAdmin,
  galleryFilter,
  galleryDirtySeq,
  overlayOpacity,
  tileFormat,
  disableKeyboard,
  onMapTypeChange,
  onOverlaysChange,
  embedFeatures,
}) {
  const handleKeydown = useCallback(
    event => {
      const embed = window.self !== window.top;

      if (
        disableKeyboard ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        event.isComposing ||
        ['input', 'select', 'textarea'].includes(
          event.target.tagName.toLowerCase(),
        ) ||
        (embed && embedFeatures.includes('noMapSwitch'))
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
    },
    [
      disableKeyboard,
      embedFeatures,
      isAdmin,
      onMapTypeChange,
      onOverlaysChange,
      overlays,
    ],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [handleKeydown]);

  // eslint-disable-next-line
  const getTileLayer = ({
    type,
    url,
    minZoom,
    maxNativeZoom,
    zIndex = 1,
    subdomains = 'abc',
  }) => {
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
      return (
        <GalleryLayer
          key={`I-${galleryDirtySeq}-${JSON.stringify(galleryFilter)}`}
          filter={galleryFilter}
          opacity={overlayOpacity[type] || 1}
          zIndex={zIndex}
        />
      );
    }

    return (
      <TileLayer
        key={type}
        url={url.replace('{tileFormat}', tileFormat)}
        minZoom={minZoom}
        maxZoom={20}
        maxNativeZoom={maxNativeZoom}
        opacity={overlayOpacity[type] || 1}
        zIndex={zIndex}
        subdomains={subdomains}
        errorTileUrl={require('../images/missing-tile-256x256.png')}
      />
    );
  };

  return [
    ...baseLayers
      .filter(({ type }) => type === mapType)
      .filter(({ adminOnly }) => isAdmin || !adminOnly)
      .map(item => getTileLayer(item)),
    ...overlayLayers
      .filter(({ type }) => overlays.includes(type))
      .filter(({ adminOnly }) => isAdmin || !adminOnly)
      .map(item => getTileLayer(item)),
  ];
}

Layers.propTypes = {
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

export default connect(
  state => ({
    tileFormat: state.map.tileFormat,
    overlays: state.map.overlays,
    mapType: state.map.mapType,
    overlayOpacity: state.map.overlayOpacity,
    disableKeyboard: !!(
      state.main.activeModal ||
      (state.gallery.activeImageId &&
        !state.gallery.showPosition &&
        !state.gallery.pickingPositionForId)
    ), // NOTE there can be lot more things
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
