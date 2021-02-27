import { elevationChartClose } from 'fm3/actions/elevationChartActions';
import {
  galleryAddItem,
  GalleryItem,
  galleryMergeItem,
  galleryShowUploadModal,
} from 'fm3/actions/galleryActions';
import { setActiveModal, setTool } from 'fm3/actions/mainActions';
import { mapRefocus } from 'fm3/actions/mapActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import {
  trackViewerSetData,
  trackViewerSetTrackUID,
} from 'fm3/actions/trackViewerActions';
import {
  AsyncAboutModal,
  AsyncDrawingEditLabelModal,
  AsyncElevationChart,
  AsyncEmbedMapModal,
  AsyncExportGpxModal,
  AsyncExportPdfModal,
  AsyncLegendModal,
  AsyncLegendOutdoorModal,
  AsyncLoginModal,
  AsyncSettingsModal,
  AsyncSupportUsModal,
  AsyncTipsModal,
  AsyncTrackingModal,
  AsyncTrackViewerUploadModal,
} from 'fm3/components/AsyncComponents';
import { ChangesetsMenu } from 'fm3/components/ChangesetsMenu';
import { ChangesetsResult } from 'fm3/components/ChangesetsResult';
import { Copyright } from 'fm3/components/Copyright';
import { DrawingLineSelection } from 'fm3/components/DrawingLineSelection';
import { DrawingLinesResult } from 'fm3/components/DrawingLinesResult';
import { DrawingPointSelection } from 'fm3/components/DrawingPointSelection';
import { DrawingPointsResult } from 'fm3/components/DrawingPointsResult';
import { GalleryPicker } from 'fm3/components/gallery/GalleryPicker';
import { GalleryPositionPickingMenu } from 'fm3/components/gallery/GalleryPositionPickingMenu';
import { GalleryResult } from 'fm3/components/gallery/GalleryResult';
import { GalleryShowPositionMenu } from 'fm3/components/gallery/GalleryShowPositionMenu';
import { HomeLocationPickingMenu } from 'fm3/components/HomeLocationPickingMenu';
import { Layers } from 'fm3/components/Layers';
import { LocationResult } from 'fm3/components/LocationResult';
import { MapControls } from 'fm3/components/MapControls';
import { MapDetailsMenu } from 'fm3/components/MapDetailsMenu';
import { ObjectsMenu } from 'fm3/components/ObjectsMenu';
import { ObjectsResult } from 'fm3/components/ObjectsResult';
import { RoutePlannerMenu } from 'fm3/components/RoutePlannerMenu';
import { RoutePlannerResult } from 'fm3/components/RoutePlannerResult';
import { SearchMenu } from 'fm3/components/SearchMenu';
import { SearchResults } from 'fm3/components/SearchResults';
import { Toasts } from 'fm3/components/Toasts';
import { TrackingResult } from 'fm3/components/tracking/TrackingResult';
import { TrackViewerMenu } from 'fm3/components/TrackViewerMenu';
import { TrackViewerResult } from 'fm3/components/TrackViewerResult';
import { useGpxDropHandler } from 'fm3/hooks/gpxDropHandlerHook';
import { useScrollClasses } from 'fm3/hooks/scrollClassesHook';
import { useShareFile } from 'fm3/hooks/shareFileHook';
import { useMessages } from 'fm3/l10nInjector';
import { setMapLeafletElement } from 'fm3/leafletElementHolder';
import {
  mouseCursorSelector,
  selectingModeSelector,
  showGalleryPickerSelector,
} from 'fm3/selectors/mainSelectors';
import { RootState } from 'fm3/storeCreator';
import { toolDefinitions } from 'fm3/toolDefinitions';
import Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MouseEvent,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Card from 'react-bootstrap/Card';
import CloseButton from 'react-bootstrap/CloseButton';
import { useDropzone } from 'react-dropzone';
import { FaTimes } from 'react-icons/fa';
import { MapContainer, ScaleControl } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { usePictureDropHandler } from '../hooks/pictureDropHandlerHook';
import fmLogo from '../images/freemap-logo-print.png';
import { DrawingLinesTool } from './DrawingLinesTool';
import { DrawingPointsTool } from './DrawingPointsTool';
import { GalleryModals } from './gallery/GalleryModals';
import { MapDetailsTool } from './MapDetailsTool';
import { MapsMenu } from './MapsMenu';
import { MoreMenuButton } from './MoreMenuButton';
import { ObjectSelection } from './ObjectSelection';
import { SelectionTool } from './SelectionTool';
import { TrackingSelection } from './TrackingSelection';
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

  const selectionType = useSelector(
    (state: RootState) => state.main.selection?.type,
  );

  const tool = useSelector((state: RootState) => state.main.tool);

  const embedFeatures = useSelector(
    (state: RootState) => state.main.embedFeatures,
  );

  const activeModal = useSelector((state: RootState) => state.main.activeModal);

  const progress = useSelector(
    (state: RootState) => !!state.main.progress.length,
  );

  const mouseCursor = useSelector(mouseCursorSelector);

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

  const [showInfoBar, setShowInfoBar] = useState(true);

  const [map, setMap] = useState<Leaflet.Map | null>(null);

  useEffect(() => {
    setMapLeafletElement(map);
  }, [map]);

  useEffect(() => {
    const style = map?.getContainer().style;

    if (style) {
      style.cursor = mouseCursor;
    }
  }, [map, mouseCursor]);

  useEffect(() => {
    if (!map) {
      return;
    }

    const m = map;

    let t: number | undefined;

    function handleMapMoveEnd() {
      if (t) {
        window.clearTimeout(t);
      }

      t = window.setTimeout(() => {
        const { lat: newLat, lng: newLon } = m.getCenter();

        const newZoom = m.getZoom();

        if (
          ([
            [lat, newLat],
            [lon, newLon],
            [zoom, newZoom],
          ] as const).some(([a, b]) => a.toFixed(6) !== b.toFixed(6))
        ) {
          dispatch(mapRefocus({ lat: newLat, lon: newLon, zoom: newZoom }));
        }
      }, 250);
    }

    m.on('moveend', handleMapMoveEnd);

    return () => {
      m.off('moveend', handleMapMoveEnd);

      if (t) {
        window.clearTimeout(t);
      }
    };
  }, [dispatch, lat, lon, map, zoom]);

  const handleLogoClick = useCallback(() => {
    if (embed) {
      window.open(window.location.href, '_blank');
    } else {
      dispatch(
        mapRefocus({
          lat: 48.70714,
          lon: 19.4995,
          zoom: 8,
          gpsTracked: false,
        }),
      );
    }
  }, [dispatch]);

  const handleInfoBarCloseClick = useCallback(() => {
    setShowInfoBar(false);
  }, [setShowInfoBar]);

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

  const handleDropzoneClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
  }, []);

  // this is workaround to prevent map click events if popper is active (Overlay is shown)
  useEffect(() => {
    const mo = new MutationObserver(() => {
      document.body.classList.toggle(
        'fm-overlay-backdrop-enable',
        document.querySelector('*[data-popper-reference-hidden=false]') !==
          null,
      );
    });

    mo.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-popper-reference-hidden'],
    });

    return () => {
      mo.disconnect();
    };
  }, []);

  const toolDef = tool && toolDefinitions.find((td) => td.tool === tool);

  const isSelecting = useSelector(selectingModeSelector);

  const selectionMenu = showMenu ? selectionType : null;

  const sc1 = useScrollClasses('horizontal');

  const sc2 = useScrollClasses('horizontal');

  const sc3 = useScrollClasses('horizontal');

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
        className="d-none"
      />

      <Toasts />

      <div className="header">
        {showInfoBar && language === 'sk' && !embed && (
          <div className="info-bar">
            <CloseButton onClick={handleInfoBarCloseClick} />
            {m?.main.p2?.()}
          </div>
        )}
        <div className="menus">
          <div className="fm-ib-scroller fm-ib-scroller-top" ref={sc2}>
            <div />

            <Card className="fm-toolbar mx-2 mt-2">
              <Button
                id="freemap-logo"
                className={progress ? 'in-progress' : 'idle'}
                onClick={handleLogoClick}
              />
              {!embed && showMenu && <MoreMenuButton />}
              {(!embed || embedFeatures.includes('search')) && (
                <SearchMenu
                  hidden={!showMenu}
                  preventShortcut={!!activeModal}
                />
              )}
            </Card>
          </div>

          {/* tool menus */}
          {showMenu && tool && (
            <div className="fm-ib-scroller fm-ib-scroller-top" ref={sc1}>
              <div />

              <Card className="fm-toolbar mx-2 mt-2">
                <ButtonToolbar>
                  {toolDef && (
                    <span className="align-self-center ml-1 mr-2">
                      {toolDef.icon}
                      <span className="d-none d-sm-inline">
                        {' '}
                        {m?.tools[toolDef.msgKey]}
                      </span>
                    </span>
                  )}
                  <Button
                    className="ml-1"
                    variant="light"
                    // size="sm"
                    onClick={() => dispatch(setTool(null))}
                    title={m?.general.close + ' [Esc]'}
                  >
                    <FaTimes />
                  </Button>
                  {tool === 'objects' && <ObjectsMenu />}
                  {tool === 'route-planner' && <RoutePlannerMenu />}
                  {tool === 'track-viewer' && <TrackViewerMenu />}
                  {tool === 'changesets' && <ChangesetsMenu />}
                  {tool === 'map-details' && <MapDetailsMenu />}
                  {tool === 'maps' && <MapsMenu />}
                </ButtonToolbar>
              </Card>
            </div>
          )}

          {/* selections */}
          {selectionMenu === 'draw-line-poly' && <DrawingLineSelection />}
          {selectionMenu === 'draw-points' && <DrawingPointSelection />}
          {selectionMenu === 'objects' && <ObjectSelection />}
          {selectionMenu === 'tracking' && <TrackingSelection />}

          <GalleryPositionPickingMenu />
          <GalleryShowPositionMenu />
          <HomeLocationPickingMenu />
        </div>
      </div>

      <div className="fm-type-zoom-control">
        <div>
          <div className="fm-ib-scroller fm-ib-scroller-bottom" ref={sc3}>
            <div />
            <MapControls />
          </div>
        </div>
        <Copyright />
      </div>

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
        >
          <ScaleControl imperial={false} position="bottomleft" />

          <Layers />

          {showMenu && (
            <>
              {tool === 'map-details' && <MapDetailsTool />}
              {tool === 'draw-points' && <DrawingPointsTool />}
              {(tool === 'draw-lines' || tool === 'draw-polygons') && (
                <DrawingLinesTool />
              )}
              {isSelecting && <SelectionTool />}

              {showInteractiveLayer && (
                <>
                  <SearchResults />
                  <ObjectsResult />
                  <RoutePlannerResult />
                  <DrawingLinesResult />
                  <DrawingPointsResult />
                  <LocationResult />
                  <TrackViewerResult />
                  <ChangesetsResult />
                  <TrackingResult />
                </>
              )}

              {showGalleryPicker && <GalleryPicker />}
              <WikiLayer />
            </>
          )}

          {/* TODO should not be extra just because for position picking */}

          <GalleryResult />

          <AsyncSettingsModal show={activeModal === 'settings'} />
          <AsyncTrackingModal
            show={
              !!activeModal &&
              [
                ...(isUserValidated ? ['tracking-my'] : []),
                'tracking-watched',
              ].includes(activeModal)
            }
          />
          <AsyncEmbedMapModal show={activeModal === 'embed'} />
          <AsyncExportGpxModal show={activeModal === 'export-gpx'} />
          <AsyncExportPdfModal show={activeModal === 'export-pdf'} />
          <AsyncTipsModal show={activeModal === 'tips'} />
          <AsyncAboutModal show={activeModal === 'about'} />
          <AsyncSupportUsModal show={activeModal === 'supportUs'} />
          {mapType === 'X' ? (
            <AsyncLegendOutdoorModal show={activeModal === 'legend'} />
          ) : (
            <AsyncLegendModal show={activeModal === 'legend'} />
          )}
          <AsyncDrawingEditLabelModal show={activeModal === 'edit-label'} />
          <AsyncTrackViewerUploadModal show={activeModal === 'upload-track'} />
          <AsyncLoginModal show={showLoginModal} />
          <GalleryModals />
        </MapContainer>
        {showElevationChart && <AsyncElevationChart />}
      </div>
      <div className="fm-overlay-backdrop" />
    </>
  );
}
