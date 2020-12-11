import 'fm3/bootstrap/css/bootstrap.css';
import 'leaflet/dist/leaflet.css';

import React, { useEffect, useCallback, ReactElement, useState } from 'react';
import { MapContainer, ScaleControl } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';

import Button from 'react-bootstrap/lib/Button';
// import CloseButton from 'react-bootstrap/lib/CloseButton';
import Panel from 'react-bootstrap/lib/Panel';

import { useMessages } from 'fm3/l10nInjector';

import { Layers } from 'fm3/components/Layers';
import { Toasts } from 'fm3/components/Toasts';

import { SearchMenu } from 'fm3/components/SearchMenu';
import { SearchResults } from 'fm3/components/SearchResults';

import { ObjectsMenu } from 'fm3/components/ObjectsMenu';
import { ObjectsResult } from 'fm3/components/ObjectsResult';

import { DrawingMenu } from 'fm3/components/DrawingMenu';
import { DrawingLinesResult } from 'fm3/components/DrawingLinesResult';
import { LocationResult } from 'fm3/components/LocationResult';

import { RoutePlannerMenu } from 'fm3/components/RoutePlannerMenu';
import { RoutePlannerResult } from 'fm3/components/RoutePlannerResult';

import { TrackViewerMenu } from 'fm3/components/TrackViewerMenu';
import { TrackViewerResult } from 'fm3/components/TrackViewerResult';

import { GalleryMenu } from 'fm3/components/gallery/GalleryMenu';
import { GalleryResult } from 'fm3/components/gallery/GalleryResult';
import { GalleryPicker } from 'fm3/components/gallery/GalleryPicker';
import { GalleryPositionPickingMenu } from 'fm3/components/gallery/GalleryPositionPickingMenu';
import { GalleryShowPositionMenu } from 'fm3/components/gallery/GalleryShowPositionMenu';

import { Settings } from 'fm3/components/Settings';
import { Copyright } from 'fm3/components/Copyright';
import { MapControls } from 'fm3/components/MapControls';
import { HomeLocationPickingMenu } from 'fm3/components/HomeLocationPickingMenu';

import { DrawingPointsResult } from 'fm3/components/DrawingPointsResult';

import { ChangesetsMenu } from 'fm3/components/ChangesetsMenu';
import { ChangesetsResult } from 'fm3/components/ChangesetsResult';

import { MapDetailsMenu } from 'fm3/components/MapDetailsMenu';

import {
  AsyncElevationChart,
  AsyncExportGpxModal,
  AsyncExportPdfModal,
  AsyncLoginModal,
  AsyncLegendModal,
  AsyncLegendOutdoorModal,
  AsyncEmbedMapModal,
  AsyncTipsModal,
  AsyncAboutModal,
  AsyncSupportUsModal,
  AsyncTrackingModal,
  AsyncDrawingEditLabelModal,
  AsyncTrackViewerUploadModal,
} from 'fm3/components/AsyncComponents';

import { mapRefocus, mapReset } from 'fm3/actions/mapActions';
import { setActiveModal, deleteFeature } from 'fm3/actions/mainActions';

import { setMapLeafletElement } from 'fm3/leafletElementHolder';

import 'fm3/styles/main.scss';
import 'fm3/styles/leaflet.scss';
import { TrackingResult } from 'fm3/components/tracking/TrackingResult';
import { TrackingMenu } from 'fm3/components/tracking/TrackingMenu.tsx';
import { RootState } from 'fm3/storeCreator';
import Leaflet from 'leaflet';

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
import { MapsMenu } from './MapsMenu';
import { WikiLayer } from './WikiLayer';

const embed = window.self !== window.top;

export function Main(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const lat = useSelector((state: RootState) => state.map.lat);

  const lon = useSelector((state: RootState) => state.map.lon);

  const zoom = useSelector((state: RootState) => state.map.zoom);

  const mapType = useSelector((state: RootState) => state.map.mapType);

  const showInteractiveLayer = useSelector(
    (state: RootState) => !state.map.overlays.includes('i'),
  );

  const tool = useSelector((state: RootState) => state.main.selection?.type);

  const embedFeatures = useSelector(
    (state: RootState) => state.main.embedFeatures,
  );

  const activeModal = useSelector((state: RootState) => state.main.activeModal);

  const progress = useSelector(
    (state: RootState) => !!state.main.progress.length,
  );

  const mouseCursor = useSelector((state: RootState) =>
    mouseCursorSelector(state),
  );

  const authenticated = useSelector((state: RootState) => !!state.auth.user);

  const showElevationChart = useSelector(
    (state: RootState) => !!state.elevationChart.elevationProfilePoints,
  );

  const showGalleryPicker = useSelector((state: RootState) =>
    showGalleryPickerSelector(state),
  );

  const showLoginModal = useSelector(
    (state: RootState) => state.auth.chooseLoginMethod,
  );

  const showMenu = useSelector(
    (state: RootState) =>
      !state.main.selectingHomeLocation &&
      !state.gallery.pickingPositionForId &&
      !state.gallery.showPosition,
  );

  const overlayPaneOpacity = useSelector(
    (state: RootState) => state.map.overlayPaneOpacity,
  );

  const language = useSelector((state: RootState) => state.l10n.language);

  const isUserValidated = useSelector(
    (state: RootState) => state.auth.user && !state.auth.user.notValidated,
  );

  const selection = useSelector((state: RootState) => state.main.selection);

  const canDelete = useSelector(
    (state: RootState) =>
      state.main.selection?.id !== undefined ||
      (state.main.selection?.type === 'route-planner' &&
        (state.routePlanner.start ||
          state.routePlanner.finish ||
          state.routePlanner.midpoints.length > 0)) ||
      ((state.main.selection?.type === 'map-details' ||
        state.main.selection?.type === 'track-viewer') &&
        state.trackViewer.trackGeojson) ||
      (state.main.selection?.type === 'changesets' &&
        state.changesets.changesets.length > 0),
  );

  // const [showInfoBar, setShowInfoBar] = useState<boolean>(false);

  const [map, setMap] = useState<Leaflet.Map | null>(null);

  useEffect(() => {
    setMapLeafletElement(map);
  }, [map]);

  useEffect(() => {
    if (!map) {
      return;
    }

    const m = map;

    function handleMapMoveEnd() {
      const { lat: newLat, lng: newLon } = m.getCenter();

      const newZoom = m.getZoom();

      if (lat !== newLat || lon !== newLon || zoom !== newZoom) {
        dispatch(mapRefocus({ lat: newLat, lon: newLon, zoom: newZoom }));
      }
    }

    m.on('moveend', handleMapMoveEnd);

    return () => {
      m.off('moveend', handleMapMoveEnd);
    };
  }, [dispatch, lat, lon, map, zoom]);

  const handleLogoClick = useCallback(() => {
    if (embed) {
      window.open(window.location.href, '_blank');
    } else {
      dispatch(mapReset());
    }
  }, [dispatch]);

  // const handleInfoBarCloseClick = useCallback(() => {
  //   setShowInfoBar(false);
  // }, [setShowInfoBar]);

  const handlePictureAdded = useCallback(
    (item: GalleryItem) => {
      dispatch(galleryAddItem(item));
    },
    [dispatch],
  );

  const onPictureUpdated = useCallback(
    (item: Pick<GalleryItem, 'id'> & Partial<GalleryItem>) => {
      dispatch(galleryMergeItem(item));
    },
    [dispatch],
  );

  const handlePicturesDrop = usePictureDropHandler(
    true,
    language,
    handlePictureAdded,
    onPictureUpdated,
  );

  const onGpxDrop = useCallback(
    (trackGpx: string) => {
      dispatch(trackViewerSetTrackUID(null));
      dispatch(trackViewerSetData({ trackGpx }));
      dispatch(setActiveModal(null));
      dispatch(elevationChartClose());
    },
    [dispatch],
  );

  const onGpxLoadError = useCallback(
    (message: string) => {
      dispatch(
        toastsAdd({
          id: 'trackViewer.loadError',
          message,
          style: 'danger',
          timeout: 5000,
        }),
      );
    },
    [dispatch],
  );

  const handleGpxDrop = useGpxDropHandler(onGpxDrop, onGpxLoadError, m);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const pictureFiles = acceptedFiles.filter(
        (file) => file.type === 'image/jpeg',
      );

      if (pictureFiles.length) {
        dispatch(galleryShowUploadModal()); // if no user then it displays valuable error

        if (authenticated) {
          handlePicturesDrop(pictureFiles);
        }
      }

      const gpxFiles = acceptedFiles.filter((file) =>
        file.name.toLowerCase().endsWith('.gpx'),
      );

      if (gpxFiles.length) {
        handleGpxDrop(gpxFiles);
      }
    },
    [handlePicturesDrop, handleGpxDrop, dispatch, authenticated],
  );

  useShareFile(onDrop);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleDropzoneClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleDeleteClick = useCallback(() => {
    if (selection) {
      dispatch(deleteFeature(selection));
    }
  }, [dispatch, selection]);

  const embedToolDef = embed && toolDefinitions.find((td) => td.tool === tool);

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
          />
        )}

        <input {...getInputProps()} />

        <MapContainer
          zoomControl={false}
          attributionControl={false}
          maxZoom={20}
          whenCreated={setMap}
          center={{ lat, lng: lon }}
          zoom={zoom}
          style={{ cursor: mouseCursor }}
        >
          <div className="header">
            {/* {showInfoBar && language === 'sk' && !embed && (
          <div className="info-bar">
            <CloseButton onClick={handleInfoBarCloseClick} />
            {m?.main.p2}
          </div>
        )} */}
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
                  <SearchMenu
                    hidden={!showMenu}
                    preventShortcut={!!activeModal}
                  />
                )}
              </Panel>

              {showMenu && (!embed || tool) && (
                <Panel className="fm-toolbar">
                  {embed ? (
                    embedToolDef && (
                      <>
                        <FontAwesomeIcon icon={embedToolDef.icon} />{' '}
                        {m?.tools[embedToolDef.msgKey]}{' '}
                      </>
                    )
                  ) : (
                    <ToolsMenuButton />
                  )}
                  {tool === 'objects' && <ObjectsMenu />}
                  {tool === 'route-planner' && <RoutePlannerMenu />}
                  {tool &&
                    ['draw-lines', 'draw-points', 'draw-polygons'].includes(
                      tool,
                    ) && <DrawingMenu />}
                  {tool === 'track-viewer' && <TrackViewerMenu />}
                  {tool === 'changesets' && <ChangesetsMenu />}
                  {tool === 'photos' && <GalleryMenu />}
                  {tool === 'map-details' && <MapDetailsMenu />}
                  {tool === 'tracking' && <TrackingMenu />}
                  {tool === 'maps' && <MapsMenu />}{' '}
                  {canDelete && (
                    <Button
                      title={m?.general.delete}
                      onClick={handleDeleteClick}
                    >
                      <FontAwesomeIcon icon="trash" />
                      <span className="hidden-xs">
                        {' '}
                        {m?.general.delete} <kbd>Del</kbd>
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

          <ScaleControl imperial={false} position="bottomleft" />

          <Layers />

          {showMenu && showInteractiveLayer && (
            <>
              <SearchResults />
              <ObjectsResult />
              <RoutePlannerResult />
              <DrawingLinesResult />
              <LocationResult />
              <TrackViewerResult />
              <DrawingPointsResult />
              <ChangesetsResult />
              <TrackingResult />
            </>
          )}

          {showMenu && (
            <>
              {showGalleryPicker && <GalleryPicker />}
              <WikiLayer />
            </>
          )}

          {/* TODO should not be extra just because for position picking */}

          <GalleryResult />

          {activeModal === 'settings' && <Settings />}
          {activeModal &&
            [
              ...(isUserValidated ? ['tracking-my'] : []),
              'tracking-watched',
            ].includes(activeModal) && <AsyncTrackingModal />}
          {activeModal === 'embed' && <AsyncEmbedMapModal />}
          {activeModal === 'export-gpx' && <AsyncExportGpxModal />}
          {activeModal === 'export-pdf' && <AsyncExportPdfModal />}
          {activeModal === 'tips' && <AsyncTipsModal />}
          {activeModal === 'about' && <AsyncAboutModal />}
          {activeModal === 'supportUs' && <AsyncSupportUsModal />}
          {activeModal === 'legend' &&
            (mapType === 'X' ? (
              <AsyncLegendOutdoorModal />
            ) : (
              <AsyncLegendModal />
            ))}
          {activeModal === 'edit-label' && <AsyncDrawingEditLabelModal />}
          {activeModal === 'upload-track' && <AsyncTrackViewerUploadModal />}
          {showLoginModal && <AsyncLoginModal />}
          <GalleryModals />
        </MapContainer>
        {showElevationChart && <AsyncElevationChart />}
      </div>
    </>
  );
}
