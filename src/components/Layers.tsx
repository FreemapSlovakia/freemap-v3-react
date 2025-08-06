import { type ReactElement } from 'react';
import { WMSTileLayer } from 'react-leaflet';
import { ScaledTileLayer } from '../components/ScaledTileLayer.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import missingTile from '../images/missing-tile-256x256.png';
import { useMessages } from '../l10nInjector.js';
import { integratedLayerDefs, LayerDef } from '../mapDefinitions.js';
import { isPremium } from '../premium.js';
import { AsyncComponent } from './AsyncComponent.js';

const galleryLayerFactory = () =>
  import('../components/gallery/GalleryLayer.js');

const shadingLayerFactory = () =>
  import('./parameterizedShading/ShadingLayer.js');

const maplibreLayerFactory = () => import('./MaplibreLayer.js');

export function Layers(): ReactElement | null {
  const layers = useAppSelector((state) => state.map.layers);

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  const shading = useAppSelector((state) => state.map.shading);

  const galleryFilter = useAppSelector((state) => state.gallery.filter);

  const galleryColorizeBy = useAppSelector((state) => state.gallery.colorizeBy);

  const galleryShowDirection = useAppSelector(
    (state) => state.gallery.showDirection,
  );

  const galleryDirtySeq = useAppSelector((state) => state.gallery.dirtySeq);

  const user = useAppSelector((state) => state.auth.user);

  const language = useAppSelector((state) => state.l10n.language);

  const maxZoom = useAppSelector((state) => state.map.maxZoom);

  const m = useMessages();

  function getLayer(layerDef: LayerDef) {
    const { type, minZoom } = layerDef;

    const opacity = layersSettings[type]?.opacity ?? 1;

    if (layerDef.technology === 'gallery') {
      return (
        <AsyncComponent
          factory={galleryLayerFactory}
          key={`I-${opacity}`}
          filter={galleryFilter}
          colorizeBy={galleryColorizeBy}
          opacity={opacity}
          zIndex={layerDef.zIndex ?? 1}
          myUserId={user?.id}
          authToken={user?.authToken}
          showDirection={galleryShowDirection}
          dirtySeq={galleryDirtySeq}
        />
      );
    }

    if (layerDef.technology === 'wms') {
      return (
        <WMSTileLayer
          key={`${layerDef.type}-${opacity}`}
          url={layerDef.url}
          layers={layerDef.layers.join(',')}
          maxNativeZoom={layerDef.maxNativeZoom}
          maxZoom={maxZoom}
          minZoom={layerDef.minZoom}
          detectRetina={layerDef.scaleWithDpi}
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

    if (layerDef.technology === 'parametricShading') {
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
          maxZoom={maxZoom}
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

    if (layerDef.technology === 'maplibre') {
      return (
        <AsyncComponent
          factory={maplibreLayerFactory}
          key={type}
          style={layerDef.url}
          maxZoom={maxZoom}
          minZoom={minZoom}
          language={language}
        />
      );
    }

    if (layerDef.technology === 'tile') {
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
          maxZoom={maxZoom}
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
          className={'fm-' + layerDef.layer}
        />
      );
    }

    return null;
  }

  const customLayerDefs = useAppSelector((state) => state.map.customLayers);

  return window.isRobot ? null : (
    <>
      {integratedLayerDefs
        .filter(({ type }) => layers.includes(type))
        .filter(({ adminOnly }) => user?.isAdmin || !adminOnly)
        .map((item) => getLayer(item))}
      {customLayerDefs
        .filter(({ type }) => layers.includes(type))
        .map((cm) => getLayer(cm))}
    </>
  );
}
