import { elevationChartClose } from 'fm3/actions/elevationChartActions';
import {
  galleryAddItem,
  GalleryItem,
  galleryMergeItem,
  galleryShowUploadModal,
} from 'fm3/actions/galleryActions';
import { setActiveModal, setTool } from 'fm3/actions/mainActions';
import { mapRefocus, mapSetLeafletReady } from 'fm3/actions/mapActions';
import { routePlannerToggleElevationChart } from 'fm3/actions/routePlannerActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import {
  trackViewerSetData,
  trackViewerSetTrackUID,
  trackViewerToggleElevationChart,
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
import { useMouseCursor } from 'fm3/hooks/mouseCursorHook';
import { useScrollClasses } from 'fm3/hooks/scrollClassesHook';
import { useShareFile } from 'fm3/hooks/shareFileHook';
import { useMessages } from 'fm3/l10nInjector';
import { setMapLeafletElement } from 'fm3/leafletElementHolder';
import {
  drawingLinePolys,
  selectingModeSelector,
  showGalleryPickerSelector,
  trackGeojsonIsSuitableForElevationChart,
} from 'fm3/selectors/mainSelectors';
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
import { FaChartArea, FaTimes } from 'react-icons/fa';
import { MapContainer, ScaleControl } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { usePictureDropHandler } from '../hooks/pictureDropHandlerHook';
import fmLogo from '../images/freemap-logo-print.png';
import { DrawingLinePointSelection } from './DrawingLinePointSelection';
import { DrawingLinesTool } from './DrawingLinesTool';
import { DrawingPointsTool } from './DrawingPointsTool';
import { GalleryModals } from './gallery/GalleryModals';
import { MainMenuButton } from './mainMenu/MainMenuButton';
import { MapContextMenu } from './MapContextMenu';
import { MapDetailsTool } from './MapDetailsTool';
import { MapsMenu } from './MapsMenu';
import { MapsModal } from './MapsModal';
import { ObjectSelection } from './ObjectSelection';
import { SelectionTool } from './SelectionTool';
import { TrackingSelection } from './TrackingSelection';
import { useHtmlMeta } from './useHtmlMeta';
import { WikiLayer } from './WikiLayer';

export function Main(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const lat = useSelector((state) => state.map.lat);

  const lon = useSelector((state) => state.map.lon);

  const zoom = useSelector((state) => state.map.zoom);

  const mapType = useSelector((state) => state.map.mapType);

  const showInteractiveLayer = useSelector(
    (state) => !state.map.overlays.includes('i'),
  );

  const selectionType = useSelector((state) => state.main.selection?.type);

  const tool = useSelector((state) => state.main.tool);

  const embedFeatures = useSelector((state) => state.main.embedFeatures);

  const activeModal = useSelector((state) => state.main.activeModal);

  const progress = useSelector((state) => !!state.main.progress.length);

  const authenticated = useSelector((state) => !!state.auth.user);

  const showElevationChart = useSelector(
    (state) => !!state.elevationChart.elevationProfilePoints,
  );

  const showGalleryPicker = useSelector((state) =>
    showGalleryPickerSelector(state),
  );

  const showLoginModal = useSelector((state) => state.auth.chooseLoginMethod);

  const showMenu = useSelector(
    (state) =>
      !state.main.selectingHomeLocation &&
      !state.gallery.pickingPositionForId &&
      !state.gallery.showPosition,
  );

  const overlayPaneOpacity = useSelector(
    (state) => state.map.overlayPaneOpacity,
  );

  const language = useSelector((state) => state.l10n.language);

  const isUserValidated = useSelector((state) => state.auth.validated);

  const [showInfoBar, setShowInfoBar] = useState(true);

  const [map, setMap] = useState<Leaflet.Map | null>(null);

  useEffect(() => {
    setMapLeafletElement(map);

    dispatch(mapSetLeafletReady(map !== null));
  }, [dispatch, map]);

  useMouseCursor(map?.getContainer());

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
          (
            [
              [lat, newLat],
              [lon, newLon],
              [zoom, newZoom],
            ] as const
          ).some(([a, b]) => a.toFixed(6) !== b.toFixed(6))
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
    if (window.fmEmbedded) {
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  const toolDef = tool && toolDefinitions.find((td) => td.tool === tool);

  const isSelecting = useSelector(selectingModeSelector);

  const selectionMenu = showMenu ? selectionType : null;

  const sc1 = useScrollClasses('horizontal');

  const sc2 = useScrollClasses('horizontal');

  const sc3 = useScrollClasses('horizontal');

  const sc4 = useScrollClasses('horizontal');

  const drawingLines = useSelector(drawingLinePolys);

  const YellowBar = m?.main.YellowBar;

  const elevationChartActive = useSelector(
    (state) => !!state.elevationChart.trackGeojson,
  );

  const trackFound = useSelector(trackGeojsonIsSuitableForElevationChart);

  const routeFound = useSelector(
    (state) => !!state.routePlanner.alternatives.length,
  );

  useHtmlMeta();

  const showMapsMenu = useSelector(
    (state) => state.maps.id !== undefined && state.maps.name !== undefined,
  );

  // prevents map click action if popper is open
  const handleMapWrapperClick = (e: MouseEvent) => {
    let el: EventTarget | null = e.target;

    while (el instanceof Element) {
      if (el.id === 'ctx') {
        // clicked inside context menu
        return;
      }

      el = el.parentElement;
    }

    if (
      document.querySelector('*[data-popper-reference-hidden=false]') !== null
    ) {
      e.stopPropagation();

      document.body.click();
    }
  };

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
        {YellowBar && showInfoBar && language === 'sk' && !window.fmEmbedded && (
          <div className="info-bar">
            <CloseButton onClick={handleInfoBarCloseClick} />
            <YellowBar />
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
              {!window.fmEmbedded && showMenu && <MainMenuButton />}
              {(!window.fmEmbedded || embedFeatures.includes('search')) && (
                <SearchMenu
                  hidden={!showMenu}
                  preventShortcut={!!activeModal}
                />
              )}
            </Card>
          </div>

          {window.fmEmbedded && (trackFound || routeFound) && (
            <Card className="fm-toolbar mx-2 mt-2">
              <ButtonToolbar>
                {trackFound && (
                  <Button
                    variant="secondary"
                    active={elevationChartActive}
                    onClick={() => dispatch(trackViewerToggleElevationChart())}
                  >
                    <FaChartArea />
                    <span className="d-none d-sm-inline">
                      {' '}
                      {m?.general.elevationProfile}
                    </span>
                  </Button>
                )}
                {routeFound && (
                  <Button
                    className={trackFound ? 'ml-1' : ''}
                    variant="secondary"
                    onClick={() => dispatch(routePlannerToggleElevationChart())}
                    active={elevationChartActive}
                    title={m?.general.elevationProfile ?? '…'}
                  >
                    <FaChartArea />
                    <span className="d-none d-sm-inline">
                      {' '}
                      {m?.general.elevationProfile ?? '…'}
                    </span>
                  </Button>
                )}
              </ButtonToolbar>
            </Card>
          )}

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
                </ButtonToolbar>
              </Card>
            </div>
          )}

          {showMenu && showMapsMenu && (
            <div className="fm-ib-scroller fm-ib-scroller-top" ref={sc4}>
              <div />
              <Card className="fm-toolbar mx-2 mt-2">
                <ButtonToolbar>
                  <MapsMenu />
                </ButtonToolbar>
              </Card>
            </div>
          )}

          {/* selections */}
          {selectionMenu === 'draw-line-poly' && <DrawingLineSelection />}
          {selectionMenu === 'line-point' && <DrawingLinePointSelection />}
          {selectionMenu === 'draw-points' && <DrawingPointSelection />}
          {selectionMenu === 'objects' && <ObjectSelection />}
          {selectionMenu === 'tracking' && <TrackingSelection />}

          <GalleryPositionPickingMenu />
          <GalleryShowPositionMenu />
          <HomeLocationPickingMenu />
        </div>
        {showElevationChart && <AsyncElevationChart />}
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

      <div {...getRootProps()}>
        {isDragActive && (
          <div
            // TODO as class
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

        <div onClickCapture={handleMapWrapperClick}>
          <MapContainer
            zoomControl={false}
            attributionControl={false}
            maxZoom={20}
            whenCreated={setMap}
            center={{ lat, lng: lon }}
            zoom={zoom}
          >
            {!window.fmEmbedded && <MapContextMenu />}

            <ScaleControl imperial={false} position="bottomleft" />

            <Layers />

            {showMenu && (
              <>
                {tool === 'map-details' && <MapDetailsTool />}
                {tool === 'draw-points' && <DrawingPointsTool />}
                {drawingLines && <DrawingLinesTool />}
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
          </MapContainer>
        </div>

        <AsyncTrackingModal
          show={
            !!activeModal &&
            [
              ...(isUserValidated ? ['tracking-my'] : []),
              'tracking-watched',
            ].includes(activeModal)
          }
        />

        <AsyncSettingsModal show={activeModal === 'settings'} />
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
        <MapsModal show={activeModal === 'maps'} />
        <GalleryModals />
      </div>
    </>
  );
}
