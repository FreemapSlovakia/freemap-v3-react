import { GalleryLayer } from 'fm3/components/gallery/GalleryLayer';
import { ScaledTileLayer } from 'fm3/components/ScaledTileLayer';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import {
  BaseLayerLetters,
  baseLayers,
  LayerDef,
  overlayLayers,
  OverlayLetters,
} from 'fm3/mapDefinitions';
import { ReactElement } from 'react';
import missingTile from '../images/missing-tile-256x256.png';

export function Layers(): ReactElement | null {
  const overlays = useAppSelector((state) => state.map.overlays);

  const mapType = useAppSelector((state) => state.map.mapType);

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  const galleryFilter = useAppSelector((state) => state.gallery.filter);

  const galleryColorizeBy = useAppSelector((state) => state.gallery.colorizeBy);

  const galleryDirtySeq = useAppSelector((state) => state.gallery.dirtySeq);

  const isAdmin = useAppSelector((state) => !!state.auth.user?.isAdmin);

  const userId = useAppSelector((state) => state.auth.user?.id);

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
    scaleWithDpi = false,
    cors = true,
  }: Pick<
    LayerDef,
    | 'url'
    | 'minZoom'
    | 'maxNativeZoom'
    | 'zIndex'
    | 'subdomains'
    | 'extraScales'
    | 'tms'
    | 'errorTileUrl'
    | 'cors'
    | 'scaleWithDpi'
  > & { type: BaseLayerLetters | OverlayLetters }) => {
    if (type === 'I') {
      return (
        <GalleryLayer
          key={`I-${galleryDirtySeq}-${JSON.stringify({
            galleryFilter,
            galleryColorizeBy,
          })}`}
          filter={galleryFilter}
          colorizeBy={galleryColorizeBy}
          opacity={layersSettings[type]?.opacity ?? 1}
          zIndex={zIndex}
          myUserId={userId}
        />
      );
    }

    if (type === 'w') {
      return;
    }

    const isHdpi = scaleWithDpi && (window.devicePixelRatio || 1) > 1.4;

    return (
      !!url && (
        <ScaledTileLayer
          key={type}
          url={url}
          minZoom={minZoom}
          maxZoom={20}
          maxNativeZoom={
            maxNativeZoom === undefined
              ? undefined
              : isHdpi
              ? maxNativeZoom - 1
              : maxNativeZoom
          }
          opacity={layersSettings[type]?.opacity ?? 1}
          zIndex={zIndex}
          subdomains={subdomains}
          errorTileUrl={errorTileUrl}
          extraScales={extraScales}
          tms={tms}
          tileSize={isHdpi ? 128 : 256}
          zoomOffset={isHdpi ? 1 : 0}
          cors={cors}
        />
      )
    );
  };

  const customLayers = useAppSelector((state) => state.map.customLayers);

  return window.isRobot ? null : (
    <>
      {baseLayers
        .filter(({ type }) => type === mapType)
        .filter(({ adminOnly }) => isAdmin || !adminOnly)
        .map((item) => getTileLayer(item))}
      {customLayers
        .filter(({ type }) => type === mapType)
        .map((cm) => getTileLayer(cm))}
      {overlayLayers
        .filter(({ type }) => overlays.includes(type))
        .filter(({ adminOnly }) => isAdmin || !adminOnly)
        .map((item) => getTileLayer(item))}
      {customLayers
        .filter(({ type }) => overlays.includes(type as any))
        .map((cm) => getTileLayer(cm))}
      ]
    </>
  );
}
