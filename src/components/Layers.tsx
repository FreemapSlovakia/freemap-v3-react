import { GalleryLayer } from 'fm3/components/gallery/GalleryLayer';
import { ScaledTileLayer } from 'fm3/components/ScaledTileLayer';
import {
  BaseLayerDef,
  baseLayers,
  OverlayLayerDef,
  overlayLayers,
} from 'fm3/mapDefinitions';
import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import missingTile from '../images/missing-tile-256x256.png';

export function Layers(): ReactElement {
  const overlays = useSelector((state) => state.map.overlays);

  const mapType = useSelector((state) => state.map.mapType);

  const overlayOpacity = useSelector((state) => state.map.overlayOpacity);

  const galleryFilter = useSelector((state) => state.gallery.filter);

  const galleryColorizeBy = useSelector((state) => state.gallery.colorizeBy);

  const galleryDirtySeq = useSelector((state) => state.gallery.dirtySeq);

  const isAdmin = useSelector((state) => !!state.auth.user?.isAdmin);

  const userId = useSelector((state) => state.auth.user?.id);

  const getTileLayer = ({
    type,
    url,
    minZoom,
    maxNativeZoom,
    zIndex = 1,
    subdomains = 'abc',
    extraScales,
    tms,
    errorTileUrl = missingTile,
    tileSize = 256,
    zoomOffset = 0,
  }: BaseLayerDef | OverlayLayerDef) => {
    // if (type === 'S') {
    //   return (
    //     <BingLayer
    //       key="S"
    //       bingkey="AuoNV1YBdiEnvsK1n4IALvpTePlzMXmn2pnLN5BvH0tdM6GujRxqbSOAYALZZptW"
    //       maxNativeZoom={maxNativeZoom}
    //       maxZoom={20}
    //       zIndex={zIndex}
    //     />
    //   );
    // }

    if (type === 'I') {
      return (
        <GalleryLayer
          key={`I-${galleryDirtySeq}-${JSON.stringify({
            galleryFilter,
            galleryColorizeBy,
          })}`}
          filter={galleryFilter}
          colorizeBy={galleryColorizeBy}
          opacity={overlayOpacity[type] || 1}
          zIndex={zIndex}
          myUserId={userId}
        />
      );
    }

    if (type === 'w') {
      return;
    }

    return (
      !!url && (
        <ScaledTileLayer
          key={type}
          url={url}
          minZoom={minZoom}
          maxZoom={20}
          maxNativeZoom={maxNativeZoom}
          opacity={overlayOpacity[type] || 1}
          zIndex={zIndex}
          subdomains={subdomains}
          errorTileUrl={errorTileUrl}
          extraScales={extraScales}
          tms={tms}
          tileSize={tileSize}
          zoomOffset={zoomOffset}
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
          .map((item) => getTileLayer(item)),
        ...overlayLayers
          .filter(({ type }) => overlays.includes(type))
          .filter(({ adminOnly }) => isAdmin || !adminOnly)
          .map((item) => getTileLayer(item)),
      ]}
    </>
  );
}
