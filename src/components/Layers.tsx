import { useCallback, type ReactElement } from 'react';
import { useDispatch } from 'react-redux';
import { setActiveModal } from '../actions/mainActions.js';
import { ScaledTileLayer } from '../components/ScaledTileLayer.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import missingTile from '../images/missing-tile-256x256.png';
import { useMessages } from '../l10nInjector.js';
import { integratedLayerDefs, LayerDef } from '../mapDefinitions.js';
import { isPremium } from '../premium.js';
import { AsyncComponent } from './AsyncComponent.js';
import { WmsTileLayer } from './WmsTileLayer.js';

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

    const isHdpi = scaleWithDpi && (window.devicePixelRatio || 1) > 1.4;

    let effPremiumFromZoom =
      !('premiumFromZoom' in layerDef) || isPremium(user)
        ? undefined
        : layerDef.premiumFromZoom;

    if (effPremiumFromZoom && scaleWithDpi) {
      effPremiumFromZoom--;
    }

    if (layerDef.technology === 'wms') {
      const effPremiumFromZoom = isPremium(user)
        ? undefined
        : scaleWithDpi
          ? 14
          : 15;

      return (
        <WmsTileLayer
          key={
            type +
            '-' +
            opacity +
            '-' +
            (effPremiumFromZoom ?? 99) +
            '-' +
            (effPremiumFromZoom ? m?.premium.premiumOnly : '') +
            '-' +
            layerDef.layers.join(',')
          }
          url={layerDef.url}
          layers={layerDef.layers.join(',')}
          maxNativeZoom={layerDef.maxNativeZoom}
          maxZoom={maxZoom}
          minZoom={layerDef.minZoom}
          detectRetina={layerDef.scaleWithDpi}
          version="1.3.0"
          transparent={layerDef.layer === 'overlay'}
          format={layerDef.layer === 'overlay' ? 'image/png' : 'image/jpeg'}
          premiumFromZoom={effPremiumFromZoom}
          premiumOnlyText={m?.premium.premiumOnly}
          onPremiumClick={
            effPremiumFromZoom === undefined ? undefined : handlePremiumClick
          }
        />
      );
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
