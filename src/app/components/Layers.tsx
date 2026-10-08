import { hasRole } from '@features/auth/model/types.js';
import { getCachedTileScale } from '@features/cachedMaps/cachedTileMaps.js';
import { toCachedLayerUrl } from '@features/cachedMaps/cachedTileUrl.js';
import { sourceLayerEnvelope } from '@features/cachedMaps/sourceLayer.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { withMemberKind } from '@features/map/model/layerKind.js';
import {
  DEFAULT_SHADING,
  type LayerSetup,
} from '@features/map/model/layerSetup.js';
import { presetIdOf } from '@features/map/model/mapPreset.js';
import {
  type LayerInstance,
  layerInstancesSelector,
  resolvedCustomLayersSelector,
} from '@features/map/model/selectors.js';
import {
  integratedLayerDefMapSelector,
  mapByIdSelector,
  nativeKindsSelector,
  overlayZIndexSelector,
  presetByIdSelector,
  presetKindsSelector,
} from '@features/mapLibrary/model/selectors.js';
import { colorToHexa } from '@features/parameterizedShading/model/Shading.js';
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
import { Fragment, type ReactNode, useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import transparent1x1 from '@/images/1x1-transparent.png';
import missingTile from '@/images/missing-tile-256x256.png';
import { AsyncComponent } from './AsyncComponent.js';
import { ColorLayer } from './ColorLayer.js';
import { CoveragePane } from './CoveragePane.js';
import { PresetPane } from './PresetPane.js';
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

export function Layers(): ReactNode {
  const map = useMap();

  const mapById = useAppSelector(mapByIdSelector);

  const integratedLayerDefMap = useAppSelector(integratedLayerDefMapSelector);

  useEffect(() => {
    map.on('moveend zoomend', scheduleTileAttribution);

    return () => {
      map.off('moveend zoomend', scheduleTileAttribution);
    };
  }, [map]);

  const layers = useAppSelector((state) => state.map.layers);

  const instances = useAppSelector(layerInstancesSelector);

  const presetById = useAppSelector(presetByIdSelector);

  const presetKinds = useAppSelector(presetKindsSelector);

  const nativeKinds = useAppSelector(nativeKindsSelector);

  const overlayZIndex = useAppSelector(overlayZIndexSelector);

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
  // `instance` is which drawing of the map this is: its key keeps a map drawn
  // twice apart, its setup is that drawing's, its z-index its place.
  function getLayer(
    layerDef: LayerDef,
    instance: { key: string; setup: LayerSetup; zIndex: number },
    fixedScale?: number,
    serverShading = false,
  ): ReactNode {
    const { type, minZoom } = layerDef;

    const { setup } = instance;

    // Rendered on the server, a shading layer is plain tiles of its applied
    // shading; drafts are not drawn.
    if (layerDef.technology === 'parametricShading' && shadingOnServer) {
      return getLayer(
        {
          ...layerDef,
          technology: 'tile',
          url: serverShadingUrl(setup.shading ?? DEFAULT_SHADING),
          errorTileUrl: transparent1x1,
        } as LayerDef,
        instance,
        fixedScale,
        true,
      );
    }

    // A faded base map shows the map background through.
    const opacity = resolveLayerOpacity(layerDef, setup.opacity);

    // Bases below every overlay; overlays by their place in the stack, each
    // its own z-index, as equal ones would stack by insertion.
    const zIndex = layerDef.layer === 'base' ? 0 : instance.zIndex;

    // In place of the map's id wherever React tells layers apart.
    const id = instance.key;

    if (layerDef.technology === 'gallery') {
      return (
        <AsyncComponent
          factory={galleryLayerFactory}
          key="I"
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
          key={`${id}-${maxZoom}`}
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
          key={id}
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
      // As ticked in its setup, else the map's own.
      const picked = setup?.wmsLayers;

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

      if (!layerDef.tiled) {
        return (
          <WmsImageLayer
            // The kind picks `transparent` and `format`, which Leaflet reads once.
            key={[
              id,
              layerDef.layer,
              wmsLayers.join(','),
              wmsHdpi ? 'hdpi' : 'ldpi',
            ].join('-')}
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
            id,
            layerDef.layer,
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
          zIndex={zIndex}
        />
      );
    }

    if (layerDef.technology === 'color') {
      return (
        <ColorLayer
          key={id}
          color={colorToHexa(setup?.color ?? layerDef.color)}
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
          key={[
            id,
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
          shading={setup?.shading ?? DEFAULT_SHADING}
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
          key={`${id}-${effectiveDpr}`}
          style={layerDef.url}
          zIndex={zIndex}
          opacity={opacity}
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

      // Opacity and z-index are applied in place (`updateGridLayer`), never by
      // a remount, which would blank the layer while its tiles reload.
      const key = [
        id,
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

  // A preset's layer is of the kind its own setup says, not the map's.
  const ofKind = <T extends LayerDef>(def: T, inst: LayerInstance): T =>
    withMemberKind(def, inst.kind, nativeKinds.get(def.type));

  function drawInstance(inst: LayerInstance, zIndex: number): ReactNode {
    const at = { key: inst.key, setup: inst.setup, zIndex };

    const ref = mapById[inst.type];

    if (ref?.origin === 'library') {
      // A body still loading is drawn once it arrives.
      return !ref.def ||
        (ref.def.layerPreview && !hasRole(user, 'layerPreview'))
        ? null
        : getLayer(ofKind(ref.def, inst), at);
    }

    if (ref?.origin === 'custom') {
      return getLayer(ofKind(ref.def, inst), at);
    }

    if (!ref) {
      return null;
    }

    const cm = ref.def;

    const fetchesMissing = online && cm.networkFallback !== false;

    // Without its source's envelope the network fallback would skip the
    // premium gate, so wait for a library source still loading.
    const source = mapById[cm.sourceType];

    if (fetchesMissing && source?.origin === 'library' && !source.def) {
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
      ofKind(
        cm.technology === 'tile'
          ? { ...cm, url, ...envelope, cors: false }
          : { ...cm, url, ...envelope },
        inst,
      ),
      at,
      getCachedTileScale(cm),
    );
  }

  return window.isRobot
    ? null
    : layers.map((item) => {
        const id = presetIdOf(item);

        if (id === undefined) {
          const inst = instances.find((i) => i.key === item);

          return (
            inst && (
              <Fragment key={item}>
                {drawInstance(inst, overlayZIndex[item] ?? 1)}
              </Fragment>
            )
          );
        }

        const preset = presetById[id];

        if (!preset) {
          return null;
        }

        const overlay = presetKinds[id] === 'overlay';

        // Its layers stack within its own pane, which takes the preset's place
        // and opacity: faded as one picture, not layer by layer.
        return (
          <PresetPane
            key={item}
            zIndex={overlay ? (overlayZIndex[item] ?? 1) : 0}
            opacity={preset.opacity ?? 1}
          >
            {instances
              .filter((inst) => inst.preset === id)
              .map((inst, i) => (
                <Fragment key={inst.key}>{drawInstance(inst, i + 1)}</Fragment>
              ))}
          </PresetPane>
        );
      });
}
