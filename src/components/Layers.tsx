import { ReactElement } from 'react';
import { ScaledTileLayer } from '../components/ScaledTileLayer.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import missingTile from '../images/missing-tile-256x256.png';
import { useMessages } from '../l10nInjector.js';
import {
  BaseLayerDef,
  BaseLayerLetters,
  baseLayers,
  OverlayLayerDef,
  overlayLayers,
  OverlayLetters,
} from '../mapDefinitions.js';
import { AsyncComponent } from './AsyncComponent.js';

const galleryLayerFactory = () =>
  import('../components/gallery/GalleryLayer.js');

const shadingLayerFactory = () =>
  import('../components/gallery/ShadingLayer.js');

const maplibreLayerFactory = () => import('./MaplibreLayer.js');

const MAX_ZOOM = 20;

export function Layers(): ReactElement | null {
  const overlays = useAppSelector((state) => state.map.overlays);

  const mapType = useAppSelector((state) => state.map.mapType);

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  const galleryFilter = useAppSelector((state) => state.gallery.filter);

  const galleryColorizeBy = useAppSelector((state) => state.gallery.colorizeBy);

  const galleryDirtySeq = useAppSelector((state) => state.gallery.dirtySeq);

  const user = useAppSelector((state) => state.auth.user);

  const language = useAppSelector((state) => state.l10n.language);

  const m = useMessages();

  const getTileLayer = (
    {
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
      premiumFromZoom,
    }: Pick<
      (BaseLayerDef & { zIndex: undefined }) | OverlayLayerDef,
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
      | 'premiumFromZoom'
    > & { type: BaseLayerLetters | OverlayLetters },
    kind: 'base' | 'overlay',
  ) => {
    const opacity = layersSettings[type]?.opacity ?? 1;

    if (type === 'I') {
      return (
        <AsyncComponent
          factory={galleryLayerFactory}
          key={`I-${galleryDirtySeq}-${opacity}-${user?.id}-${JSON.stringify({
            galleryFilter,
            galleryColorizeBy,
          })}`}
          filter={galleryFilter}
          colorizeBy={galleryColorizeBy}
          opacity={opacity}
          zIndex={zIndex}
          myUserId={user?.id}
          authToken={user?.authToken}
        />
      );
    }

    const isHdpi = scaleWithDpi && (window.devicePixelRatio || 1) > 1.4;

    if (type === 'H' && url) {
      return (
        <AsyncComponent
          url={url}
          factory={shadingLayerFactory}
          opacity={opacity}
          zIndex={zIndex}
          tileSize={isHdpi ? 128 : 256}
          minZoom={minZoom}
          maxZoom={MAX_ZOOM}
          maxNativeZoom={
            maxNativeZoom === undefined
              ? undefined
              : isHdpi
                ? maxNativeZoom - 1
                : maxNativeZoom
          }
          zoomOffset={isHdpi ? 1 : 0}
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
          maxZoom={MAX_ZOOM}
          minZoom={minZoom}
          language={language}
        />
      );
    }

    const effPremiumFromZoom = user?.isPremium ? undefined : premiumFromZoom;

    return (
      !!url && (
        <ScaledTileLayer
          key={
            type +
            '-' +
            opacity +
            '-' +
            (effPremiumFromZoom ?? 99) +
            '-' +
            (effPremiumFromZoom ? m?.premium.premiumOnly : '')
          }
          url={url}
          minZoom={minZoom}
          maxZoom={MAX_ZOOM}
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
          premiumFromZoom={effPremiumFromZoom}
          premiumOnlyText={m?.premium.premiumOnly}
          className={`fm-${kind}-layer`}
        />
      )
    );
  };

  const customLayers = useAppSelector((state) => state.map.customLayers);

  return window.isRobot ? null : (
    <>
      {baseLayers
        .filter(({ type }) => type === mapType)
        .filter(({ adminOnly }) => user?.isAdmin || !adminOnly)
        .map((item) => getTileLayer(item, 'base'))}
      {customLayers
        .filter(({ type }) => type === mapType)
        .map((cm) => getTileLayer(cm, 'base'))}
      {overlayLayers
        .filter(({ type }) => overlays.includes(type))
        .filter(({ adminOnly }) => user?.isAdmin || !adminOnly)
        .map((item) => getTileLayer(item, 'overlay'))}
      {customLayers
        .filter(({ type }) =>
          overlays.includes(type as (typeof overlays)[number]),
        )
        .map((cm) => getTileLayer(cm, 'overlay'))}
    </>
  );
}
