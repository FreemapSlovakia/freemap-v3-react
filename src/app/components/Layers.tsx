import { toCachedLayerUrl } from '@features/cachedMaps/cachedTileUrl.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { integratedLayerDefs, LayerDef } from '@shared/mapDefinitions.js';
import { isPremium } from '@shared/premium.js';
import { type ReactElement, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import missingTile from '@/images/missing-tile-256x256.png';
import { setActiveModal } from '../store/actions.js';
import { AsyncComponent } from './AsyncComponent.js';
import { ScaledTileLayer } from './ScaledTileLayer.js';
import { WmsTileLayer } from './WmsTileLayer.js';

const galleryLayerFactory = () =>
  import(
    /* webpackChunkName: "gallery-layer" */
    '@features/gallery/components/GalleryLayer.js'
  );

const shadingLayerFactory = () =>
  import(
    /* webpackChunkName: "shading-layer" */
    '@features/parameterizedShading/ShadingLayer.js'
  );

const maplibreLayerFactory = () =>
  import(
    /* webpackChunkName: "maplibre-layer" */
    './MaplibreLayer.js'
  );

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

  const resolutionScale = useAppSelector((state) => state.map.resolutionScale);

  const featureScale = useAppSelector((state) => state.map.featureScale);

  const effectiveDpr = resolutionScale ?? (window.devicePixelRatio || 1);

  const m = useMessages();

  const dispatch = useDispatch();

  const handlePremiumClick = useCallback(() => {
    dispatch(setActiveModal('premium'));
  }, [dispatch]);

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

    const scaleWithDpi = 'scaleWithDpi' in layerDef && layerDef.scaleWithDpi;

    const isHdpi = scaleWithDpi && effectiveDpr > 1.4;

    let effPremiumFromZoom =
      !('premiumFromZoom' in layerDef) || isPremium(user)
        ? undefined
        : layerDef.premiumFromZoom;

    if (effPremiumFromZoom && scaleWithDpi) {
      effPremiumFromZoom--;
    }

    if (layerDef.technology === 'wms') {
      const wmsHdpi =
        effectiveDpr / featureScale > 1.4 && (scaleWithDpi || featureScale < 1);

      const effPremiumFromZoom = isPremium(user)
        ? undefined
        : wmsHdpi
          ? 14
          : 15;

      return (
        <WmsTileLayer
          key={[
            type,
            opacity,
            effPremiumFromZoom ?? 99,
            effPremiumFromZoom ? m?.premium.premiumOnly : '',
            layerDef.layers.join(','),
            wmsHdpi ? 'hdpi' : 'ldpi',
          ].join('-')}
          url={layerDef.url}
          layers={layerDef.layers.join(',')}
          maxNativeZoom={layerDef.maxNativeZoom}
          maxZoom={maxZoom}
          minZoom={layerDef.minZoom}
          detectRetina={wmsHdpi}
          version="1.3.0"
          transparent={layerDef.layer === 'overlay'}
          format={layerDef.layer === 'overlay' ? 'image/png' : 'image/jpeg'}
          premiumFromZoom={effPremiumFromZoom}
          premiumOnlyText={m?.premium.premiumOnly}
          onPremiumClick={
            effPremiumFromZoom === undefined ? undefined : handlePremiumClick
          }
          zIndex={layerDef.zIndex}
        />
      );
    }

    if (layerDef.technology === 'parametricShading') {
      return (
        <AsyncComponent
          key={[
            type,
            opacity,
            effPremiumFromZoom ?? 99,
            effPremiumFromZoom ? m?.premium.premiumOnly : '',
          ].join('-')}
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
          onPremiumClick={
            effPremiumFromZoom === undefined ? undefined : handlePremiumClick
          }
          gpuMessages={m?.gpu}
        />
      );
    }

    if (layerDef.technology === 'maplibre') {
      return (
        <AsyncComponent
          factory={maplibreLayerFactory}
          key={type + '-' + effectiveDpr}
          style={layerDef.url}
          maxZoom={maxZoom}
          minZoom={minZoom}
          language={language}
          pixelRatio={effectiveDpr}
        />
      );
    }

    if (layerDef.technology === 'tile') {
      const effFeatureScale = isHdpi ? 1 : featureScale;

      const autoTileScale = (window.devicePixelRatio || 1) * effFeatureScale;

      let effForcedScale: number | undefined;

      if (resolutionScale === null && effFeatureScale === 1) {
        effForcedScale = undefined;
      } else {
        const requested = resolutionScale ?? autoTileScale;

        if (requested <= 1 || !layerDef.extraScales?.length) {
          effForcedScale = 1;
        } else {
          const ceil = Math.ceil(requested);

          effForcedScale =
            layerDef.extraScales.find((s) => s >= ceil) ??
            Math.max(...layerDef.extraScales);
        }
      }

      return (
        <ScaledTileLayer
          forcedScale={effForcedScale}
          key={[
            type,
            opacity,
            effPremiumFromZoom ?? 99,
            effPremiumFromZoom ? m?.premium.premiumOnly : '',
            resolutionScale ?? 'auto',
            effForcedScale ?? 'auto',
            effFeatureScale,
          ].join('-')}
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
          tileSize={isHdpi ? 128 : 256 * effFeatureScale}
          zoomOffset={isHdpi ? 1 : -Math.log2(effFeatureScale)}
          cors={layerDef.cors ?? true}
          premiumFromZoom={effPremiumFromZoom}
          premiumOnlyText={m?.premium.premiumOnly}
          onPremiumClick={
            effPremiumFromZoom === undefined ? undefined : handlePremiumClick
          }
          className={'fm-' + layerDef.layer}
        />
      );
    }

    return null;
  }

  const customLayerDefs = useAppSelector((state) => state.map.customLayers);

  const cachedMaps = useAppSelector((state) => state.map.cachedMaps);

  return window.isRobot ? null : (
    <>
      {integratedLayerDefs
        .filter(({ type }) => layers.includes(type))
        .filter(({ adminOnly }) => user?.isAdmin || !adminOnly)
        .map((item) => getLayer(item))}
      {customLayerDefs
        .filter(({ type }) => layers.includes(type))
        .map((cm) => getLayer(cm))}
      {cachedMaps
        .filter(({ type }) => layers.includes(type))
        .map((cm) =>
          getLayer({ ...cm, url: toCachedLayerUrl(cm.url, cm.type) }),
        )}
    </>
  );
}
