import 'fm3/bootstrap/css/bootstrap.css';
import 'leaflet/dist/leaflet.css';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Map, ScaleControl } from 'react-leaflet';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import Button from 'react-bootstrap/lib/Button';
import CloseButton from 'react-bootstrap/lib/CloseButton';
import Panel from 'react-bootstrap/lib/Panel';

import { withTranslator, Translator } from 'fm3/l10nInjector';

import { Layers } from 'fm3/components/Layers';
import { Toasts } from 'fm3/components/Toasts';

import { SearchMenu } from 'fm3/components/SearchMenu';
import { SearchResults } from 'fm3/components/SearchResults';

import { ObjectsMenu } from 'fm3/components/ObjectsMenu';
import { ObjectsResult } from 'fm3/components/ObjectsResult';

import { MeasurementMenu } from 'fm3/components/MeasurementMenu';
import { DistanceMeasurementResults } from 'fm3/components/DistanceMeasurementResults';
import { ElevationMeasurementResult } from 'fm3/components/ElevationMeasurementResult';
import { LocationResult } from 'fm3/components/LocationResult';

import { RoutePlannerMenu } from 'fm3/components/RoutePlannerMenu';
import { RoutePlannerResult } from 'fm3/components/RoutePlannerResult';

import { TrackViewerMenu } from 'fm3/components/TrackViewerMenu';
import { TrackViewerResult } from 'fm3/components/TrackViewerResult';
import { TrackViewerUploadModal } from 'fm3/components/TrackViewerUploadModal';
import { TrackViewerShareModal } from 'fm3/components/TrackViewerShareModal';

import { GalleryMenu } from 'fm3/components/gallery/GalleryMenu';
import { GalleryResult } from 'fm3/components/gallery/GalleryResult';
import { GalleryPicker } from 'fm3/components/gallery/GalleryPicker';
import { GalleryPositionPickingMenu } from 'fm3/components/gallery/GalleryPositionPickingMenu';
import { GalleryShowPositionMenu } from 'fm3/components/gallery/GalleryShowPositionMenu';

import { Settings } from 'fm3/components/Settings';
import { Copyright } from 'fm3/components/Copyright';
import { MapControls } from 'fm3/components/MapControls';
import { HomeLocationPickingMenu } from 'fm3/components/HomeLocationPickingMenu';

import { AsyncElevationChart } from 'fm3/components/AsyncElevationChart';

import { InfoPointMenu } from 'fm3/components/InfoPointMenu';
import { InfoPointResult } from 'fm3/components/InfoPointResult';
import { InfoPointLabelModal } from 'fm3/components/InfoPointLabelModal';

import { ChangesetsMenu } from 'fm3/components/ChangesetsMenu';
import { ChangesetsResult } from 'fm3/components/ChangesetsResult';

import { MapDetailsMenu } from 'fm3/components/MapDetailsMenu';

import { ShareMapModal } from 'fm3/components/ShareMapModal';
import { EmbedMapModal } from 'fm3/components/EmbedMapModal';
import { ExportGpxModal } from 'fm3/components/ExportGpxModal';
import { ExportPdfModal } from 'fm3/components/ExportPdfModal';
import { LoginModal } from 'fm3/components/LoginModal';
import { TipsModal } from 'fm3/components/TipsModal';
import { AboutModal } from 'fm3/components/AboutModal';
import { SupportUsModal } from 'fm3/components/SupportUsModal';
import { AsyncLegendModal } from 'fm3/components/AsyncLegendModal';

import { mapEventEmitter } from 'fm3/mapEventEmitter';

import { mapRefocus, mapReset, MapViewState } from 'fm3/actions/mapActions';
import {
  setActiveModal,
  deleteFeature,
  Selection,
} from 'fm3/actions/mainActions';

import { setMapLeafletElement } from 'fm3/leafletElementHolder';

import 'fm3/styles/main.scss';
import 'fm3/styles/leaflet.scss';
import { TrackingModal } from 'fm3/components/tracking/TrackingModal';
import { TrackingResult } from 'fm3/components/tracking/TrackingResult';
import { TrackingMenu } from 'fm3/components/tracking/TrackingMenu.tsx';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';
import { LeafletMouseEvent } from 'leaflet';

import fmLogo from '../images/freemap-logo-print.png';
import { useDropzone } from 'react-dropzone';
import {
  trackViewerSetTrackUID,
  trackViewerSetData,
} from 'fm3/actions/trackViewerActions';
import { elevationChartClose } from 'fm3/actions/elevationChartActions';
import {
  mouseCursorSelector,
  showGalleryPickerSelector,
} from 'fm3/selectors/mainSelectors';
import {
  GalleryItem,
  galleryAddItem,
  galleryMergeItem,
  galleryShowUploadModal,
} from 'fm3/actions/galleryActions';
import { usePictureDropHandler } from '../hooks/pictureDropHandlerHook';
import { useGpxDropHandler } from 'fm3/hooks/gpxDropHandlerHook';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { GalleryModals } from './gallery/GalleryModals';
import { MoreMenuButton } from './MoreMenuButton';
import { ToolsMenuButton } from './ToolsMenuButton';
import { FontAwesomeIcon } from './FontAwesomeIcon';
import { toolDefinitions } from 'fm3/toolDefinitions';
import { useShareFile } from 'fm3/hooks/shareFileHook';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const embed = window.self !== window.top;

const MainInt: React.FC<Props> = ({
  lat,
  lon,
  zoom,
  tool,
  activeModal,
  progress,
  mouseCursor,
  showElevationChart,
  showGalleryPicker,
  showLoginModal,
  onMapReset,
  showMenu,
  overlayPaneOpacity,
  embedFeatures,
  onMapRefocus,
  onGpxDrop,
  onGpxLoadError,
  onPictureUpdated,
  onPictureAdded,
  onPicturesDrop,
  authenticated,
  language,
  t,
  isUserValidated,
  selection,
  onDelete,
}) => {
  const [showInfoBar, setShowInfoBar] = useState<boolean>(true);

  const mapRef = useRef<Map | null>();

  const setMap = useCallback(
    (map: Map | null) => {
      mapRef.current = map;
    },
    [mapRef],
  );

  useEffect(() => {
    setMapLeafletElement(mapRef.current ? mapRef.current.leafletElement : null);
  }, []);

  const handleMapMoveEnd = useCallback(() => {
    // TODO analyze why this can be null
    if (!mapRef.current) {
      return;
    }

    const map = mapRef.current.leafletElement;
    const { lat: newLat, lng: newLon } = map.getCenter();
    const newZoom = map.getZoom();

    if (lat !== newLat || lon !== newLon || zoom !== newZoom) {
      onMapRefocus({ lat: newLat, lon: newLon, zoom: newZoom });
    }
  }, [onMapRefocus, lat, lon, zoom]);

  const handleLogoClick = useCallback(() => {
    if (embed) {
      window.open(window.location.href, '_blank');
    } else {
      onMapReset();
    }
  }, [onMapReset]);

  const handleInfoBarCloseClick = useCallback(() => {
    setShowInfoBar(false);
  }, [setShowInfoBar]);

  const handlePicturesDrop = usePictureDropHandler(
    true,
    language,
    onPictureAdded,
    onPictureUpdated,
  );

  const handleGpxDrop = useGpxDropHandler(onGpxDrop, onGpxLoadError, t);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const pictureFiles = acceptedFiles.filter(
        file => file.type === 'image/jpeg',
      );

      if (pictureFiles.length) {
        onPicturesDrop(); // if no user then it displays valuable error
        if (authenticated) {
          handlePicturesDrop(pictureFiles);
        }
      }

      const gpxFiles = acceptedFiles.filter(file =>
        file.name.toLowerCase().endsWith('.gpx'),
      );

      if (gpxFiles.length) {
        handleGpxDrop(gpxFiles);
      }
    },
    [handlePicturesDrop, handleGpxDrop, onPicturesDrop, authenticated],
  );

  useShareFile(onDrop);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleDropzoneClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleDeleteClick = useCallback(() => {
    onDelete(selection);
  }, [onDelete, selection]);

  const embedToolDef = embed && toolDefinitions.find(td => td.tool === tool);

  return (
    <>
      <style>
        {`.leaflet-overlay-pane { opacity: ${overlayPaneOpacity} }`}
      </style>

      {/* see https://stackoverflow.com/questions/24680588/load-external-images-in-print-media why we must allways fetch the image :-( */}
      <img
        id="freemap-logo-print"
        src={fmLogo}
        width="150"
        height="54"
        alt="freemap logo"
        style={{ display: 'none' }}
      />

      <Toasts />

      <div className="header">
        {process.env.DEPLOYMENT === 'next' && showInfoBar && (
          <div className="info-bar">
            <CloseButton onClick={handleInfoBarCloseClick} />
            {t('main.devInfo')}
          </div>
        )}
        <div className="menus">
          <Panel className="fm-toolbar">
            <Button
              id="freemap-logo"
              className={progress ? 'in-progress' : 'idle'}
              onClick={handleLogoClick}
            />
            {!embed && showMenu && (
              <>
                <MoreMenuButton />{' '}
              </>
            )}
            {(!embed || embedFeatures.includes('search')) && (
              <SearchMenu hidden={!showMenu} preventShortcut={!!activeModal} />
            )}
          </Panel>
          {showMenu && (!embed || tool) && (
            <Panel className="fm-toolbar">
              {embed ? (
                embedToolDef && (
                  <>
                    <FontAwesomeIcon icon={embedToolDef.icon} />{' '}
                    {t(`tools.${embedToolDef.msgKey}`)}{' '}
                  </>
                )
              ) : (
                <ToolsMenuButton />
              )}
              {tool === 'objects' && <ObjectsMenu />}
              {tool === 'route-planner' && <RoutePlannerMenu />}
              {tool &&
                ['measure-dist', 'measure-ele', 'measure-area'].includes(
                  tool,
                ) && <MeasurementMenu />}
              {tool === 'track-viewer' && <TrackViewerMenu />}
              {tool === 'info-point' && <InfoPointMenu />}
              {tool === 'changesets' && <ChangesetsMenu />}
              {tool === 'gallery' && <GalleryMenu />}
              {tool === 'map-details' && <MapDetailsMenu />}
              {tool === 'tracking' && <TrackingMenu />}{' '}
              {(selection?.id !== undefined ||
                ['route-planner', 'measure-ele'].includes(
                  selection?.type ?? '',
                )) && (
                <Button title={t('general.delete')} onClick={handleDeleteClick}>
                  <FontAwesomeIcon icon="trash" />
                  <span className="hidden-xs">
                    {' '}
                    {t('general.delete')} <kbd>Del</kbd>
                  </span>
                </Button>
              )}
            </Panel>
          )}
          <GalleryPositionPickingMenu />
          <GalleryShowPositionMenu />
          <HomeLocationPickingMenu />
        </div>
      </div>

      <div className="fm-type-zoom-control">
        <Copyright />
        <MapControls />
      </div>

      {activeModal === 'settings' && <Settings />}
      {activeModal &&
        [
          ...(isUserValidated ? ['tracking-my'] : []),
          'tracking-watched',
        ].includes(activeModal) && <TrackingModal />}
      {activeModal === 'share' && <ShareMapModal />}
      {activeModal === 'embed' && <EmbedMapModal />}
      {activeModal === 'export-gpx' && <ExportGpxModal />}
      {activeModal === 'export-pdf' && <ExportPdfModal />}
      {activeModal === 'tips' && <TipsModal />}
      {activeModal === 'about' && <AboutModal />}
      {activeModal === 'supportUs' && <SupportUsModal />}
      {activeModal === 'legend' && <AsyncLegendModal />}
      {activeModal === 'info-point-change-label' && <InfoPointLabelModal />}
      {activeModal === 'upload-track' && <TrackViewerUploadModal />}
      {activeModal === 'track-viewer-share' && <TrackViewerShareModal />}
      {showLoginModal && <LoginModal />}
      <GalleryModals />

      <div
        {...getRootProps({
          onClick: handleDropzoneClick,
        })}
      >
        {isDragActive && (
          <div
            style={{
              backgroundColor: 'rgba(217,237,247,50%)',
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              zIndex: 20000,
            }}
          ></div>
        )}
        <input {...getInputProps()} />
        <Map
          zoomControl={false}
          attributionControl={false}
          maxZoom={20}
          ref={setMap}
          center={{ lat, lng: lon }}
          zoom={zoom}
          onmoveend={handleMapMoveEnd}
          onmousemove={handleMapMouseMove}
          onmouseover={handleMapMouseOver}
          onmouseout={handleMapMouseOut}
          onclick={handleMapClick}
          style={{ cursor: mouseCursor }}
        >
          <ScaleControl imperial={false} position="bottomleft" />
          <Layers />

          {showMenu && (
            <>
              <SearchResults />
              <ObjectsResult />
              <RoutePlannerResult />
              <DistanceMeasurementResults />
              <ElevationMeasurementResult />
              <LocationResult />
              <TrackViewerResult />
              <InfoPointResult />
              <ChangesetsResult />
              <TrackingResult />
              {showElevationChart && <AsyncElevationChart />}
              {showGalleryPicker && <GalleryPicker />}
            </>
          )}
          {/* TODO should not be extra just because for position picking */}
          <GalleryResult />
        </Map>
      </div>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  lat: state.map.lat,
  lon: state.map.lon,
  zoom: state.map.zoom,
  tool: state.main.selection?.type,
  embedFeatures: state.main.embedFeatures,
  activeModal: state.main.activeModal,
  progress: !!state.main.progress.length,
  mouseCursor: mouseCursorSelector(state),
  authenticated: !!state.auth.user,
  showElevationChart: !!state.elevationChart.elevationProfilePoints,
  showGalleryPicker: showGalleryPickerSelector(state),
  showLoginModal: state.auth.chooseLoginMethod,
  showMenu:
    !state.main.selectingHomeLocation &&
    !state.gallery.pickingPositionForId &&
    !state.gallery.showPosition,
  overlayPaneOpacity: state.map.overlayPaneOpacity,
  language: state.l10n.language,
  isUserValidated: state.auth.user && !state.auth.user.notValidated,
  selection: state.main.selection,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onMapRefocus(changes: Partial<MapViewState>) {
    dispatch(mapRefocus(changes));
  },
  onMapReset() {
    dispatch(mapReset());
  },
  onGpxDrop(trackGpx: string) {
    dispatch(trackViewerSetTrackUID(null));
    dispatch(trackViewerSetData({ trackGpx }));
    dispatch(setActiveModal(null));
    dispatch(elevationChartClose());
  },
  onGpxLoadError(message: string) {
    dispatch(
      toastsAdd({
        collapseKey: 'trackViewer.loadError',
        message,
        style: 'danger',
        timeout: 5000,
      }),
    );
  },
  onPicturesDrop() {
    dispatch(galleryShowUploadModal());
  },
  onPictureAdded(item: GalleryItem) {
    dispatch(galleryAddItem(item));
  },
  onPictureUpdated(item: Pick<GalleryItem, 'id'> & Partial<GalleryItem>) {
    dispatch(galleryMergeItem(item));
  },
  onDelete(selection: Selection | null) {
    dispatch(deleteFeature(selection));
  },
});

export const Main = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(MainInt));

function handleMapClick(e: LeafletMouseEvent) {
  // see https://github.com/FreemapSlovakia/freemap-v3-react/issues/168
  const target: any = e.originalEvent?.target;

  if (
    !window.preventMapClick &&
    target?.tagName === 'DIV' &&
    target?.classList.contains('leaflet-container')
  ) {
    mapEventEmitter.emit('mapClick', e.latlng.lat, e.latlng.lng);
  }
}

function handleMapMouseMove(e: LeafletMouseEvent) {
  mapEventEmitter.emit(
    'mouseMove',
    e.latlng.lat,
    e.latlng.lng,
    e.originalEvent,
  );
}

function handleMapMouseOver(e: LeafletMouseEvent) {
  mapEventEmitter.emit('mouseOver', e.latlng.lat, e.latlng.lng);
}

function handleMapMouseOut(e: LeafletMouseEvent) {
  mapEventEmitter.emit('mouseOut', e.latlng.lat, e.latlng.lng);
}
