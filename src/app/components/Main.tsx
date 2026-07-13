import { GalleryModals } from '@features/gallery/components/GalleryModals.js';
import { GalleryPicker } from '@features/gallery/components/GalleryPicker.js';
import { GalleryResult } from '@features/gallery/components/GalleryResult.js';
import { usePictureDropHandler } from '@features/gallery/hooks/usePictureDropHandler.js';
import {
  type GalleryItem,
  galleryAddItem,
  galleryMergeItem,
} from '@features/gallery/model/actions.js';
import { HomeLocationPickingResult } from '@features/homeLocation/components/HomeLocationPickingResult.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { MainMenuButton } from '@features/mainMenu/components/MainMenuButton.js';
import { TheMap } from '@features/map/components/Map.js';
import { useMap } from '@features/map/hooks/useMap.js';
import { mapRefocus } from '@features/map/model/actions.js';
import { MapAreaSelectionResult } from '@features/mapArea/components/MapAreaSelectionResult.js';
import { MapDetailsMenu } from '@features/mapDetails/components/MapDetailsMenu.js';
import { MyMapsMenu } from '@features/myMaps/components/MyMapsMenu.js';
import { isPremium } from '@features/premium/premium.js';
import RouteLegSelection from '@features/routePlanner/components/RouteLegSelection.js';
import RoutePointSelection from '@features/routePlanner/components/RoutePointSelection.js';
import { routePlannerToggleElevationChart } from '@features/routePlanner/model/actions.js';
import { SearchMenu } from '@features/search/components/SearchMenu.js';
import { SearchSelection } from '@features/search/components/SearchSelection.js';
import { Toasts } from '@features/toasts/components/Toasts.js';
import { TrackingSelection } from '@features/tracking/components/TrackingSelection.js';
import { useLoadTrackFiles } from '@features/trackViewer/hooks/useLoadTrackFiles.js';
import { trackViewerToggleElevationChart } from '@features/trackViewer/model/actions.js';
import { WikiLayer } from '@features/wiki/components/WikiLayer.js';
import { AsyncModal } from '@shared/components/AsyncModal.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import { useShareFile } from '@shared/hooks/useShareFile.js';
import { integratedLayerDefMap } from '@shared/mapDefinitions.js';
import { isDrawTool } from '@shared/toolDefinitions.js';
import fmLogo from '@/images/freemap-logo-print.png';
import 'leaflet/dist/leaflet.css';
import clsx from 'clsx';
import { type MouseEvent, type ReactElement, useCallback } from 'react';
import { Button, ButtonToolbar } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { FaChartArea } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useMouseCursor } from '../hooks/useMouseCursor.js';
import { setActiveModal } from '../store/actions.js';
import {
  askingCookieConsentSelector,
  showGalleryPickerSelector,
  toolsSelector,
  trackGeojsonIsSuitableForElevationChart,
} from '../store/selectors.js';
import { AsyncComponent } from './AsyncComponent.js';
import { CopyrightButton } from './CopyrightButton.js';
import { InfoBar } from './InfoBar.js';
import { Layers } from './Layers.js';
import classes from './Main.module.css';
import { MapContextMenu } from './MapContextMenu.js';
import { MapControls } from './MapControls.js';
import { Results } from './Results.js';
import { Tools } from './Tools.js';
import { useHtmlMeta } from './useHtmlMeta.js';

const objectsMenuFactory = () =>
  import(
    /* webpackChunkName: "objects-menu" */
    '@features/objects/components/ObjectsMenu.js'
  );

const routePlannerMenuFactory = () =>
  import(
    /* webpackChunkName: "route-planner-menu" */
    '@features/routePlanner/components/RoutePlannerMenu.js'
  );

const trackViewerMenuFactory = () =>
  import(
    /* webpackChunkName: "track-viewer-menu" */
    '@features/trackViewer/components/TrackViewerMenu.js'
  );

const changesetsMenuFactory = () =>
  import(
    /* webpackChunkName: "changesets-menu" */
    '@features/changesets/components/ChangesetsMenu.js'
  );

const trackingMenuFactory = () =>
  import(
    /* webpackChunkName: "tracking-menu" */
    '@features/tracking/components/TrackingMenu.js'
  );

const drawingMenuFactory = () =>
  import(
    /* webpackChunkName: "drawing-menu" */
    '@features/drawing/components/DrawingMenu.js'
  );

const drawingLineSelectionFactory = () =>
  import(
    /* webpackChunkName: "drawing-line-selection" */
    '@features/drawing/components/DrawingLineSelection.js'
  );

const drawingLinePointSelectionFactory = () =>
  import(
    /* webpackChunkName: "drawing-line-point-selection" */
    '@features/drawing/components/DrawingLinePointSelection.js'
  );

const drawingPointSelectionFactory = () =>
  import(
    /* webpackChunkName: "drawing-point-selection" */
    '@features/drawing/components/DrawingPointSelection.js'
  );

const objectSelectionFactory = () =>
  import(
    /* webpackChunkName: "object-selection" */
    '@features/objects/components/ObjectSelection.js'
  );

const galleryPositionPickingMenuFactory = () =>
  import(
    /* webpackChunkName: "gallery-position-picking-menu" */
    '@features/gallery/components/GalleryPositionPickingMenu.js'
  );

const galleryShowPositionMenuFactory = () =>
  import(
    /* webpackChunkName: "gallery-show-position-menu" */
    '@features/gallery/components/GalleryShowPositionMenu.js'
  );

const homeLocationPickingMenuFactory = () =>
  import(
    /* webpackChunkName: "home-location-picking-menu" */
    '@features/homeLocation/components/HomeLocationPickingMenu.js'
  );

const mapAreaSelectionMenuFactory = () =>
  import(
    /* webpackChunkName: "map-area-selection-menu" */
    '@features/mapArea/components/MapAreaSelectionMenu.js'
  );

const galleryMenuFactory = () =>
  import(
    /* webpackChunkName: "gallery-menu" */
    '@features/gallery/components/GalleryMenu.js'
  );

const adFactory = () =>
  import(
    /* webpackChunkName: "ad" */
    '@features/ad/components/Ad.js'
  );

const shadingControlFactory = () =>
  import(
    /* webpackChunkName: "shading-control" */
    '@features/parameterizedShading/components/ShadingControl.js'
  );

const elevationChartFactory = () =>
  import(
    /* webpackChunkName: "elevation-chart" */
    '@features/elevationChart/components/ElevationChart.js'
  );

const trackingModalFactory = () =>
  import(
    /* webpackChunkName: "tracking-modal" */
    '@features/tracking/components/TrackingModal.js'
  );

const accountModalFactory = () =>
  import(
    /* webpackChunkName: "account-modal" */
    '@features/auth/components/AccountModal/AccountModal.js'
  );

const downloadMapModalFactory = () =>
  import(
    /* webpackChunkName: "offline-map-export-modal" */
    '@features/offlineMapExport/components/OfflineMapExportModal.js'
  );

const cachedMapsModalFactory = () =>
  import(
    /* webpackChunkName: "cached-maps-modal" */
    '@features/cachedMaps/components/CachedMapsModal.js'
  );

const mapLayersConfigModalFactory = () =>
  import(
    /* webpackChunkName: "map-layers-config-modal" */
    '@features/mapSettings/components/MapLayersConfigModal.js'
  );

const customMapsModalFactory = () =>
  import(
    /* webpackChunkName: "custom-maps-modal" */
    '@features/mapSettings/components/CustomMapsModal.js'
  );

const mapPreferencesModalFactory = () =>
  import(
    /* webpackChunkName: "map-preferences-modal" */
    '@features/mapSettings/components/MapPreferencesModal.js'
  );

const embedMapModalFactory = () =>
  import(
    /* webpackChunkName: "embed-map-modal" */
    './EmbedMapModal.js'
  );

const exportGpxModalFactory = () =>
  import(
    /* webpackChunkName: "map-features-export-modal" */
    '@features/mapFeaturesExport/components/MapFeaturesExportModal.js'
  );

const exportMapModalFactory = () =>
  import(
    /* webpackChunkName: "map-to-document-export-modal" */
    '@features/mapToDocumentExport/components/MapToDocumentExportModal.js'
  );

const documentModalFactory = () =>
  import(
    /* webpackChunkName: "document-modal" */
    '@features/documents/components/DocumentModal.js'
  );

const aboutModalFactory = () =>
  import(
    /* webpackChunkName: "about-modal" */
    './AboutModal.js'
  );

const buyCreditModalFactory = () =>
  import(
    /* webpackChunkName: "buy-credits-modal" */
    '@features/credits/components/BuyCreditsModal.js'
  );

const supportUsModalFactory = () =>
  import(
    /* webpackChunkName: "support-us-modal" */
    '@features/supportUsModal/SupportUsModal.js'
  );

const legendModalFactory = () =>
  import(
    /* webpackChunkName: "legend-modal" */
    '@features/legend/components/LegendModal.js'
  );

const currentDrawingPropertiesModalFactory = () =>
  import(
    /* webpackChunkName: "current-drawing-properties-modal" */
    '../../features/drawing/components/CurrentDrawingPropertiesModal.js'
  );

const trackViewerUploadModalFactory = () =>
  import(
    /* webpackChunkName: "track-viewer-upload-modal" */
    '@features/trackViewer/components/TrackViewerUploadModal.js'
  );

const loginModalFactory = () =>
  import(
    /* webpackChunkName: "login-modal" */
    '@features/auth/components/LoginModal.js'
  );

const mapsModalFactory = () =>
  import(
    /* webpackChunkName: "my-maps-modal" */
    '@features/myMaps/components/MyMapsModal.js'
  );

const premiumActivationModalFactory = () =>
  import(
    /* webpackChunkName: "premium-activation-modal" */
    '@features/premium/components/PremiumActivationModal.js'
  );

const galleryFilterModalFactory = () =>
  import(
    /* webpackChunkName: "gallery-filter-modal" */
    '@features/gallery/components/GalleryFilterModal.js'
  );

const galleryLeaderboardModalFactory = () =>
  import(
    /* webpackChunkName: "gallery-leaderboard-modal" */
    '@features/gallery/components/GalleryLeaderboardModal.js'
  );

const predefinedDrawingPropertiesModalFactory = () =>
  import(
    /* webpackChunkName: "predefined-drawing-properties-modal" */
    './PredefinedDrawingPropertiesModal.js'
  );

const trackViewerStyleModalFactory = () =>
  import(
    /* webpackChunkName: "track-viewer-style-modal" */
    '@features/trackViewer/components/TrackViewerStyleModal.js'
  );

const objectsStyleModalFactory = () =>
  import(
    /* webpackChunkName: "objects-style-modal" */
    '@features/objects/components/ObjectsStyleModal.js'
  );

const searchResultStyleModalFactory = () =>
  import(
    /* webpackChunkName: "search-result-style-modal" */
    '@features/search/components/SearchResultStyleModal.js'
  );

export function Main(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const layers = useAppSelector((state) => state.map.layers);

  const selectionType = useAppSelector((state) => state.main.selection?.type);

  const tools = useAppSelector(toolsSelector);

  const activeTool = useAppSelector((state) => state.main.activeTool);

  const embedFeatures = useAppSelector((state) => state.main.embedFeatures);

  const activeModal = useAppSelector((state) => state.main.activeModal);

  const progress = useAppSelector((state) => Boolean(state.progress.length));

  const authenticated = useAppSelector((state) => Boolean(state.auth.user));

  const showAds = useAppSelector(
    (state) =>
      !process.env['PREVENT_ADS'] &&
      !window.isRobot &&
      !window.fmEmbedded &&
      !isPremium(state.auth.user),
  );

  const showElevationChart = useAppSelector((state) =>
    Boolean(state.elevationChart.elevationProfilePoints),
  );

  const showGalleryPicker = useAppSelector(showGalleryPickerSelector);

  const showMenu = useAppSelector(
    (state) =>
      state.homeLocation.selectingHomeLocation === false &&
      !state.gallery.pickingPositionForId &&
      !state.gallery.showPosition &&
      !state.mapArea.selecting,
  );

  const selectingMapArea = useAppSelector(
    (state) => state.mapArea.selecting !== null,
  );

  const showResults = useAppSelector(
    (state) => !state.map.layers.includes('i'),
  );

  const showPictures = useAppSelector((state) =>
    state.map.layers.includes('I'),
  );

  const language = useAppSelector((state) => state.l10n.language);

  const isUserValidated = useAppSelector((state) => state.auth.validated);

  const map = useMap();

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

  const loadTrackFiles = useLoadTrackFiles();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const pictureFiles = acceptedFiles.filter(
        (file) => file.type === 'image/jpeg',
      );

      if (pictureFiles.length) {
        dispatch(setActiveModal({ type: 'gallery-upload' })); // if no user then it displays valuable error

        if (authenticated) {
          handlePicturesDrop(pictureFiles);
        }
      }

      const trackFiles = acceptedFiles.filter((file) =>
        /\.(gpx|kml|kmz|tcx|geojson|json)$/i.test(file.name),
      );

      if (trackFiles.length) {
        loadTrackFiles(trackFiles);
      }
    },
    [handlePicturesDrop, loadTrackFiles, dispatch, authenticated],
  );

  useShareFile(onDrop);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    disabled: activeModal !== null,
  });

  // A selection toolbar shows when the selection is the active thing (no tool
  // focused), or while a drawing tool is active — the point/line/polygon being
  // drawn is selected internally, so its selection toolbar stays available
  // alongside the drawing toolbar.
  const selectionMenu =
    showMenu && (activeTool === null || isDrawTool(activeTool))
      ? selectionType
      : null;

  const scLogo = useScrollClasses('horizontal');

  const scMapControls = useScrollClasses('horizontal');

  const online = useOnline();

  const elevationChartActive = useAppSelector((state) =>
    Boolean(state.elevationChart.elevationProfilePoints),
  );

  const trackFound = useAppSelector(trackGeojsonIsSuitableForElevationChart);

  const routeFound = useAppSelector((state) =>
    Boolean(state.routePlanner.alternatives.length),
  );

  useHtmlMeta();

  const showMapsMenu = useAppSelector((state) =>
    Boolean(state.myMaps.activeMap),
  );

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
    (state) => state.homeLocation.selectingHomeLocation,
  );

  const showPosition = useAppSelector((state) => state.gallery.showPosition);

  const pickingPosition = useAppSelector(
    (state) => state.gallery.pickingPositionForId !== null,
  );

  const askingCookieConsent = useAppSelector(askingCookieConsentSelector);

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

          <div className={classes.header}>
            {!askingCookieConsent && !window.fmEmbedded && <InfoBar />}

            <div className={classes.menus}>
              <div className="fm-ib-scroller fm-ib-scroller-top" ref={scLogo}>
                <div />

                <Toolbar className="mt-2">
                  <button
                    id="freemap-logo"
                    className={`${progress ? 'in-progress' : 'idle'}${
                      online ? '' : ' offline'
                    }`}
                    title={online ? undefined : m?.general.offline}
                    onClick={handleLogoClick}
                  />

                  {!window.fmEmbedded && showMenu && <MainMenuButton />}

                  {(!window.fmEmbedded || embedFeatures.includes('search')) && (
                    <SearchMenu
                      hidden={!showMenu}
                      preventShortcut={Boolean(activeModal)}
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
                            className={clsx(trackFound && 'ms-1')}
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

              {showMenu && showMapsMenu && !window.fmEmbedded && <MyMapsMenu />}

              {showMenu && showPictures && (
                <AsyncComponent factory={galleryMenuFactory} />
              )}

              {/* tool menus; one per open tool, stacked in the order opened */}

              {showMenu &&
                tools.map((t) =>
                  t === 'objects' ? (
                    <AsyncComponent key={t} factory={objectsMenuFactory} />
                  ) : t === 'route-planner' ? (
                    <AsyncComponent key={t} factory={routePlannerMenuFactory} />
                  ) : t === 'import-file' ? (
                    <AsyncComponent key={t} factory={trackViewerMenuFactory} />
                  ) : t === 'changesets' ? (
                    <AsyncComponent key={t} factory={changesetsMenuFactory} />
                  ) : t === 'draw-lines' ||
                    t === 'draw-points' ||
                    t === 'draw-polygons' ? (
                    <AsyncComponent key={t} factory={drawingMenuFactory} />
                  ) : t === 'map-details' ? (
                    <MapDetailsMenu key={t} />
                  ) : t === 'tracking' ? (
                    <AsyncComponent key={t} factory={trackingMenuFactory} />
                  ) : null,
                )}

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
              ) : selectionMenu === 'route-leg' ? (
                <RouteLegSelection />
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

              {selectingMapArea && (
                <AsyncComponent factory={mapAreaSelectionMenuFactory} />
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

          <div className={classes.typeZoomControl}>
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
        {isDragActive && <div className={classes.dragToMap} />}

        <input {...getInputProps()} />

        {layers.some((layer) => layer[0] === 'V') && (
          <a
            href="https://www.maptiler.com"
            className={classes.watermark}
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
          <TheMap>
            <Layers />

            <Tools />

            {/* Features always render; in dedicated map modes (picking a
                home/photo location, showing a photo location, selecting an
                export/cache area) they stay visible but non-interactive — see
                pickingModeSelector / Map.tsx / leaflet.css. */}
            {showResults && <Results />}

            <WikiLayer />

            {showGalleryPicker && <GalleryPicker />}

            {selectingHomeLocation !== false && <HomeLocationPickingResult />}

            {selectingMapArea && <MapAreaSelectionResult />}

            {/* TODO should not be extra just because for position picking */}

            <GalleryResult />
          </TheMap>
        </div>
      </div>

      <AsyncModal
        show={
          activeModal !== null &&
          [
            ...(isUserValidated ? ['tracking-my'] : []),
            'tracking-watched',
          ].includes(activeModal.type)
        }
        factory={trackingModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'account'}
        factory={accountModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'offline-map-export'}
        factory={downloadMapModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'offline-maps'}
        factory={cachedMapsModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'map-layers-config'}
        factory={mapLayersConfigModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'custom-maps'}
        factory={customMapsModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'map-preferences'}
        factory={mapPreferencesModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'embed'}
        factory={embedMapModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'map-features-export'}
        factory={exportGpxModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'map-to-document-export'}
        factory={exportMapModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'document'}
        factory={documentModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'about'}
        factory={aboutModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'credits-purchase'}
        factory={buyCreditModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'support-us'}
        factory={supportUsModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'legend'}
        factory={legendModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'current-drawing-properties'}
        factory={currentDrawingPropertiesModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'file-import'}
        factory={trackViewerUploadModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'login'}
        factory={loginModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'my-maps'}
        factory={mapsModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'premium'}
        factory={premiumActivationModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'gallery-filter'}
        factory={galleryFilterModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'gallery-leaderboard'}
        factory={galleryLeaderboardModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'drawing-properties'}
        factory={predefinedDrawingPropertiesModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'track-viewer-style'}
        factory={trackViewerStyleModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'objects-style'}
        factory={objectsStyleModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'search-result-style'}
        factory={searchResultStyleModalFactory}
      />

      <GalleryModals />
    </>
  );
}
