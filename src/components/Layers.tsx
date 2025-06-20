import type { ReactElement } from 'react';
import { ScaledTileLayer } from '../components/ScaledTileLayer.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import missingTile from '../images/missing-tile-256x256.png';
import { useMessages } from '../l10nInjector.js';
import {
  baseLayers,
  CustomBaseLayerDef,
  CustomOverlayLayerDef,
  LayerDef,
  overlayLayers,
} from '../mapDefinitions.js';
import { isPremium } from '../premium.js';
import { AsyncComponent } from './AsyncComponent.js';

const galleryLayerFactory = () =>
  import('../components/gallery/GalleryLayer.js');

const shadingLayerFactory = () =>
  import('./parameterizedShading/ShadingLayer.js');

const maplibreLayerFactory = () => import('./MaplibreLayer.js');

const MAX_ZOOM = 20;

export function Layers(): ReactElement | null {
  const overlays = useAppSelector((state) => state.map.overlays);

  const mapType = useAppSelector((state) => state.map.mapType);

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  const shading = useAppSelector((state) => state.map.shading);

  const galleryFilter = useAppSelector((state) => state.gallery.filter);

  const galleryColorizeBy = useAppSelector((state) => state.gallery.colorizeBy);

  const galleryDirtySeq = useAppSelector((state) => state.gallery.dirtySeq);

  const user = useAppSelector((state) => state.auth.user);

  const language = useAppSelector((state) => state.l10n.language);

  const m = useMessages();

  function getLayer(layerDef: LayerDef) {
    const { type, minZoom } = layerDef;

    const opacity = layersSettings[type]?.opacity ?? 1;

    if ('technology' in layerDef && layerDef.technology === 'gallery') {
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
          zIndex={layerDef.zIndex ?? 1}
          myUserId={user?.id}
          authToken={user?.authToken}
        />
      );
    }

    const scaleWithDpi = 'scaleWithDpi' in layerDef && layerDef.scaleWithDpi;

    const isHdpi = scaleWithDpi && (window.devicePixelRatio || 1) > 1.4;

    let effPremiumFromZoom =
      !('premiumFromZoom' in layerDef) || isPremium(user)
        ? undefined
        : layerDef.premiumFromZoom;

    if (effPremiumFromZoom && scaleWithDpi) {
      effPremiumFromZoom--;
    }

    if (
      'technology' in layerDef &&
      layerDef.technology === 'parametricShading'
    ) {
      return (
        <AsyncComponent
          key={
            type +
            '-' +
            opacity +
            '-' +
            (effPremiumFromZoom ?? 99) +
            '-' +
            (effPremiumFromZoom ? m?.premium.premiumOnly : '')
          }
          url={layerDef.url}
          factory={shadingLayerFactory}
          opacity={opacity}
          zIndex={layerDef?.zIndex}
          tileSize={isHdpi ? 128 : 256}
          minZoom={minZoom}
          maxZoom={MAX_ZOOM}
          maxNativeZoom={
            layerDef.maxNativeZoom === undefined
              ? undefined
              : isHdpi
                ? layerDef.maxNativeZoom - 1
                : layerDef.maxNativeZoom
          }
          zoomOffset={isHdpi ? 1 : 0}
          shading={shading}
          premiumFromZoom={effPremiumFromZoom}
          premiumOnlyText={m?.premium.premiumOnly}
          gpuMessages={m?.gpu}
        />
      );
    }

    if ('technology' in layerDef && layerDef.technology === 'maplibre') {
      return (
        <AsyncComponent
          factory={maplibreLayerFactory}
          key={type}
          style={layerDef.url}
          maxZoom={MAX_ZOOM}
          minZoom={minZoom}
          language={language}
        />
      );
    }

    if (!('technology' in layerDef) || layerDef.technology === 'tile') {
      return (
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
          url={layerDef.url}
          minZoom={minZoom}
          maxZoom={MAX_ZOOM}
          maxNativeZoom={
            layerDef.maxNativeZoom === undefined
              ? undefined
              : isHdpi
                ? layerDef.maxNativeZoom - 1
                : layerDef.maxNativeZoom
          }
          opacity={opacity}
          zIndex={layerDef.zIndex ?? 1}
          subdomains={layerDef.subdomains ?? 'abc'}
          errorTileUrl={layerDef.errorTileUrl ?? missingTile}
          extraScales={layerDef.extraScales}
          tms={layerDef.tms}
          tileSize={isHdpi ? 128 : 256}
          zoomOffset={isHdpi ? 1 : 0}
          cors={layerDef.cors ?? true}
          premiumFromZoom={effPremiumFromZoom}
          premiumOnlyText={m?.premium.premiumOnly}
          className={`fm-${'layer' in layerDef ? layerDef.layer : layerDef.type.startsWith('.') ? 'base' : 'overlay'}-layer`}
        />
      );
    }

    return null;
  }

  const customLayers = useAppSelector((state) => state.map.customLayers);

  return window.isRobot ? null : (
    <>
      {baseLayers
        .filter(({ type }) => type === mapType)
        .filter(({ adminOnly }) => user?.isAdmin || !adminOnly)
        .map((item) => getLayer(item))}
      {customLayers
        .filter((layer): layer is CustomBaseLayerDef => layer.type === mapType)
        .map((cm) => getLayer({ ...cm, layer: 'base', technology: 'tile' }))}
      {overlayLayers
        .filter(({ type }) => overlays.includes(type))
        .filter(({ adminOnly }) => user?.isAdmin || !adminOnly)
        .map((item) => getLayer(item))}
      {customLayers
        .filter((layer): layer is CustomOverlayLayerDef =>
          overlays.includes(layer.type as (typeof overlays)[number]),
        )
        .map((cm) => getLayer({ ...cm, layer: 'overlay', technology: 'tile' }))}
    </>
  );
}
