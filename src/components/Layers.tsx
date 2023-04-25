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
import { AsyncComponent } from './AsyncComponent';

const galleryLayerFactory = () => import('fm3/components/gallery/GalleryLayer');

const maplibreLayerFactory = () => import('./MaplibreLayer') as any;

export function Layers(): ReactElement | null {
  const overlays = useAppSelector((state) => state.map.overlays);

  const mapType = useAppSelector((state) => state.map.mapType);

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  const galleryFilter = useAppSelector((state) => state.gallery.filter);

  const galleryColorizeBy = useAppSelector((state) => state.gallery.colorizeBy);

  const galleryDirtySeq = useAppSelector((state) => state.gallery.dirtySeq);

  const isAdmin = useAppSelector((state) => !!state.auth.user?.isAdmin);

  const userId = useAppSelector((state) => state.auth.user?.id);

  const language = useAppSelector((state) => state.l10n.language);

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
    const opacity = layersSettings[type]?.opacity ?? 1;

    if (type === 'I') {
      return (
        <AsyncComponent
          factory={galleryLayerFactory}
          key={`I-${galleryDirtySeq}-${opacity}-${JSON.stringify({
            galleryFilter,
            galleryColorizeBy,
          })}`}
          filter={galleryFilter}
          colorizeBy={galleryColorizeBy}
          opacity={opacity}
          zIndex={zIndex}
          myUserId={userId}
        />
      );
    }

    if (type === 'w') {
      return;
    }

    if (type[0] === 'V') {
      return (
        <AsyncComponent
          factory={maplibreLayerFactory}
          key={type}
          style={url}
          maxZoom={20}
          minZoom={minZoom}
          language={language}
        />
      );
    }

    const isHdpi = scaleWithDpi && (window.devicePixelRatio || 1) > 1.4;

    return (
      !!url && (
        <ScaledTileLayer
          key={type + '-' + opacity}
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
          opacity={opacity}
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
