import Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MouseEvent,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Button, ButtonToolbar } from 'react-bootstrap';
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
import { CopyrightButton } from '../components/CopyrightButton.js';
import { GalleryPicker } from '../components/gallery/GalleryPicker.js';
import { GalleryResult } from '../components/gallery/GalleryResult.js';
import { Layers } from '../components/Layers.js';
import { MapControls } from '../components/MapControls.js';
import { MapDetailsMenu } from '../components/MapDetailsMenu.js';
import { SearchMenu } from '../components/SearchMenu.js';
import { Toasts } from '../components/Toasts.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useGpxDropHandler } from '../hooks/useGpxDropHandler.js';
import { useMouseCursor } from '../hooks/useMouseCursor.js';
import { usePictureDropHandler } from '../hooks/usePictureDropHandler.js';
import { useScrollClasses } from '../hooks/useScrollClasses.js';
import { useShareFile } from '../hooks/useShareFile.js';
import fmLogo from '../images/freemap-logo-print.png';
import { useMessages } from '../l10nInjector.js';
import { setMapLeafletElement } from '../leafletElementHolder.js';
import { integratedLayerDefMap } from '../mapDefinitions.js';
import { isPremium } from '../premium.js';
import {
  showGalleryPickerSelector,
  trackGeojsonIsSuitableForElevationChart,
} from '../selectors/mainSelectors.js';
import { AsyncComponent } from './AsyncComponent.js';
import { AsyncModal } from './AsyncModal.js';
import { GalleryModals } from './gallery/GalleryModals.js';
import { HomeLocationPickingResult } from './HomeLocationPickingResult.js';
import { InfoBar } from './InfoBar.js';
import { LongPressTooltip } from './LongPressTooltip.js';
import { MainMenuButton } from './mainMenu/MainMenuButton.js';
import { MapContextMenu } from './MapContextMenu.js';
import { MapsMenu } from './MapsMenu.js';
import { Results } from './Results.js';
import RoutePointSelection from './RoutePointSelection.js';
import { SearchSelection } from './SearchSelection.js';
import { Toolbar } from './Toolbar.js';
import { ToolMenu } from './ToolMenu.js';
import { Tools } from './Tools.js';
import { TrackingSelection } from './TrackingSelection.js';
import { useHtmlMeta } from './useHtmlMeta.js';
import { WikiLayer } from './WikiLayer.js';

const objectsMenuFactory = () =>
  import(
    /* webpackChunkName: "objects-menu" */
    './ObjectsMenu.js'
  );

const routePlannerMenuFactory = () =>
  import(
    /* webpackChunkName: "route-planner-menu" */
    './RoutePlannerMenu.js'
  );

const trackViewerMenuFactory = () =>
  import(
    /* webpackChunkName: "track-viewer-menu" */
    './TrackViewerMenu.js'
  );

const changesetsMenuFactory = () =>
  import(
    /* webpackChunkName: "changesets-menu" */
    './ChangesetsMenu.js'
  );

const drawingMenuFactory = () =>
  import(
    /* webpackChunkName: "drawing-menu" */
    './DrawingMenu.js'
  );

const drawingLineSelectionFactory = () =>
  import(
    /* webpackChunkName: "drawing-line-selection" */
    './DrawingLineSelection.js'
  );

const drawingLinePointSelectionFactory = () =>
  import(
    /* webpackChunkName: "drawing-line-point-selection" */
    './DrawingLinePointSelection.js'
  );

const drawingPointSelectionFactory = () =>
  import(
    /* webpackChunkName: "drawing-point-selection" */
    './DrawingPointSelection.js'
  );

const objectSelectionFactory = () =>
  import(
    /* webpackChunkName: "object-selection" */
    './ObjectSelection.js'
  );

const galleryPositionPickingMenuFactory = () =>
  import(
    /* webpackChunkName: "gallery-position-picking-menu" */
    './gallery/GalleryPositionPickingMenu.js'
  );

const galleryShowPositionMenuFactory = () =>
  import(
    /* webpackChunkName: "gallery-show-position-menu" */
    './gallery/GalleryShowPositionMenu.js'
  );

const homeLocationPickingMenuFactory = () =>
  import(
    /* webpackChunkName: "home-location-picking-menu" */
    './HomeLocationPickingMenu.js'
  );

const galleryMenuFactory = () =>
  import(
    /* webpackChunkName: "gallery-menu" */
    './gallery/GalleryMenu.js'
  );

const adFactory = () =>
  import(
    /* webpackChunkName: "ad" */
    './Ad.js'
  );

const shadingControlFactory = () =>
  import(
    /* webpackChunkName: "shading-control" */
    './parameterizedShading/ShadingControl.js'
  );

const elevationChartFactory = () =>
  import(
    /* webpackChunkName: "elevation-chart" */
    './ElevationChart.js'
  );

const trackingModalFactory = () =>
  import(
    /* webpackChunkName: "tracking-modal" */
    './tracking/TrackingModal.js'
  );

const accountModalFactory = () =>
  import(
    /* webpackChunkName: "account-modal" */
    './AccountModal.js'
  );

const downloadMapModalFactory = () =>
  import(
    /* webpackChunkName: "download-map-modal" */
    './DownloadMapModal.js'
  );

const mapSettingsModalFactory = () =>
  import(
    /* webpackChunkName: "map-settings-modal" */
    './mapSettings/MapSettingsModal.js'
  );

const embedMapModalFactory = () =>
  import(
    /* webpackChunkName: "embed-map-modal" */
    './EmbedMapModal.js'
  );

const exportGpxModalFactory = () =>
  import(
    /* webpackChunkName: "export-map-features-modal" */
    './ExportMapFeaturesModal.js'
  );

const exportMapModalFactory = () =>
  import(
    /* webpackChunkName: "export-map-modal" */
    './ExportMapModal.js'
  );

const documentModalFactory = () =>
  import(
    /* webpackChunkName: "document-modal" */
    './DocumentModal.js'
  );

const aboutModalFactory = () =>
  import(
    /* webpackChunkName: "about-modal" */
    './AboutModal.js'
  );

const buyCreditModalFactory = () =>
  import(
    /* webpackChunkName: "buy-credits-modal" */
    './BuyCreditsModal.js'
  );

const supportUsModalFactory = () =>
  import(
    /* webpackChunkName: "support-us-modal" */
    './supportUsModal/SupportUsModal.js'
  );

const legendModalFactory = () =>
  import(
    /* webpackChunkName: "legend-modal" */
    './LegendModal.js'
  );

const currentDrawingPropertiesModalFactory = () =>
  import(
    /* webpackChunkName: "current-drawing-properties-modal" */
    './CurrentDrawingPropertiesModal.js'
  );

const trackViewerUploadModalFactory = () =>
  import(
    /* webpackChunkName: "track-viewer-upload-modal" */
    './TrackViewerUploadModal.js'
  );

const loginModalFactory = () =>
  import(
    /* webpackChunkName: "login-modal" */
    './LoginModal.js'
  );

const mapsModalFactory = () =>
  import(
    /* webpackChunkName: "maps-modal" */
    './MapsModal.js'
  );

const premiumActivationModalFactory = () =>
  import(
    /* webpackChunkName: "premium-activation-modal" */
    './PremiumActivationModal.js'
  );

const galleryFilterModalFactory = () =>
  import(
    /* webpackChunkName: "gallery-filter-modal" */
    './gallery/GalleryFilterModal.js'
  );

const predefinedDrawingPropertiesModalFactory = () =>
  import(
    /* webpackChunkName: "predefined-drawing-properties-modal" */
    './PredefinedDrawingPropertiesModal.js'
  );

export function Main(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const lat = useAppSelector((state) => state.map.lat);

  const lon = useAppSelector((state) => state.map.lon);

  const zoom = useAppSelector((state) => state.map.zoom);

  const layers = useAppSelector((state) => state.map.layers);

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
      !isPremium(state.auth.user),
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

  const showResults = useAppSelector(
    (state) => !state.map.layers.includes('i'),
  );

  const showPictures = useAppSelector((state) =>
    state.map.layers.includes('I'),
  );

  const language = useAppSelector((state) => state.l10n.language);

  const isUserValidated = useAppSelector((state) => state.auth.validated);

  const [map, setMap] = useState<Leaflet.Map | null>(null);

  useEffect(() => {
    setMapLeafletElement(map);
  }, [dispatch, map]);

  useMouseCursor(map?.getContainer());

  const handleLogoClick = useCallback(() => {
    if (window.fmEmbedded) {
      const params = new URLSearchParams(window.location.hash.slice(1));

      params.delete('embed');

      const url = new URL(window.location.href);

      url.hash = params.toString();

      window.open(url.toString(), 'freemap');
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

  const selectionMenu = showMenu ? selectionType : null;

  const scLogo = useScrollClasses('horizontal');

  const scMapControls = useScrollClasses('horizontal');

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

  const askingCookieConsent = useAppSelector((state) =>
    Object.values(state.toasts.toasts).some(
      (toast) =>
        'messageKey' in toast && toast.messageKey === 'main.cookieConsent',
    ),
  );

  const maxZoom = useAppSelector((state) => state.map.maxZoom);

  return (
    <>
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

          <div className="fm-header">
            {!askingCookieConsent && !window.fmEmbedded && <InfoBar />}

            <div className="fm-menus">
              <div className="fm-ib-scroller fm-ib-scroller-top" ref={scLogo}>
                <div />

                <Toolbar className="mt-2">
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
                </Toolbar>
              </div>

              {window.fmEmbedded && (trackFound || routeFound) && (
                <Toolbar className="mx-2 mt-2">
                  <ButtonToolbar>
                    {trackFound && (
                      <LongPressTooltip
                        breakpoint="sm"
                        label={m?.general.elevationProfile}
                      >
                        {({ label, labelClassName, props }) => (
                          <Button
                            variant="secondary"
                            active={elevationChartActive}
                            onClick={() =>
                              dispatch(trackViewerToggleElevationChart())
                            }
                            {...props}
                          >
                            <FaChartArea />
                            <span className={labelClassName}> {label}</span>
                          </Button>
                        )}
                      </LongPressTooltip>
                    )}

                    {routeFound && (
                      <LongPressTooltip
                        breakpoint="sm"
                        label={m?.general.elevationProfile}
                      >
                        {({ label, labelClassName, props }) => (
                          <Button
                            className={trackFound ? 'ms-1' : ''}
                            variant="secondary"
                            onClick={() =>
                              dispatch(routePlannerToggleElevationChart())
                            }
                            active={elevationChartActive}
                            {...props}
                          >
                            <FaChartArea />
                            <span className={labelClassName}> {label}</span>
                          </Button>
                        )}
                      </LongPressTooltip>
                    )}
                  </ButtonToolbar>
                </Toolbar>
              )}

              {showMenu && showMapsMenu && !window.fmEmbedded && <MapsMenu />}

              {showMenu && showPictures && (
                <AsyncComponent factory={galleryMenuFactory} />
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
                ) : tool === 'draw-lines' ||
                  tool === 'draw-points' ||
                  tool === 'draw-polygons' ? (
                  <AsyncComponent factory={drawingMenuFactory} />
                ) : tool === 'map-details' ? (
                  <MapDetailsMenu />
                ) : (
                  <ToolMenu />
                ))}

              {selectionMenu === 'search' ? (
                <SearchSelection />
              ) : selectionMenu === 'draw-line-poly' ? (
                <AsyncComponent factory={drawingLineSelectionFactory} />
              ) : selectionMenu === 'line-point' ? (
                <AsyncComponent factory={drawingLinePointSelectionFactory} />
              ) : selectionMenu === 'draw-points' ? (
                <AsyncComponent factory={drawingPointSelectionFactory} />
              ) : selectionMenu === 'objects' ? (
                <AsyncComponent factory={objectSelectionFactory} />
              ) : selectionMenu === 'tracking' ? (
                <TrackingSelection />
              ) : selectionMenu === 'route-point' ? (
                <RoutePointSelection />
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

              {showAds && !askingCookieConsent && !showElevationChart && (
                <AsyncComponent factory={adFactory} />
              )}

              {layers.some(
                (layer) =>
                  integratedLayerDefMap[layer]?.technology ===
                  'parametricShading',
              ) && (
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

        {layers.some((layer) => layer[0] === 'V') && (
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
            maxZoom={maxZoom}
            key={maxZoom}
            ref={setMap}
            center={{ lat, lng: lon }}
            zoom={zoom}
            wheelPxPerZoomLevel={100}
          >
            <ScaleControl imperial={false} position="bottomleft" />

            <Layers />

            <Tools />

            {showMenu && showResults && <Results />}

            {showMenu && <WikiLayer />}

            {showGalleryPicker && <GalleryPicker />}

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
        show={activeModal === 'download-map'}
        factory={downloadMapModalFactory}
      />

      <AsyncModal
        show={activeModal === 'map-settings'}
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
        show={activeModal === 'buy-credits'}
        factory={buyCreditModalFactory}
      />

      <AsyncModal
        show={activeModal === 'support-us'}
        factory={supportUsModalFactory}
      />

      <AsyncModal
        show={activeModal === 'legend'}
        factory={legendModalFactory}
      />

      <AsyncModal
        show={activeModal === 'current-drawing-properties'}
        factory={currentDrawingPropertiesModalFactory}
      />

      <AsyncModal
        show={activeModal === 'upload-track'}
        factory={trackViewerUploadModalFactory}
      />

      <AsyncModal show={activeModal === 'login'} factory={loginModalFactory} />

      <AsyncModal show={activeModal === 'maps'} factory={mapsModalFactory} />

      <AsyncModal
        show={activeModal === 'premium'}
        factory={premiumActivationModalFactory}
      />

      <AsyncModal
        show={activeModal === 'gallery-filter'}
        factory={galleryFilterModalFactory}
      />

      <AsyncModal
        show={activeModal === 'drawing-properties'}
        factory={predefinedDrawingPropertiesModalFactory}
      />

      <GalleryModals />
    </>
  );
}
