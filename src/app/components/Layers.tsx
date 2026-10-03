import { hasRole } from '@features/auth/model/types.js';
import { getCachedTileScale } from '@features/cachedMaps/cachedTileMaps.js';
import { toCachedLayerUrl } from '@features/cachedMaps/cachedTileUrl.js';
import { sourceLayerEnvelope } from '@features/cachedMaps/sourceLayer.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  activeCombinationsSelector,
  opacitySetting,
  resolvedCustomLayersSelector,
} from '@features/map/model/selectors.js';
import {
  integratedLayerDefMapSelector,
  integratedLayerDefsSelector,
  overlayZIndexSelector,
} from '@features/mapLibrary/model/selectors.js';
import {
  colorToHexa,
  effectiveShading,
} from '@features/parameterizedShading/model/Shading.js';
import { useBecomePremium } from '@features/premium/hooks/useBecomePremium.js';
import { isPremium, premiumMapZoom } from '@features/premium/premium.js';
import { usePremiumMessages } from '@features/premium/translations/usePremiumMessages.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import {
  type LayerDef,
  RENDERER_LAYER_TYPES,
  resolveLayerOpacity,
  serverShadingUrl,
} from '@shared/mapDefinitions.js';
import { mapIndexById } from '@shared/mapLibrary/mapIndex.js';
import {
  scheduleTileAttribution,
  tileAttributionHandlers,
} from '@shared/tileAttribution.js';
import { loadTerrainLicenses, loadTileLicenses } from '@shared/tileLicenses.js';
import {
  buildTileUrl,
  pickSubdomain,
  tileZoomOffset,
} from '@shared/tileUrl.js';
import { wmsBaseUrl } from '@shared/wms.js';
import { type ReactElement, type ReactNode, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import transparent1x1 from '@/images/1x1-transparent.png';
import missingTile from '@/images/missing-tile-256x256.png';
import { AsyncComponent } from './AsyncComponent.js';
import { ColorLayer } from './ColorLayer.js';
import { CoveragePane } from './CoveragePane.js';
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

const viewshedLayerFactory = () =>
  import(
    /* webpackChunkName: "viewshed-layer" */
    '@features/viewshed/components/ViewshedLayer.js'
  );

export function Layers(): ReactElement | null {
  const map = useMap();

  const integratedLayerDefs = useAppSelector(integratedLayerDefsSelector);

  const integratedLayerDefMap = useAppSelector(integratedLayerDefMapSelector);

  useEffect(() => {
    map.on('moveend zoomend', scheduleTileAttribution);

    return () => {
      map.off('moveend zoomend', scheduleTileAttribution);
    };
  }, [map]);

  const layers = useAppSelector((state) => state.map.layers);

  const layersSettings = useAppSelector((state) => state.map.layersSettings);

  const activeCombinations = useAppSelector(activeCombinationsSelector);

  const overlayZIndex = useAppSelector(overlayZIndexSelector);

  const shading = useAppSelector((state) => state.map.shading);

  const shadingDrafts = useAppSelector((state) => state.map.shadingDrafts);

  const shadingOnServer = useAppSelector((state) => state.map.shadingOnServer);

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

  // Only ever wired for a non-premium user — `effPremiumFromZoom` is undefined
  // for everyone else — which is exactly when the hook returns a function.
  const handlePremiumClick = useBecomePremium();

  // `fixedScale` pins a tile layer to one `@Nx` variant — a cached map holds
  // exactly one, so the screen's DPI and the resolution/feature-scale
  // preferences must not be allowed to ask for another.
  // `serverShading`: shading tiles from terrain-tiles, which follow the
  // display's density alone, as shading drawn in the browser does, and name
  // their datasets by its dictionary.
  function getLayer(
    layerDef: LayerDef,
    fixedScale?: number,
    serverShading = false,
  ): ReactNode {
    // Rendered on the server, a shading layer is plain tiles of its applied or
    // saved shading; drafts are not drawn.
    if (layerDef.technology === 'parametricShading' && shadingOnServer) {
      const { shading: own, ...rest } = layerDef;

      return getLayer(
        {
          ...rest,
          technology: 'tile',
          url: serverShadingUrl(own ?? shading),
          errorTileUrl: transparent1x1,
        } as LayerDef,
        fixedScale,
        true,
      );
    }

    const { type, minZoom } = layerDef;

    // Only an overlay's is set anywhere; one kept from a map used as an
    // overlay before has no control on a base map.
    const opacity =
      layerDef.layer === 'base'
        ? 1
        : resolveLayerOpacity(
            layerDef,
            opacitySetting(activeCombinations, layersSettings, type),
          );

    // Bases below every overlay; overlays by their place in the stack, each
    // its own z-index, as equal ones would stack by insertion.
    const zIndex = layerDef.layer === 'base' ? 0 : (overlayZIndex[type] ?? 1);

    if (layerDef.technology === 'gallery') {
      return (
        <AsyncComponent
          factory={galleryLayerFactory}
          key={`I-${opacity}`}
          filter={galleryFilter}
          colorizeBy={galleryColorizeBy}
          opacity={opacity}
          zIndex={zIndex}
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
          zIndex={zIndex}
          maxZoom={maxZoom}
        />
      );
    }

    if (layerDef.technology === 'viewshed') {
      // One image per viewpoint rather than a grid: where it is drawn and what
      // it is of live in the feature's own slices.
      return (
        <AsyncComponent
          factory={viewshedLayerFactory}
          key={type}
          opacity={opacity}
          zIndex={zIndex}
        />
      );
    }

    // Shading is drawn here, so it always follows the display's density.
    const scaleWithDpi =
      layerDef.technology === 'parametricShading' ||
      ('scaleWithDpi' in layerDef && Boolean(layerDef.scaleWithDpi));

    const isHdpi = scaleWithDpi && effectiveDpr > 1.4;

    // a dense screen's half-size tiles are one zoom deeper in the URL
    const toNativeZoom = (zoom: number | undefined) =>
      zoom === undefined ? undefined : isHdpi ? zoom - 1 : zoom;

    // the map zoom a premium limit starts at for this user, if it applies
    const toEffPremium = (fromZoom: number | undefined) =>
      fromZoom === undefined || isPremium(user)
        ? undefined
        : premiumMapZoom(fromZoom, scaleWithDpi);

    const effPremiumFromZoom = toEffPremium(
      'premiumFromZoom' in layerDef ? layerDef.premiumFromZoom : undefined,
    );

    if (layerDef.technology === 'wms') {
      // As picked in the layers panel, else the map's own.
      const picked = layersSettings[type]?.wmsLayers;

      // Nothing picked draws nothing. Asked for, the server refuses, and the
      // image layer takes that for a size limit it then keeps to.
      if (picked?.length === 0) {
        return null;
      }

      const wmsLayers = picked ?? layerDef.layers;

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
            key={[type, wmsLayers.join(','), wmsHdpi ? 'hdpi' : 'ldpi'].join(
              '-',
            )}
            url={layerDef.url}
            layers={wmsLayers.join(',')}
            version="1.3.0"
            transparent={layerDef.layer === 'overlay'}
            format={layerDef.layer === 'overlay' ? 'image/png' : 'image/jpeg'}
            opacity={opacity}
            zIndex={zIndex}
            minZoom={layerDef.minZoom}
            maxNativeZoom={layerDef.maxNativeZoom}
            dpiScale={wmsHdpi ? 2 : 1}
            onError={() => {
              dispatch(
                toastsAdd({
                  // Per layer, so a flaky one replaces its own notice rather
                  // than stacking a new one on every failed view.
                  id: `wms-${type}`,
                  style: 'warning',
                  timeout: 5000,
                  messageKey: 'mapLayers.serverNotResponding',
                  messageParams: {
                    // `||`: a custom map saves an empty name when the field is
                    // left blank, which has to fall through like a missing one.
                    name:
                      ('name' in layerDef ? layerDef.name : undefined) ||
                      m?.mapLayers.letters[type] ||
                      `{${type}}`,
                  },
                }),
              );
            }}
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
            wmsLayers.join(','),
            wmsHdpi ? 'hdpi' : 'ldpi',
          ].join('-')}
          // Leaflet appends its own parameters, so a `REQUEST` the stored URL
          // already carries would end up beside the tile's own. Its `LAYERS`
          // stays when no layers were picked, since nothing else names them.
          url={wmsBaseUrl(layerDef.url, wmsLayers.length ? ['layers'] : [])}
          layers={wmsLayers.join(',')}
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
          zIndex={zIndex}
        />
      );
    }

    if (layerDef.technology === 'color') {
      return (
        <ColorLayer
          key={type}
          color={colorToHexa(layerDef.color)}
          opacity={opacity}
          zIndex={zIndex}
          minZoom={minZoom}
          maxZoom={maxZoom}
        />
      );
    }

    if (layerDef.technology === 'parametricShading') {
      return (
        <AsyncComponent
          // The url too: a custom shading map's source can change under it,
          // and the layer doesn't take a new one in place.
          key={[
            type,
            layerDef.url,
            opacity,
            effPremiumFromZoom ?? 99,
            effPremiumFromZoom ? prm?.premiumOnly : '',
          ].join('-')}
          url={layerDef.url}
          factory={shadingLayerFactory}
          opacity={opacity}
          zIndex={zIndex}
          tileSize={isHdpi ? 128 : 256}
          minZoom={minZoom}
          maxZoom={maxZoom}
          maxNativeZoom={toNativeZoom(layerDef.maxNativeZoom)}
          zoomOffset={isHdpi ? 1 : 0}
          shading={effectiveShading(layerDef, shadingDrafts, shading)}
          premiumFromZoom={effPremiumFromZoom}
          premiumOnlyText={prm?.premiumOnly}
          onPremiumClick={
            effPremiumFromZoom === undefined ? undefined : handlePremiumClick
          }
          gpuMessages={m?.gpu}
          eventHandlers={tileAttributionHandlers(type, loadTerrainLicenses)}
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
          zIndex={zIndex}
          maxZoom={maxZoom}
          minZoom={minZoom}
          language={language}
          pixelRatio={effectiveDpr}
        />
      );
    }

    if (layerDef.technology === 'tile') {
      const effFeatureScale = isHdpi || serverShading ? 1 : featureScale;

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

      const key = [
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
      ].join('-');

      const commonProps = {
        forcedScale: effForcedScale,
        minZoom,
        maxZoom,
        extraScales: layerDef.extraScales,
        tms: layerDef.tms,
        tileSize: isHdpi ? 128 : 256 * effFeatureScale,
        zoomOffset: tileZoomOffset(scaleWithDpi, effectiveDpr, effFeatureScale),
        cors: layerDef.cors ?? true,
        reportsAttribution:
          serverShading || RENDERER_LAYER_TYPES.includes(type),
        // Every tile layer is counted; only the ones whose server reports its
        // datasets ever resolve to anything, the rest stay on their own list.
        eventHandlers: tileAttributionHandlers(
          type,
          serverShading ? loadTerrainLicenses : loadTileLicenses,
        ),
        className: `fm-${layerDef.layer}`,
      };

      const premiumProps = {
        premiumFromZoom: effPremiumFromZoom,
        premiumOnlyText: prm?.premiumOnly,
        onPremiumClick:
          effPremiumFromZoom === undefined ? undefined : handlePremiumClick,
      };

      const detail = 'detail' in layerDef ? layerDef.detail : undefined;

      // The detail is drawn over the layer's own tiles, each skipping where the
      // other one covers the tile whole.
      if (detail) {
        const detailPremiumFromZoom = toEffPremium(detail.premiumFromZoom);

        const baseMaxZoom = layerDef.maxNativeZoom ?? Infinity;

        return (
          <CoveragePane
            key={`${key}-${detailPremiumFromZoom ?? 99}`}
            coverageUrl={detail.coverageUrl}
            opacity={opacity}
            zIndex={zIndex}
          >
            {(coverage) => (
              <>
                <ScaledTileLayer
                  {...commonProps}
                  {...premiumProps}
                  url={layerDef.url}
                  maxNativeZoom={toNativeZoom(layerDef.maxNativeZoom)}
                  subdomains={layerDef.subdomains ?? 'abc'}
                  errorTileUrl={layerDef.errorTileUrl ?? missingTile}
                  zIndex={0}
                  // the detail's premium placeholders included: the base under
                  // them would mix older imagery into the watermarked view
                  skipTile={(z, x, y) => coverage(z, x, y) === 'full'}
                />
                <ScaledTileLayer
                  {...commonProps}
                  className={`${commonProps.className} fm-detail`}
                  premiumFromZoom={detailPremiumFromZoom}
                  premiumOnlyText={prm?.premiumOnly}
                  onPremiumClick={
                    detailPremiumFromZoom === undefined
                      ? undefined
                      : handlePremiumClick
                  }
                  url={detail.url}
                  maxNativeZoom={toNativeZoom(detail.maxNativeZoom)}
                  errorTileUrl={transparent1x1}
                  // where the base was skipped, a failed tile shows it instead
                  fallbackUrl={(z, x, y) =>
                    coverage(z, x, y) === 'full' && z <= baseMaxZoom
                      ? buildTileUrl(
                          layerDef.url,
                          x,
                          y,
                          z,
                          pickSubdomain(layerDef.subdomains),
                        )
                      : undefined
                  }
                  zIndex={1}
                  skipTile={(z, x, y) => coverage(z, x, y) === 'none'}
                />
              </>
            )}
          </CoveragePane>
        );
      }

      return (
        <ScaledTileLayer
          {...commonProps}
          {...premiumProps}
          key={key}
          url={layerDef.url}
          maxNativeZoom={toNativeZoom(layerDef.maxNativeZoom)}
          opacity={opacity}
          zIndex={zIndex}
          subdomains={layerDef.subdomains ?? 'abc'}
          errorTileUrl={layerDef.errorTileUrl ?? missingTile}
        />
      );
    }

    return null;
  }

  const customLayerDefs = useAppSelector(resolvedCustomLayersSelector);

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
          const fetchesMissing = online && cm.networkFallback !== false;

          // Without its source's envelope the network fallback would skip the
          // premium gate, so wait for a library source still loading.
          if (
            fetchesMissing &&
            mapIndexById[cm.sourceType] &&
            !integratedLayerDefMap[cm.sourceType]
          ) {
            return null;
          }

          const url = toCachedLayerUrl(cm.url, cm.type);

          // Online the map wears its source layer's zoom range and premium gate:
          // the service worker fetches whatever the cache lacks, so it behaves
          // as the layer itself would, checkerboard included. Offline — or with
          // the network fallback off — it is only what was downloaded: its own
          // range, upscaled past the deepest zoom it holds rather than left blank.
          const envelope = fetchesMissing
            ? sourceLayerEnvelope(
                cm.sourceType,
                customLayerDefs,
                integratedLayerDefMap,
              )
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
