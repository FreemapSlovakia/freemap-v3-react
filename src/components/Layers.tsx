import { GalleryLayer } from 'fm3/components/gallery/GalleryLayer';
import { ScaledTileLayer } from 'fm3/components/ScaledTileLayer';
import {
  BaseLayerLetters,
  baseLayers,
  LayerDef,
  overlayLayers,
  OverlayLetters,
} from 'fm3/mapDefinitions';
import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import missingTile from '../images/missing-tile-256x256.png';

export function Layers(): ReactElement | null {
  const overlays = useSelector((state) => state.map.overlays);

  const mapType = useSelector((state) => state.map.mapType);

  const layersSettings = useSelector((state) => state.map.layersSettings);

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
    | 'tileSize'
    | 'zoomOffset'
    | 'cors'
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

    return (
      !!url && (
        <ScaledTileLayer
          key={type}
          url={url}
          minZoom={minZoom}
          maxZoom={20}
          maxNativeZoom={maxNativeZoom}
          opacity={layersSettings[type]?.opacity ?? 1}
          zIndex={zIndex}
          subdomains={subdomains}
          errorTileUrl={errorTileUrl}
          extraScales={extraScales}
          tms={tms}
          tileSize={tileSize}
          zoomOffset={zoomOffset}
          cors={cors}
        />
      )
    );
  };

  const customLayers = useSelector((state) => state.map.customLayers);

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
