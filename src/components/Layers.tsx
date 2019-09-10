import React, { useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import GalleryLayer from 'fm3/components/gallery/GalleryLayer';

import { mapRefocus } from 'fm3/actions/mapActions';
import { baseLayers, overlayLayers, LayerDef } from 'fm3/mapDefinitions';
import { BingLayer } from 'react-leaflet-bing';
import { RootState } from 'fm3/storeCreator';
import { Dispatch } from 'redux';
import { RootAction } from 'fm3/actions';

import missingTile from '../images/missing-tile-256x256.png';
import ScaledTileLayer from './gallery/ScaledTileLayer';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const Layers: React.FC<Props> = ({
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
}) => {
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

  const getTileLayer = ({
    type,
    url,
    minZoom,
    maxNativeZoom,
    zIndex = 1,
    subdomains = 'abc',
    extraScales,
  }: LayerDef) => {
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
      !!url && (
        <ScaledTileLayer
          key={type}
          url={url.replace('{tileFormat}', tileFormat)}
          minZoom={minZoom}
          maxZoom={20}
          maxNativeZoom={maxNativeZoom}
          opacity={overlayOpacity[type] || 1}
          zIndex={zIndex}
          subdomains={subdomains}
          errorTileUrl={missingTile}
          extraScales={extraScales}
        />
      )
    );
  };

  return (
    <>
      {[
        ...baseLayers
          .filter(({ type }) => type === mapType)
          .filter(({ adminOnly }) => isAdmin || !adminOnly)
          .map(item => getTileLayer(item)),
        ...overlayLayers
          .filter(({ type }) => overlays.includes(type))
          .filter(({ adminOnly }) => isAdmin || !adminOnly)
          .map(item => getTileLayer(item)),
      ]}
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  tileFormat: state.map.tileFormat,
  overlays: state.map.overlays,
  mapType: state.map.mapType,
  overlayOpacity: state.map.overlayOpacity,
  disableKeyboard: !!(
    state.main.activeModal ||
    (state.gallery.activeImageId &&
      !state.gallery.showPosition &&
      !state.gallery.pickingPositionForId)
  ),
  galleryFilter: state.gallery.filter,
  galleryDirtySeq: state.gallery.dirtySeq,
  isAdmin: !!(state.auth.user && state.auth.user.isAdmin),
  embedFeatures: state.main.embedFeatures,
});

const mapDispatchToProps = (
  dispatch: Dispatch<RootAction>,
  // props: ReturnType<typeof mapStateToProps>,
) => ({
  onMapTypeChange(mapType: string) {
    // if (props.mapType !== mapType) {
    dispatch(mapRefocus({ mapType }));
    // }
  },
  onOverlaysChange(overlays: string[]) {
    dispatch(mapRefocus({ overlays }));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Layers);
