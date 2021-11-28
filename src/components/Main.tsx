import { elevationChartClose } from 'fm3/actions/elevationChartActions';
import {
  galleryAddItem,
  GalleryItem,
  galleryMergeItem,
} from 'fm3/actions/galleryActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { mapRefocus } from 'fm3/actions/mapActions';
import { routePlannerToggleElevationChart } from 'fm3/actions/routePlannerActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import {
  trackViewerSetData,
  trackViewerSetTrackUID,
  trackViewerToggleElevationChart,
} from 'fm3/actions/trackViewerActions';
import { ChangesetsResult } from 'fm3/components/ChangesetsResult';
import { Copyright } from 'fm3/components/Copyright';
import { DrawingLinesResult } from 'fm3/components/DrawingLinesResult';
import { DrawingPointsResult } from 'fm3/components/DrawingPointsResult';
import { GalleryPicker } from 'fm3/components/gallery/GalleryPicker';
import { GalleryResult } from 'fm3/components/gallery/GalleryResult';
import { Layers } from 'fm3/components/Layers';
import { LocationResult } from 'fm3/components/LocationResult';
import { MapControls } from 'fm3/components/MapControls';
import { MapDetailsMenu } from 'fm3/components/MapDetailsMenu';
import { ObjectsResult } from 'fm3/components/ObjectsResult';
import { RoutePlannerResult } from 'fm3/components/RoutePlannerResult';
import { SearchMenu } from 'fm3/components/SearchMenu';
import { SearchResults } from 'fm3/components/SearchResults';
import { Toasts } from 'fm3/components/Toasts';
import { TrackingResult } from 'fm3/components/tracking/TrackingResult';
import { useGpxDropHandler } from 'fm3/hooks/useGpxDropHandler';
import { useMouseCursor } from 'fm3/hooks/useMouseCursor';
import { useScrollClasses } from 'fm3/hooks/useScrollClasses';
import { useShareFile } from 'fm3/hooks/useShareFile';
import { useMessages } from 'fm3/l10nInjector';
import { setMapLeafletElement } from 'fm3/leafletElementHolder';
import {
  drawingLinePolys,
  selectingModeSelector,
  showGalleryPickerSelector,
  trackGeojsonIsSuitableForElevationChart,
} from 'fm3/selectors/mainSelectors';
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
import { FaChartArea } from 'react-icons/fa';
import { MapContainer, ScaleControl } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { usePictureDropHandler } from '../hooks/usePictureDropHandler';
import fmLogo from '../images/freemap-logo-print.png';
import { AsyncComponent } from './AsyncComponent';
import { AsyncModal } from './AsyncModal';
import { DrawingPointsTool } from './DrawingPointsTool';
import { GalleryModals } from './gallery/GalleryModals';
import { HomeLocationPickingResult } from './HomeLocationPickingResult';
import { MainMenuButton } from './mainMenu/MainMenuButton';
import { MapContextMenu } from './MapContextMenu';
import { MapDetailsTool } from './MapDetailsTool';
import { MapsMenu } from './MapsMenu';
import { SelectionTool } from './SelectionTool';
import { ToolMenu } from './ToolMenu';
import { TrackingSelection } from './TrackingSelection';
import { useHtmlMeta } from './useHtmlMeta';
import { WikiLayer } from './WikiLayer';

const objectsMenuFactory = () => import('fm3/components/ObjectsMenu');

const routePlannerMenuFactory = () => import('fm3/components/RoutePlannerMenu');

const trackViewerMenuFactory = () => import('fm3/components/TrackViewerMenu');

const changesetsMenuFactory = () => import('fm3/components/ChangesetsMenu');

const drawingLineSelectionFactory = () => import('./DrawingLineSelection');

const drawingLinePointSelectionFactory = () =>
  import('./DrawingLinePointSelection');

const drawingPointSelectionFactory = () => import('./DrawingPointSelection');

const objectSelectionFactory = () => import('./ObjectSelection');

const galleryPositionPickingMenuFactory = () =>
  import('./gallery/GalleryPositionPickingMenu');

const galleryShowPositionMenuFactory = () =>
  import('./gallery/GalleryShowPositionMenu');

const homeLocationPickingMenuFactory = () =>
  import('./HomeLocationPickingMenu');

const adFactory = () => import('./Ad');

const elevationChartFactory = () => import('fm3/components/ElevationChart');

const drawingLinesToolFactory = () => import('./DrawingLinesTool');

const trackingModalFactory = () =>
  import('fm3/components/tracking/TrackingModal');

const accountModalFactory = () => import('fm3/components/AccountModal');

const mapSettingsModalFactory = () => import('./MapSettingsModal');

const embedMapModalFactory = () => import('fm3/components/EmbedMapModal');

const exportGpxModalFactory = () => import('fm3/components/ExportGpxModal');

const exportPdfModalFactory = () => import('fm3/components/ExportPdfModal');

const documentModalFactory = () => import('fm3/components/DocumentModal');

const aboutModalFactory = () => import('fm3/components/AboutModal');

const supportUsModalFactory = () =>
  import('fm3/components/supportUsModal/SupportUsModal');

const legendOutdoorModalFactory = () =>
  import('fm3/components/LegendOutdoorModal');

const legendModalFactory = () => import('fm3/components/LegendModal');

const drawingEditLabelModalFactory = () =>
  import('fm3/components/DrawingEditLabelModal');

const trackViewerUploadModalFactory = () =>
  import('fm3/components/TrackViewerUploadModal');

const loginModalFactory = () => import('fm3/components/LoginModal');

const mapsModalFactory = () => import('./MapsModal');

const removeAdsModalFactory = () => import('./RemoveAdsModal');

const galleryFilterModalFactory = () =>
  import('fm3/components/gallery/GalleryFilterModal');

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

  const showAds = useSelector(
    (state) =>
      !window.isRobot && !window.fmEmbedded && !state.auth.user?.isPremium,
  );

  const showElevationChart = useSelector(
    (state) => !!state.elevationChart.elevationProfilePoints,
  );

  const showGalleryPicker = useSelector(showGalleryPickerSelector);

  const showMenu = useSelector(
    (state) =>
      state.main.selectingHomeLocation === false &&
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
  });

  const isSelecting = useSelector(selectingModeSelector);

  const selectionMenu = showMenu ? selectionType : null;

  const scLogo = useScrollClasses('horizontal');

  const scMapControls = useScrollClasses('horizontal');

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

  const selectingHomeLocation = useSelector(
    (state) => state.main.selectingHomeLocation,
  );

  const documentKey = useSelector((state) => state.main.documentKey);

  const showPosition = useSelector((state) => state.gallery.showPosition);

  const pickingPosition = useSelector(
    (state) => state.gallery.pickingPositionForId !== null,
  );

  const trackGeojson = useSelector((state) => state.trackViewer.trackGeojson);

  const hasObjects = useSelector((state) => state.objects.objects.length > 0);

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

          {showMenu && showMapsMenu && <MapsMenu />}

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

          {showAds && <AsyncComponent factory={adFactory} />}
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

        <Copyright />
      </div>

      <div {...getRootProps()}>
        {isDragActive && <div className="fm-drag-to-map" />}

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
                        factory={() =>
                          import('fm3/components/TrackViewerResult')
                        }
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
          show={activeModal === 'export-gpx'}
          factory={exportGpxModalFactory}
        />

        <AsyncModal
          show={activeModal === 'export-pdf'}
          factory={exportPdfModalFactory}
        />

        <AsyncModal
          show={!activeModal && documentKey !== null}
          factory={documentModalFactory}
        />

        <AsyncModal
          show={activeModal === 'about'}
          factory={aboutModalFactory}
        />

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
          factory={drawingEditLabelModalFactory}
        />

        <AsyncModal
          show={activeModal === 'upload-track'}
          factory={trackViewerUploadModalFactory}
        />

        <AsyncModal
          show={activeModal === 'login'}
          factory={loginModalFactory}
        />

        <AsyncModal show={activeModal === 'maps'} factory={mapsModalFactory} />

        <AsyncModal
          show={activeModal === 'remove-ads'}
          factory={removeAdsModalFactory}
        />

        <AsyncModal
          show={activeModal === 'gallery-filter'}
          factory={galleryFilterModalFactory}
        />

        <GalleryModals />
      </div>
    </>
  );
}
