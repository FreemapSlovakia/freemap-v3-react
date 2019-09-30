import React from 'react';
import { connect } from 'react-redux';
import GalleryLayer from 'fm3/components/gallery/GalleryLayer';

import { baseLayers, overlayLayers, LayerDef } from 'fm3/mapDefinitions';
import { BingLayer } from 'react-leaflet-bing';
import { RootState } from 'fm3/storeCreator';

import missingTile from '../images/missing-tile-256x256.png';
import ScaledTileLayer from './ScaledTileLayer';

type Props = ReturnType<typeof mapStateToProps>;

const Layers: React.FC<Props> = ({
  mapType,
  overlays,
  isAdmin,
  galleryFilter,
  galleryDirtySeq,
  overlayOpacity,
  tileFormat,
}) => {
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
  galleryFilter: state.gallery.filter,
  galleryDirtySeq: state.gallery.dirtySeq,
  isAdmin: !!(state.auth.user && state.auth.user.isAdmin),
});

export default connect(mapStateToProps)(Layers);
