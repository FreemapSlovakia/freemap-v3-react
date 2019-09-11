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

import Layers from 'fm3/components/Layers';
import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import Toasts from 'fm3/components/Toasts';

import SearchMenu from 'fm3/components/SearchMenu';
import SearchResults from 'fm3/components/SearchResults';

import ObjectsMenu from 'fm3/components/ObjectsMenu';
import { ObjectsResult } from 'fm3/components/ObjectsResult';

import MeasurementMenu from 'fm3/components/MeasurementMenu';
import DistanceMeasurementResult from 'fm3/components/DistanceMeasurementResult';
import AreaMeasurementResult from 'fm3/components/AreaMeasurementResult';
import ElevationMeasurementResult from 'fm3/components/ElevationMeasurementResult';
import LocationResult from 'fm3/components/LocationResult';

import RoutePlannerMenu from 'fm3/components/RoutePlannerMenu';
import RoutePlannerResult from 'fm3/components/RoutePlannerResult';

import TrackViewerMenu from 'fm3/components/TrackViewerMenu';
import TrackViewerResult from 'fm3/components/TrackViewerResult';
import TrackViewerUploadModal from 'fm3/components/TrackViewerUploadModal';
import TrackViewerShareModal from 'fm3/components/TrackViewerShareModal';

import GalleryMenu from 'fm3/components/gallery/GalleryMenu';
import GalleryResult from 'fm3/components/gallery/GalleryResult';
import GalleryPicker from 'fm3/components/gallery/GalleryPicker';
import GalleryPositionPickingMenu from 'fm3/components/gallery/GalleryPositionPickingMenu';
import GalleryShowPositionMenu from 'fm3/components/gallery/GalleryShowPositionMenu';

import Settings from 'fm3/components/Settings';
import { Menu } from 'fm3/components/Menu';
import { Copyright } from 'fm3/components/Copyright';
import { MapControls } from 'fm3/components/MapControls';
import HomeLocationPickingMenu from 'fm3/components/HomeLocationPickingMenu';

import AsyncElevationChart from 'fm3/components/AsyncElevationChart';

import InfoPointMenu from 'fm3/components/InfoPointMenu';
import InfoPointResult from 'fm3/components/InfoPointResult';
import InfoPointLabelModal from 'fm3/components/InfoPointLabelModal';

import ChangesetsMenu from 'fm3/components/ChangesetsMenu';
import ChangesetsResult from 'fm3/components/ChangesetsResult';

import MapDetailsMenu from 'fm3/components/MapDetailsMenu';

import ShareMapModal from 'fm3/components/ShareMapModal';
import EmbedMapModal from 'fm3/components/EmbedMapModal';
import ExportGpxModal from 'fm3/components/ExportGpxModal';
import ExportPdfModal from 'fm3/components/ExportPdfModal';
import LoginModal from 'fm3/components/LoginModal';
import TipsModal from 'fm3/components/TipsModal';
import AboutModal from 'fm3/components/AboutModal';
import SupportUsModal from 'fm3/components/SupportUsModal';
import AsyncLegendModal from 'fm3/components/AsyncLegendModal';

import mapEventEmitter from 'fm3/emitters/mapEventEmitter';

import { mapRefocus, mapReset, MapViewState } from 'fm3/actions/mapActions';
import {
  setTool,
  setLocation,
  Tool,
  setActiveModal,
} from 'fm3/actions/mainActions';
import { authCheckLogin } from 'fm3/actions/authActions';

import { setMapLeafletElement } from 'fm3/leafletElementHolder';

import 'fm3/styles/main.scss';
import 'fm3/styles/leaflet.scss';
import TrackingModal from 'fm3/components/tracking/TrackingModal';
import TrackingResult from 'fm3/components/tracking/TrackingResult';
import TrackingMenu from 'fm3/components/tracking/TrackingMenu.tsx';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';
import { LeafletMouseEvent, LocationEvent } from 'leaflet';

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

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

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
  onCheckLogin,
  ignoreEscape,
  onToolSet,
  onMapRefocus,
  onLocationSet,
  onUpload,
  t,
}) => {
  const [showInfoBar, setShowInfoBar] = useState<boolean>(true);

  const mapRef = useRef<Map | null>();

  const setMap = useCallback(
    map => {
      mapRef.current = map;
    },
    [mapRef],
  );

  useEffect(() => {
    onCheckLogin();
  }, [onCheckLogin]);

  useEffect(() => {
    setMapLeafletElement(mapRef.current ? mapRef.current.leafletElement : null);
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const embed = window.self !== window.top;
      if (!embed && event.keyCode === 27 /* escape key */ && !ignoreEscape) {
        onToolSet(null);
      }
    };

    document.addEventListener('keydown', handler);

    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [ignoreEscape, onToolSet]);

  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    const handler = () => {
      setForceUpdate(forceUpdate + 1);
    };

    document.addEventListener('fullscreenchange', handler);

    return () => {
      document.removeEventListener('fullscreenchange', handler);
    };
  }, [forceUpdate, setForceUpdate]);

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

  const handleLocationFound = useCallback(
    (e: LocationEvent) => {
      onLocationSet(e.latlng.lat, e.latlng.lng, e.accuracy);
    },
    [onLocationSet],
  );

  const handleEmbedLogoClick = useCallback(() => {
    window.open(window.location.href, '_blank');
  }, []);

  const handleToolCloseClick = useCallback(() => {
    onToolSet(null);
  }, [onToolSet]);

  const handleInfoBarCloseClick = useCallback(() => {
    setShowInfoBar(false);
  }, [setShowInfoBar]);

  const embed = window.self !== window.top;

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length) {
      const reader = new FileReader();
      reader.readAsText(acceptedFiles[0], 'UTF-8');
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUpload(reader.result);
        } else {
          // onLoadError(`Nepodarilo sa načítať súbor.`); // TODO translate
        }
      };

      reader.onerror = () => {
        // onLoadError(`Nepodarilo sa načítať súbor.`); // TODO translate
        reader.abort();
      };
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleDropzoneClick = useCallback(e => {
    e.stopPropagation();
  }, []);

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
          {embed ? (
            <Panel className="fm-toolbar">
              <Button
                id="freemap-logo"
                className={progress ? 'in-progress' : 'idle'}
                onClick={handleEmbedLogoClick}
              />
              {embedFeatures.includes('search') && <SearchMenu />}
            </Panel>
          ) : (
            <>
              <Panel className="fm-toolbar">
                <Button
                  id="freemap-logo"
                  className={progress ? 'in-progress' : 'idle'}
                  onClick={onMapReset}
                />
                <SearchMenu
                  hidden={!showMenu}
                  preventShortcut={!!activeModal}
                />
              </Panel>
              {showMenu && <Menu />}
            </>
          )}
          {showMenu && tool && (
            <Panel className="fm-toolbar">
              {tool === 'objects' && <ObjectsMenu />}
              {tool === 'route-planner' && <RoutePlannerMenu />}
              {['measure-dist', 'measure-ele', 'measure-area'].includes(
                tool,
              ) && <MeasurementMenu />}
              {tool === 'track-viewer' && <TrackViewerMenu />}
              {tool === 'info-point' && <InfoPointMenu />}
              {tool === 'changesets' && <ChangesetsMenu />}
              {tool === 'gallery' && <GalleryMenu />}
              {tool === 'map-details' && <MapDetailsMenu />}
              {tool === 'tracking' && <TrackingMenu />}
              {!embed && (
                <>
                  {' '}
                  <Button
                    onClick={handleToolCloseClick}
                    title={t('main.closeTool')}
                  >
                    <FontAwesomeIcon icon="close" />
                    <span className="hidden-xs"> {t('main.close')}</span>
                  </Button>
                </>
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
        ['tracking-my', 'tracking-watched'].includes(activeModal) && (
          <TrackingModal />
        )}
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

      <div
        {...getRootProps({
          onClick: handleDropzoneClick,
        })}
      >
        {isDragActive && (
          <div
            style={{
              backgroundColor: 'rgba(0,0,255,10%)',
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
          onlocationfound={handleLocationFound}
          style={{ cursor: mouseCursor }}
        >
          <ScaleControl imperial={false} position="bottomleft" />
          <Layers />

          {showMenu && (
            <>
              <SearchResults />
              <ObjectsResult />
              <RoutePlannerResult />
              <DistanceMeasurementResult />
              <ElevationMeasurementResult />
              <AreaMeasurementResult />
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
  tool: state.main.tool,
  embedFeatures: state.main.embedFeatures,
  activeModal: state.main.activeModal,
  progress: !!state.main.progress.length,
  mouseCursor: mouseCursorSelector(state),
  user: state.auth.user,
  ignoreEscape: !!(
    (state.main.activeModal && state.main.activeModal !== 'settings') || // TODO settings dialog gets also closed
    state.gallery.activeImageId ||
    state.gallery.showPosition
  ),
  showElevationChart: !!state.elevationChart.elevationProfilePoints,
  showGalleryPicker: showGalleryPickerSelector(state),
  showLoginModal: state.auth.chooseLoginMethod,
  showMenu:
    !state.main.selectingHomeLocation &&
    !state.gallery.pickingPositionForId &&
    !state.gallery.showPosition,
  overlayPaneOpacity: state.map.overlayPaneOpacity,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onToolSet(tool: Tool | null) {
    dispatch(setTool(tool));
  },
  onMapRefocus(changes: Partial<MapViewState>) {
    dispatch(mapRefocus(changes));
  },
  onLocationSet(lat: number, lon: number, accuracy: number) {
    dispatch(setLocation({ lat, lon, accuracy }));
  },
  onCheckLogin() {
    dispatch(authCheckLogin());
  },
  onMapReset() {
    dispatch(mapReset());
  },
  onUpload(trackGpx: string) {
    dispatch(trackViewerSetTrackUID(null));
    dispatch(trackViewerSetData({ trackGpx }));
    dispatch(setActiveModal(null));
    dispatch(elevationChartClose());
  },
});

export const Main = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(MainInt));

function handleMapClick(e: LeafletMouseEvent) {
  // see https://github.com/FreemapSlovakia/freemap-v3-react/issues/168
  if (!window.preventMapClick) {
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
