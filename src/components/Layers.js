import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TileLayer, LayersControl } from 'react-leaflet';
import { BingLayer } from 'react-leaflet-bing';

import { mapRefocus } from 'fm3/actions/mapActions';
import { baseLayers, overlayLayers } from 'fm3/mapDefinitions';
import * as FmPropTypes from 'fm3/propTypes';

function Layers({ onMapChange, onOverlaysChange, tileFormat, overlays, mapType, overlayOpacity, expertMode }) {
  // eslint-disable-next-line
  function getTileLayer({ type, url, attribution, minZoom, maxNativeZoom }) {
    if (type === 'S') {
      return (
        <BingLayer
          bingkey="AuoNV1YBdiEnvsK1n4IALvpTePlzMXmn2pnLN5BvH0tdM6GujRxqbSOAYALZZptW"
          onAdd={() => handleAdd(type)}
          onRemove={() => handleRemove(type)}
          maxZoom={20}
          maxNativeZoom={18}
        />
      );
    }

    return (
      <TileLayer
        attribution={attribution}
        url={url.replace('{tileFormat}', tileFormat)}
        onAdd={() => handleAdd(type)}
        onRemove={() => handleRemove(type)}
        maxZoom={20}
        minZoom={minZoom}
        maxNativeZoom={maxNativeZoom}
        opacity={overlayOpacity[type] || 1.0}
      />
    );
  }

  function handleAdd(type) {
    if (baseLayers.some(x => x.type === type)) {
      onMapChange(type);
    } else {
      const next = new Set(overlays);
      next.add(type);
      onOverlaysChange([...next]);
    }
  }

  function handleRemove(type) {
    if (overlayLayers.some(x => x.type === type)) {
      const next = [...overlays];
      next.splice(next.indexOf(type));
      onOverlaysChange(next);
    }
  }

  return (
    <LayersControl position="topright">
      {
        baseLayers.filter(({ showOnlyInExpertMode }) => !showOnlyInExpertMode || expertMode).map((item) => {
          const { type, name } = item;
          return (
            <LayersControl.BaseLayer key={type} name={name} checked={mapType === type}>
              {getTileLayer(item)}
            </LayersControl.BaseLayer>
          );
        })
      }
      {
        overlayLayers && overlayLayers.map((item) => {
          const { type, name } = item;
          return !item.showOnlyInExpertMode || expertMode && (
            <LayersControl.Overlay key={type} name={name} checked={overlays.indexOf(type) !== -1}>
                {getTileLayer(item)}
            </LayersControl.Overlay>
          );
        })
      }
    </LayersControl>
  );
}

Layers.propTypes = {
  onMapChange: PropTypes.func.isRequired,
  onOverlaysChange: PropTypes.func.isRequired,
  tileFormat: FmPropTypes.tileFormat.isRequired,
  overlays: FmPropTypes.overlays,
  mapType: FmPropTypes.mapType.isRequired,
  overlayOpacity: FmPropTypes.overlayOpacity.isRequired,
  expertMode: PropTypes.bool,
};

export default connect(
  state => ({
    tileFormat: state.map.tileFormat,
    overlays: state.map.overlays,
    mapType: state.map.mapType,
    overlayOpacity: state.map.overlayOpacity,
    expertMode: state.main.expertMode,
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
