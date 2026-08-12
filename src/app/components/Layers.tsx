import { hasRole } from '@features/auth/model/types.js';
import { getCachedTileScale } from '@features/cachedMaps/cachedTileMaps.js';
import { toCachedLayerUrl } from '@features/cachedMaps/cachedTileUrl.js';
import { sourceLayerEnvelope } from '@features/cachedMaps/sourceLayer.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { isPremium } from '@features/premium/premium.js';
import { usePremiumMessages } from '@features/premium/translations/usePremiumMessages.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import {
  integratedLayerDefs,
  type LayerDef,
  resolveLayerOpacity,
} from '@shared/mapDefinitions.js';
import { wmsBaseUrl } from '@shared/wms.js';
import { type ReactElement, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import missingTile from '@/images/missing-tile-256x256.png';
import { setActiveModal } from '../store/actions.js';
import { AsyncComponent } from './AsyncComponent.js';
import { ScaledTileLayer } from './ScaledTileLayer.js';
import { WmsImageLayer } from './WmsImageLayer.js';
import { WmsTileLayer } from './WmsTileLayer.js';

const galleryLayerFactory = () =>
  import(
    /* webpackChunkName: "gallery-layer" */
    '@features/gallery/components/GalleryLayer.js'
  );

const shadingLayerFactory = () =>
  import(
    /* webpackChunkName: "shading-layer" */
    '@features/parameterizedShading/components/ShadingLayer.js'
  );

const maplibreLayerFactory = () =>
  import(
    /* webpackChunkName: "maplibre-layer" */
    './MaplibreLayer.js'
  );

const radarLayerFactory = () =>
  import(
    /* webpackChunkName: "radar-layer" */
    '@features/weatherRadar/components/RadarLayer.js'
  );

export function Layers(): ReactElement | null {
  const layers = useAppSelector((state) => state.map.layers);

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  const shading = useAppSelector((state) => state.map.shading);

  const galleryFilter = useAppSelector((state) => state.gallery.filter);

  const galleryColorizeBy = useAppSelector(
    (state) => state.gallerySettings.colorizeBy,
  );

  const galleryShowDirection = useAppSelector(
    (state) => state.gallerySettings.showDirection,
  );

  const galleryDirtySeq = useAppSelector((state) => state.gallery.dirtySeq);

  const user = useAppSelector((state) => state.auth.user);

  const online = useOnline();

  const language = useAppSelector((state) => state.l10n.language);

  const maxZoom = useAppSelector((state) => state.map.maxZoom);

  const zoom = useAppSelector((state) => state.map.zoom);

  const resolutionScale = useAppSelector((state) => state.map.resolutionScale);

  const featureScale = useAppSelector((state) => state.map.featureScale);

  const effectiveDpr = resolutionScale ?? (window.devicePixelRatio || 1);

  const m = useMessages();

  const prm = usePremiumMessages();

  const dispatch = useDispatch();

  const handlePremiumClick = useCallback(() => {
    dispatch(setActiveModal({ type: 'premium' }));
  }, [dispatch]);

  // `fixedScale` pins a tile layer to one `@Nx` variant — a cached map holds
  // exactly one, so the screen's DPI and the resolution/feature-scale
  // preferences must not be allowed to ask for another.
  function getLayer(layerDef: LayerDef, fixedScale?: number) {
    const { type, minZoom } = layerDef;

    const opacity = resolveLayerOpacity(
      layerDef,
      layersSettings[type]?.opacity,
    );

    if (layerDef.technology === 'gallery') {
      return (
        <AsyncComponent
          factory={galleryLayerFactory}
          key={`I-${opacity}`}
          filter={galleryFilter}
          colorizeBy={galleryColorizeBy}
          opacity={opacity}
          zIndex={layerDef.zIndex ?? 1}
          minZoom={minZoom}
          myUserId={user?.id}
          authToken={user?.authToken}
          showDirection={galleryShowDirection}
          dirtySeq={galleryDirtySeq}
        />
      );
    }

    if (layerDef.technology === 'radar') {
      // The frame series, its playback and the tile options all live in the
      // feature's own slices, so only the layer-registry side comes from here.
      return (
        <AsyncComponent
          factory={radarLayerFactory}
          // `maxZoom` is baked into every frame's tile layer when it is built,
          // and a frame that stays on screen is not rebuilt — so a change of it
          // takes a remount.
          key={`${type}-${maxZoom}`}
          opacity={opacity}
          zIndex={layerDef.zIndex ?? 1}
          maxZoom={maxZoom}
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
      // A WMS renders whatever pixel count it is asked for and is told to scale
      // its symbology to match, so density needs no per-layer opt-in the way a
      // tile layer's deeper-zoom trick does. `maxNativeZoom` is what bounds it
      // where the source itself runs out of detail.
      const wmsHdpi = effectiveDpr / featureScale > 1.4;

      const effPremiumFromZoom = isPremium(user)
        ? undefined
        : wmsHdpi
          ? 14
          : 15;

      // The premium checkerboard works by not fetching every second tile, which
      // an untiled view has no equivalent of — masking one would still ship the
      // pixels — so a premium-gated zoom stays on tiles.
      if (
        !layerDef.tiled &&
        (effPremiumFromZoom === undefined || zoom < effPremiumFromZoom)
      ) {
        return (
          <WmsImageLayer
            key={[
              type,
              layerDef.layers.join(','),
              wmsHdpi ? 'hdpi' : 'ldpi',
            ].join('-')}
            url={layerDef.url}
            layers={layerDef.layers.join(',')}
            version="1.3.0"
            transparent={layerDef.layer === 'overlay'}
            format={layerDef.layer === 'overlay' ? 'image/png' : 'image/jpeg'}
            opacity={opacity}
            zIndex={layerDef.zIndex}
            minZoom={layerDef.minZoom}
            maxNativeZoom={layerDef.maxNativeZoom}
            dpiScale={wmsHdpi ? 2 : 1}
          />
        );
      }

      return (
        <WmsTileLayer
          key={[
            type,
            opacity,
            effPremiumFromZoom ?? 99,
            effPremiumFromZoom ? prm?.premiumOnly : '',
            layerDef.layers.join(','),
            wmsHdpi ? 'hdpi' : 'ldpi',
          ].join('-')}
          // Leaflet appends its own parameters, so a `REQUEST` the stored URL
          // already carries would end up beside the tile's own. Its `LAYERS`
          // stays when no layers were picked, since nothing else names them.
          url={wmsBaseUrl(
            layerDef.url,
            layerDef.layers.length ? ['layers'] : [],
          )}
          layers={layerDef.layers.join(',')}
          maxNativeZoom={layerDef.maxNativeZoom}
          // `detectRetina` makes Leaflet drop a zoom off `maxZoom`, and a grid
          // layer whose `maxZoom` the view passes stops drawing entirely — so
          // the ceiling is raised by the level it is about to take away.
          maxZoom={wmsHdpi ? maxZoom + 1 : maxZoom}
          minZoom={layerDef.minZoom}
          detectRetina={wmsHdpi}
          version="1.3.0"
          transparent={layerDef.layer === 'overlay'}
          format={layerDef.layer === 'overlay' ? 'image/png' : 'image/jpeg'}
          opacity={opacity}
          premiumFromZoom={effPremiumFromZoom}
          premiumOnlyText={prm?.premiumOnly}
          onPremiumClick={
            effPremiumFromZoom === undefined ? undefined : handlePremiumClick
          }
          zIndex={layerDef.zIndex ?? 1}
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
            effPremiumFromZoom ? prm?.premiumOnly : '',
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
          premiumOnlyText={prm?.premiumOnly}
          onPremiumClick={
            effPremiumFromZoom === undefined ? undefined : handlePremiumClick
          }
          gpuMessages={m?.gpu}
        />
      );
    }

    if (layerDef.technology === 'maplibre') {
      // maplibre-gl-leaflet keeps painting the GL canvas below minZoom (clamped
      // to a fixed zoom → misaligned) instead of hiding it, so don't mount the
      // layer at all until its minZoom is reached.
      if (minZoom !== undefined && zoom < minZoom) {
        return null;
      }

      return (
        <AsyncComponent
          factory={maplibreLayerFactory}
          key={`${type}-${effectiveDpr}`}
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

      if (fixedScale !== undefined) {
        effForcedScale = fixedScale;
      } else if (resolutionScale === null && effFeatureScale === 1) {
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
            effPremiumFromZoom ? prm?.premiumOnly : '',
            resolutionScale ?? 'auto',
            effForcedScale ?? 'auto',
            effFeatureScale,
            layerDef.url,
            // a grid layer takes its zoom bounds at construction, so anything
            // that moves them — an edit, or a cached map losing the connection
            // it was borrowing its source layer's range from — needs a remount
            minZoom ?? 'auto',
            layerDef.maxNativeZoom ?? 'auto',
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
          premiumOnlyText={prm?.premiumOnly}
          onPremiumClick={
            effPremiumFromZoom === undefined ? undefined : handlePremiumClick
          }
          className={`fm-${layerDef.layer}`}
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
        .filter(
          ({ layerPreview }) => hasRole(user, 'layerPreview') || !layerPreview,
        )
        .map((item) => getLayer(item))}
      {customLayerDefs
        .filter(({ type }) => layers.includes(type))
        .map((cm) => getLayer(cm))}
      {cachedMaps
        .filter(({ type }) => layers.includes(type))
        .map((cm) => {
          const url = toCachedLayerUrl(cm.url, cm.type);

          // Online the map wears its source layer's zoom range and premium gate:
          // the service worker fetches whatever the cache lacks, so it behaves
          // as the layer itself would, checkerboard included. Offline it is only
          // what was downloaded — its own range, upscaled past the deepest zoom
          // it holds rather than left blank.
          const envelope = online
            ? sourceLayerEnvelope(cm.sourceType, customLayerDefs)
            : undefined;

          // cors: false — cached tiles are served same-origin by the service
          // worker, so `crossOrigin` buys nothing, and the CORS-mode request it
          // produces makes Chrome's `cache.match` miss the stored entry.
          return getLayer(
            cm.technology === 'tile'
              ? { ...cm, url, ...envelope, cors: false }
              : { ...cm, url, ...envelope },
            getCachedTileScale(cm),
          );
        })}
    </>
  );
}
