import Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MouseEvent,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Button, ButtonToolbar, Card } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { FaChartArea } from 'react-icons/fa';
import { MapContainer, ScaleControl } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { elevationChartClose } from '../actions/elevationChartActions.js';
import {
  galleryAddItem,
  GalleryItem,
  galleryMergeItem,
} from '../actions/galleryActions.js';
import { setActiveModal } from '../actions/mainActions.js';
import { mapRefocus } from '../actions/mapActions.js';
import { routePlannerToggleElevationChart } from '../actions/routePlannerActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import {
  trackViewerSetData,
  trackViewerSetTrackUID,
  trackViewerToggleElevationChart,
} from '../actions/trackViewerActions.js';
import { ChangesetsResult } from '../components/ChangesetsResult.js';
import { CopyrightButton } from '../components/CopyrightButton.js';
import { DrawingLinesResult } from '../components/DrawingLinesResult.js';
import { DrawingPointsResult } from '../components/DrawingPointsResult.js';
import { GalleryPicker } from '../components/gallery/GalleryPicker.js';
import { GalleryResult } from '../components/gallery/GalleryResult.js';
import { Layers } from '../components/Layers.js';
import { LocationResult } from '../components/LocationResult.js';
import { MapControls } from '../components/MapControls.js';
import { MapDetailsMenu } from '../components/MapDetailsMenu.js';
import { ObjectsResult } from '../components/ObjectsResult.js';
import { RoutePlannerResult } from '../components/RoutePlannerResult.js';
import { SearchMenu } from '../components/SearchMenu.js';
import { SearchResults } from '../components/SearchResults.js';
import { Toasts } from '../components/Toasts.js';
import { TrackingResult } from '../components/tracking/TrackingResult.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import { useGpxDropHandler } from '../hooks/useGpxDropHandler.js';
import { useMouseCursor } from '../hooks/useMouseCursor.js';
import { usePictureDropHandler } from '../hooks/usePictureDropHandler.js';
import { useScrollClasses } from '../hooks/useScrollClasses.js';
import { useShareFile } from '../hooks/useShareFile.js';
import fmLogo from '../images/freemap-logo-print.png';
import { useMessages } from '../l10nInjector.js';
import { setMapLeafletElement } from '../leafletElementHolder.js';
import {
  drawingLinePolys,
  selectingModeSelector,
  showGalleryPickerSelector,
  trackGeojsonIsSuitableForElevationChart,
} from '../selectors/mainSelectors.js';
import { AsyncComponent } from './AsyncComponent.js';
import { AsyncModal } from './AsyncModal.js';
import { DrawingPointsTool } from './DrawingPointsTool.js';
import { GalleryModals } from './gallery/GalleryModals.js';
import { HomeLocationPickingResult } from './HomeLocationPickingResult.js';
import { InfoBar } from './InfoBar.js';
import { MainMenuButton } from './mainMenu/MainMenuButton.js';
import { MapContextMenu } from './MapContextMenu.js';
import { MapDetailsTool } from './MapDetailsTool.js';
import { MapsMenu } from './MapsMenu.js';
import { SelectionTool } from './SelectionTool.js';
import { ToolMenu } from './ToolMenu.js';
import { TrackingSelection } from './TrackingSelection.js';
import { useHtmlMeta } from './useHtmlMeta.js';
import { WikiLayer } from './WikiLayer.js';

const objectsMenuFactory = () => import('./ObjectsMenu.js');

const routePlannerMenuFactory = () => import('./RoutePlannerMenu.js');

const trackViewerMenuFactory = () => import('./TrackViewerMenu.js');

const changesetsMenuFactory = () => import('./ChangesetsMenu.js');

const drawingLineSelectionFactory = () => import('./DrawingLineSelection.js');

const drawingLinePointSelectionFactory = () =>
  import('./DrawingLinePointSelection.js');

const drawingPointSelectionFactory = () => import('./DrawingPointSelection.js');

const objectSelectionFactory = () => import('./ObjectSelection.js');

const galleryPositionPickingMenuFactory = () =>
  import('./gallery/GalleryPositionPickingMenu.js');

const galleryShowPositionMenuFactory = () =>
  import('./gallery/GalleryShowPositionMenu.js');

const homeLocationPickingMenuFactory = () =>
  import('./HomeLocationPickingMenu.js');

const adFactory = () => import('./Ad.js');

const shadingControlFactory = () =>
  import('./parameterizedShading/ShadingControl.js');

const elevationChartFactory = () => import('./ElevationChart.js');

const drawingLinesToolFactory = () => import('./DrawingLinesTool.js');

const trackingModalFactory = () => import('./tracking/TrackingModal.js');

const accountModalFactory = () => import('./AccountModal.js');

const mapSettingsModalFactory = () => import('./MapSettingsModal.js');

const embedMapModalFactory = () => import('./EmbedMapModal.js');

const exportGpxModalFactory = () => import('./ExportMapFeaturesModal.js');

const exportMapModalFactory = () => import('./ExportMapModal.js');

const documentModalFactory = () => import('./DocumentModal.js');

const aboutModalFactory = () => import('./AboutModal.js');

const supportUsModalFactory = () =>
  import('./supportUsModal/SupportUsModal.js');

const legendOutdoorModalFactory = () => import('./LegendOutdoorModal.js');

const legendModalFactory = () => import('./LegendModal.js');

const drawingPropertiesModalFactory = () =>
  import('./DrawingPropertiesModal.js');

const trackViewerUploadModalFactory = () =>
  import('./TrackViewerUploadModal.js');

const loginModalFactory = () => import('./LoginModal.js');

const mapsModalFactory = () => import('./MapsModal.js');

const removeAdsModalFactory = () => import('./RemoveAdsModal.js');

const galleryFilterModalFactory = () =>
  import('./gallery/GalleryFilterModal.js');

const currentDrawingPropertiesModalFactory = () =>
  import('./CurrentDrawingPropertiesModal.js');

export function Main(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const lat = useAppSelector((state) => state.map.lat);

  const lon = useAppSelector((state) => state.map.lon);

  const zoom = useAppSelector((state) => state.map.zoom);

  const mapType = useAppSelector((state) => state.map.mapType);

  const hasParamShading = useAppSelector((state) =>
    state.map.overlays.includes('h'),
  );

  const showInteractiveLayer = useAppSelector(
    (state) => !state.map.overlays.includes('i'),
  );

  const selectionType = useAppSelector((state) => state.main.selection?.type);

  const tool = useAppSelector((state) => state.main.tool);

  const embedFeatures = useAppSelector((state) => state.main.embedFeatures);

  const activeModal = useAppSelector((state) => state.main.activeModal);

  const progress = useAppSelector((state) => !!state.main.progress.length);

  const authenticated = useAppSelector((state) => !!state.auth.user);

  const showAds = useAppSelector(
    (state) =>
      !process.env['PREVENT_ADS'] &&
      !window.isRobot &&
      !window.fmEmbedded &&
      !state.auth.user?.premiumExpiration,
  );

  const showElevationChart = useAppSelector(
    (state) => !!state.elevationChart.elevationProfilePoints,
  );

  const showGalleryPicker = useAppSelector(showGalleryPickerSelector);

  const showMenu = useAppSelector(
    (state) =>
      state.main.selectingHomeLocation === false &&
      !state.gallery.pickingPositionForId &&
      !state.gallery.showPosition,
  );

  const overlayPaneOpacity = useAppSelector(
    (state) => state.map.overlayPaneOpacity,
  );

  const language = useAppSelector((state) => state.l10n.language);

  const isUserValidated = useAppSelector((state) => state.auth.validated);

  const [map, setMap] = useState<Leaflet.Map | null>(null);

  useEffect(() => {
    setMapLeafletElement(map);
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

        const delta = 5 / Math.pow(2, zoom);

        if (
          zoom !== newZoom ||
          newLat - delta > lat ||
          newLat + delta < lat ||
          newLon - delta > lon ||
          newLon + delta < lon
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
        dispatch(setActiveModal('gallery-upload')); // if no user then it displays valuable error

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
    disabled: activeModal !== null,
  });

  const isSelecting = useAppSelector(selectingModeSelector);

  const selectionMenu = showMenu ? selectionType : null;

  const scLogo = useScrollClasses('horizontal');

  const scMapControls = useScrollClasses('horizontal');

  const drawingLines = useAppSelector(drawingLinePolys);

  const elevationChartActive = useAppSelector(
    (state) => !!state.elevationChart.elevationProfilePoints,
  );

  const trackFound = useAppSelector(trackGeojsonIsSuitableForElevationChart);

  const routeFound = useAppSelector(
    (state) => !!state.routePlanner.alternatives.length,
  );

  useHtmlMeta();

  const showMapsMenu = useAppSelector((state) => !!state.maps.activeMap);

  // prevents map click action if dropdown is open
  const handleMapWrapperClick = (e: MouseEvent) => {
    let el: EventTarget | null = e.target;

    while (el instanceof Element) {
      if (el.id === 'ctx') {
        // clicked inside context menu
        return;
      }

      el = el.parentElement;
    }

    if (document.querySelector('*[aria-expanded=true]') !== null) {
      e.stopPropagation();

      document.body.click();
    }
  };

  const selectingHomeLocation = useAppSelector(
    (state) => state.main.selectingHomeLocation,
  );

  const documentKey = useAppSelector((state) => state.main.documentKey);

  const showPosition = useAppSelector((state) => state.gallery.showPosition);

  const pickingPosition = useAppSelector(
    (state) => state.gallery.pickingPositionForId !== null,
  );

  const trackGeojson = useAppSelector(
    (state) => state.trackViewer.trackGeojson,
  );

  const hasObjects = useAppSelector(
    (state) => state.objects.objects.length > 0,
  );

  const askingCookieConsent = useAppSelector((state) =>
    state.toasts.toasts.some(
      (toast) => toast.messageKey === 'main.cookieConsent',
    ),
  );

  return (
    <>
      <style>
        {`.leaflet-overlay-pane { opacity: ${overlayPaneOpacity} }`}
      </style>

      {!window.fmHeadless && (
        <>
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
            {!askingCookieConsent && !window.fmEmbedded && <InfoBar />}

            <div className="menus">
              <div className="fm-ib-scroller fm-ib-scroller-top" ref={scLogo}>
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
                      preventShortcut={!!activeModal || !!documentKey}
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
                        onClick={() =>
                          dispatch(trackViewerToggleElevationChart())
                        }
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
                        className={trackFound ? 'ms-1' : ''}
                        variant="secondary"
                        onClick={() =>
                          dispatch(routePlannerToggleElevationChart())
                        }
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

              {/* tool menus; TODO put wrapper to separate component and use it directly in menu components */}

              {showMenu &&
                (!tool ? null : tool === 'objects' ? (
                  <AsyncComponent factory={objectsMenuFactory} />
                ) : tool === 'route-planner' ? (
                  <AsyncComponent factory={routePlannerMenuFactory} />
                ) : tool === 'track-viewer' ? (
                  <AsyncComponent factory={trackViewerMenuFactory} />
                ) : tool === 'changesets' ? (
                  <AsyncComponent factory={changesetsMenuFactory} />
                ) : tool === 'map-details' ? (
                  <MapDetailsMenu />
                ) : (
                  <ToolMenu />
                ))}

              {showMenu && showMapsMenu && !window.fmEmbedded && <MapsMenu />}

              {selectionMenu === 'draw-line-poly' ? (
                <AsyncComponent factory={drawingLineSelectionFactory} />
              ) : selectionMenu === 'line-point' ? (
                <AsyncComponent factory={drawingLinePointSelectionFactory} />
              ) : selectionMenu === 'draw-points' ? (
                <AsyncComponent factory={drawingPointSelectionFactory} />
              ) : selectionMenu === 'objects' ? (
                <AsyncComponent factory={objectSelectionFactory} />
              ) : selectionMenu === 'tracking' ? (
                <TrackingSelection />
              ) : null}

              {pickingPosition && (
                <AsyncComponent factory={galleryPositionPickingMenuFactory} />
              )}

              {showPosition && (
                <AsyncComponent factory={galleryShowPositionMenuFactory} />
              )}

              {selectingHomeLocation !== false && (
                <AsyncComponent factory={homeLocationPickingMenuFactory} />
              )}

              {showAds && !askingCookieConsent && (
                <AsyncComponent factory={adFactory} />
              )}

              {hasParamShading && (
                <div style={{ flexBasis: '100%', pointerEvents: 'none' }}>
                  <AsyncComponent factory={shadingControlFactory} />
                </div>
              )}
            </div>

            {showElevationChart && (
              <AsyncComponent factory={elevationChartFactory} />
            )}
          </div>

          <div className="fm-type-zoom-control">
            <div>
              <div
                className="fm-ib-scroller fm-ib-scroller-bottom"
                ref={scMapControls}
              >
                <div />

                <MapControls />
              </div>
            </div>

            <CopyrightButton />
          </div>

          <MapContextMenu />
        </>
      )}

      <div {...getRootProps()}>
        {isDragActive && <div className="fm-drag-to-map" />}

        <input {...getInputProps()} />

        {mapType[0] === 'V' && (
          <a
            href="https://www.maptiler.com"
            className="watermark"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://api.maptiler.com/resources/logo.svg"
              alt="MapTiler logo"
            />
          </a>
        )}

        <div onClickCapture={handleMapWrapperClick}>
          <MapContainer
            zoomControl={false}
            attributionControl={false}
            maxZoom={20}
            ref={setMap}
            center={{ lat, lng: lon }}
            zoom={zoom}
          >
            <ScaleControl imperial={false} position="bottomleft" />

            <Layers />

            {showMenu && (
              <>
                {tool === 'map-details' && <MapDetailsTool />}
                {tool === 'draw-points' && <DrawingPointsTool />}
                {drawingLines && (
                  <AsyncComponent factory={drawingLinesToolFactory} />
                )}
                {isSelecting && <SelectionTool />}

                {showInteractiveLayer && (
                  <>
                    <SearchResults />
                    {hasObjects && <ObjectsResult />}
                    <RoutePlannerResult />
                    <DrawingLinesResult />
                    <DrawingPointsResult />
                    <LocationResult />
                    {trackGeojson && (
                      <AsyncComponent
                        factory={() => import('./TrackViewerResult.js')}
                        trackGeojson={trackGeojson}
                      />
                    )}
                    <ChangesetsResult />
                    <TrackingResult />
                  </>
                )}

                {showGalleryPicker && <GalleryPicker />}
                <WikiLayer />
              </>
            )}

            {selectingHomeLocation !== false && <HomeLocationPickingResult />}

            {/* TODO should not be extra just because for position picking */}

            <GalleryResult />
          </MapContainer>
        </div>
      </div>

      <AsyncModal
        show={
          !!activeModal &&
          [
            ...(isUserValidated ? ['tracking-my'] : []),
            'tracking-watched',
          ].includes(activeModal)
        }
        factory={trackingModalFactory}
      />

      <AsyncModal
        show={activeModal === 'account'}
        factory={accountModalFactory}
      />

      <AsyncModal
        show={activeModal === 'mapSettings'}
        factory={mapSettingsModalFactory}
      />

      <AsyncModal
        show={activeModal === 'embed'}
        factory={embedMapModalFactory}
      />

      <AsyncModal
        show={activeModal === 'export-map-features'}
        factory={exportGpxModalFactory}
      />

      <AsyncModal
        show={activeModal === 'export-map'}
        factory={exportMapModalFactory}
      />

      <AsyncModal
        show={!activeModal && documentKey !== null}
        factory={documentModalFactory}
      />

      <AsyncModal show={activeModal === 'about'} factory={aboutModalFactory} />

      <AsyncModal
        show={activeModal === 'supportUs'}
        factory={supportUsModalFactory}
      />

      {mapType === 'X' ? (
        <AsyncModal
          show={activeModal === 'legend'}
          factory={legendOutdoorModalFactory}
        />
      ) : (
        <AsyncModal
          show={activeModal === 'legend'}
          factory={legendModalFactory}
        />
      )}

      <AsyncModal
        show={activeModal === 'edit-label'}
        factory={drawingPropertiesModalFactory}
      />

      <AsyncModal
        show={activeModal === 'upload-track'}
        factory={trackViewerUploadModalFactory}
      />

      <AsyncModal show={activeModal === 'login'} factory={loginModalFactory} />

      <AsyncModal show={activeModal === 'maps'} factory={mapsModalFactory} />

      <AsyncModal
        show={activeModal === 'remove-ads'}
        factory={removeAdsModalFactory}
      />

      <AsyncModal
        show={activeModal === 'gallery-filter'}
        factory={galleryFilterModalFactory}
      />

      <AsyncModal
        show={activeModal === 'drawing-properties'}
        factory={currentDrawingPropertiesModalFactory}
      />

      <GalleryModals />
    </>
  );
}
