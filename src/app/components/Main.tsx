import { useLoadDataFiles } from '@features/dataViewer/hooks/useLoadDataFiles.js';
import { dataViewerToggleElevationChart } from '@features/dataViewer/model/actions.js';
import {
  elevationChartClose,
  elevationChartOpen,
} from '@features/elevationChart/model/actions.js';
import { GalleryModals } from '@features/gallery/components/GalleryModals.js';
import { GalleryPicker } from '@features/gallery/components/GalleryPicker.js';
import { GalleryResult } from '@features/gallery/components/GalleryResult.js';
import { usePictureDropHandler } from '@features/gallery/hooks/usePictureDropHandler.js';
import {
  type GalleryItem,
  galleryAddItem,
  galleryMergeItem,
} from '@features/gallery/model/actions.js';
import { gpsRecorderAvailableSelector } from '@features/gpsRecorder/support.js';
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
import { SearchMenu } from '@features/search/components/SearchMenu.js';
import { SearchSelection } from '@features/search/components/SearchSelection.js';
import { Toasts } from '@features/toasts/components/Toasts.js';
import { TrackingSelection } from '@features/tracking/components/TrackingSelection.js';
import { VIEWSHED_LAYER } from '@features/viewshed/api.js';
import { RADAR_LAYER } from '@features/weatherRadar/api.js';
import { WikiLayer } from '@features/wiki/components/WikiLayer.js';
import { AsyncModal } from '@shared/components/AsyncModal.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { OfflineBadge } from '@shared/components/OfflineBadge.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOpenOrder } from '@shared/hooks/useOpenOrder.js';
import { useScrollClasses } from '@shared/hooks/useScrollClasses.js';
import { useShareFile } from '@shared/hooks/useShareFile.js';
import { integratedLayerDefMap } from '@shared/mapDefinitions.js';
import { isDrawTool } from '@shared/toolDefinitions.js';
import fmLogoEu from '@/images/freemap-logo-eu.svg';
import fmLogoSk from '@/images/freemap-logo-sk.svg';
import 'leaflet/dist/leaflet.css';
import {
  Fragment,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
} from 'react';
import { Button, ButtonToolbar } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { FaChartArea } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useMouseCursor } from '../hooks/useMouseCursor.js';
import { type Selection, setActiveModal, type Tool } from '../store/actions.js';
import {
  askingCookieConsentSelector,
  isToolOpen,
  mapModeSelector,
  openToolsSelector,
  pickingModeSelector,
  showGalleryPickerSelector,
  trackGeojsonIsSuitableForElevationChart,
} from '../store/selectors.js';
import { AsyncComponent } from './AsyncComponent.js';
import { CopyrightButton } from './CopyrightButton.js';
import { InfoBar } from './InfoBar.js';
import { Layers } from './Layers.js';
// Imported for its stylesheet alone, and from here because this module is
// eager. Its three users — the elevation chart, the toposcope and the panorama
// — are each their own lazy chunk, and a stylesheet reached only from async
// chunks is emitted into every one of them. Loading the second panel then
// re-appends the shared rules *after* the first panel's own, and anything the
// two disagree about at equal specificity flips: the panorama's white move grip
// went back to Bootstrap's muted one the moment the toposcope opened. In the
// initial bundle it is emitted once, and always before any feature's CSS —
// which is the order a shared base wants anyway.
//
// Dev never showed it: one bundle, one copy, no second insertion.
//
// `SingleCopyCssPlugin` in `rspack.config.ts` fails the build for any shared
// stylesheet that lacks an importer here.
import '@shared/components/FloatingWindow.module.css';
import classes from './Main.module.css';
import { MapContextMenu } from './MapContextMenu.js';
import { MapControls } from './MapControls.js';
import { Results } from './Results.js';
import { Tools } from './Tools.js';
import { useHtmlMeta } from './useHtmlMeta.js';

// The header logo is picked from the entry document's `data-site` by CSS, so the
// printed one reads the same attribute rather than the hostname — a host serving
// the EU document without an `*.freemap.eu` name would otherwise disagree.
const isEuSite = document.documentElement.dataset['site'] === 'eu';

const fmLogo = isEuSite ? fmLogoEu : fmLogoSk;

const objectsMenuFactory = () =>
  import(
    /* webpackChunkName: "objects-menu" */
    '@features/objects/components/ObjectsMenu.js'
  );

const routePlannerColorizeLegendFactory = () =>
  import(
    /* webpackChunkName: "route-planner-colorize-legend" */
    '@features/routePlanner/components/RoutePlannerColorizeLegend.js'
  );

const dataViewerColorizeLegendFactory = () =>
  import(
    /* webpackChunkName: "data-viewer-colorize-legend" */
    '@features/dataViewer/components/DataViewerColorizeLegend.js'
  );

const trackingColorizeLegendFactory = () =>
  import(
    /* webpackChunkName: "tracking-colorize-legend" */
    '@features/tracking/components/TrackingColorizeLegend.js'
  );

const routePlannerMenuFactory = () =>
  import(
    /* webpackChunkName: "route-planner-menu" */
    '@features/routePlanner/components/RoutePlannerMenu.js'
  );

const dataViewerMenuFactory = () =>
  import(
    /* webpackChunkName: "data-viewer-menu" */
    '@features/dataViewer/components/DataViewerMenu.js'
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

const gpsRecorderMenuFactory = () =>
  import(
    /* webpackChunkName: "gps-recorder-menu" */
    '@features/gpsRecorder/components/GpsRecorderMenu.js'
  );

// The menu's chunk deliberately: the two mount on nearly the same condition, so
// a chunk of their own would be a second request for a component that renders
// nothing.
const gpsRecorderNoticesFactory = () =>
  import(
    /* webpackChunkName: "gps-recorder-menu" */
    '@features/gpsRecorder/components/GpsRecorderNotices.js'
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

const dataViewerSelectionFactory = () =>
  import(
    /* webpackChunkName: "data-viewer-selection" */
    '@features/dataViewer/components/DataViewerSelection.js'
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

const weatherRadarMenuFactory = () =>
  import(
    /* webpackChunkName: "weather-radar-menu" */
    '@features/weatherRadar/components/WeatherRadarMenu.js'
  );

const viewshedMenuFactory = () =>
  import(
    /* webpackChunkName: "viewshed-menu" */
    '@features/viewshed/components/ViewshedMenu.js'
  );

const viewshedViewpointPickingFactory = () =>
  import(
    /* webpackChunkName: "viewshed-viewpoint-picking" */
    '@features/viewshed/components/ViewshedViewpointPicking.js'
  );

const viewshedViewpointPickingMenuFactory = () =>
  import(
    /* webpackChunkName: "viewshed-viewpoint-picking-menu" */
    '@features/viewshed/components/ViewshedViewpointPickingMenu.js'
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

const panoramaFactory = () =>
  import(
    /* webpackChunkName: "panorama" */
    '@features/panorama/components/Panorama.js'
  );

// The panorama has no toolbar of its own: its controls live in its window, next
// to the picture they act on — see `PanoramaControls`.

const toposcopeFactory = () =>
  import(
    /* webpackChunkName: "toposcope" */
    '@features/toposcope/components/Toposcope.js'
  );

const toposcopeCenterPickingFactory = () =>
  import(
    /* webpackChunkName: "toposcope-center-picking" */
    '@features/toposcope/components/ToposcopeCenterPicking.js'
  );

const toposcopeCenterPickingMenuFactory = () =>
  import(
    /* webpackChunkName: "toposcope-center-picking-menu" */
    '@features/toposcope/components/ToposcopeCenterPickingMenu.js'
  );

const panoramaPickingFactory = () =>
  import(
    /* webpackChunkName: "panorama-picking" */
    '@features/panorama/components/PanoramaPicking.js'
  );

const panoramaPickingMenuFactory = () =>
  import(
    /* webpackChunkName: "panorama-picking-menu" */
    '@features/panorama/components/PanoramaPickingMenu.js'
  );

const panoramaSettingsModalFactory = () =>
  import(
    /* webpackChunkName: "panorama-settings-modal" */
    '@features/panorama/components/PanoramaSettingsModal.js'
  );

const toposcopeSettingsModalFactory = () =>
  import(
    /* webpackChunkName: "toposcope-settings-modal" */
    '@features/toposcope/components/ToposcopeSettingsModal.js'
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

const browseCacheModalFactory = () =>
  import(
    /* webpackChunkName: "browse-cache-modal" */
    '@features/cachedMaps/components/BrowseCacheModal.js'
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

const elevationSettingsModalFactory = () =>
  import(
    /* webpackChunkName: "elevation-settings-modal" */
    '@features/elevationChart/components/ElevationSettingsModal.js'
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

const dataViewerUploadModalFactory = () =>
  import(
    /* webpackChunkName: "data-viewer-upload-modal" */
    '@features/dataViewer/components/DataViewerUploadModal.js'
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

const gpsRecorderSettingsModalFactory = () =>
  import(
    /* webpackChunkName: "gps-recorder-settings-modal" */
    '@features/gpsRecorder/components/GpsRecorderSettingsModal.js'
  );

const dataViewerStyleModalFactory = () =>
  import(
    /* webpackChunkName: "data-viewer-style-modal" */
    '@features/dataViewer/components/DataViewerStyleModal.js'
  );

const dataViewerMatchModalFactory = () =>
  import(
    /* webpackChunkName: "data-viewer-match-modal" */
    '@features/dataViewer/components/DataViewerMatchModal.js'
  );

const dataViewerPropertiesModalFactory = () =>
  import(
    /* webpackChunkName: "data-viewer-properties-modal" */
    '@features/dataViewer/components/DataViewerPropertiesModal.js'
  );

const dataViewerElevationPromptModalFactory = () =>
  import(
    /* webpackChunkName: "data-viewer-elevation-prompt-modal" */
    '@features/dataViewer/components/DataViewerElevationPromptModal.js'
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

const routePlannerStyleModalFactory = () =>
  import(
    /* webpackChunkName: "route-planner-style-modal" */
    '@features/routePlanner/components/RoutePlannerStyleModal.js'
  );

/** The toolbar of the selected feature, whatever kind it is. */
function selectionMenu(type: Selection['type']): ReactNode {
  switch (type) {
    case 'search':
      return <SearchSelection />;

    case 'draw-line-poly':
      return <AsyncComponent factory={drawingLineSelectionFactory} />;

    case 'line-point':
      return <AsyncComponent factory={drawingLinePointSelectionFactory} />;

    case 'draw-points':
      return <AsyncComponent factory={drawingPointSelectionFactory} />;

    case 'data-viewer':
      return <AsyncComponent factory={dataViewerSelectionFactory} />;

    case 'objects':
      return <AsyncComponent factory={objectSelectionFactory} />;

    case 'tracking':
      return <TrackingSelection />;

    case 'route-point':
      return <RoutePointSelection />;

    case 'route-leg':
      return <RouteLegSelection />;

    default:
      return null;
  }
}

/**
 * An open tool's own toolbar. Null where the tool's UI is a panel instead, and
 * for the GPS recorder, whose toolbar is listed on its own — it stays up while
 * a recording runs, tool or no tool.
 */
function toolMenu(tool: Tool): ReactNode {
  switch (tool) {
    case 'objects':
      return <AsyncComponent factory={objectsMenuFactory} />;

    case 'route-planner':
      return <AsyncComponent factory={routePlannerMenuFactory} />;

    case 'import-file':
      return <AsyncComponent factory={dataViewerMenuFactory} />;

    case 'changesets':
      return <AsyncComponent factory={changesetsMenuFactory} />;

    case 'draw-lines':
    case 'draw-points':
    case 'draw-polygons':
      return <AsyncComponent factory={drawingMenuFactory} />;

    case 'map-details':
      return <MapDetailsMenu />;

    case 'tracking':
      return <AsyncComponent factory={trackingMenuFactory} />;

    default:
      return null;
  }
}

export function Main(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const layers = useAppSelector((state) => state.map.layers);

  const selectionType = useAppSelector((state) => state.main.selection?.type);

  const dataViewerElevationPrompt = useAppSelector(
    (state) => state.trackViewer.elevationPrompt !== null,
  );

  const openTools = useAppSelector(openToolsSelector);

  const gpsRecorderAvailable = useAppSelector(gpsRecorderAvailableSelector);

  const gpsRecorderRecording = useAppSelector(
    (state) => state.gpsRecorder.status?.recording ?? false,
  );

  const gpsRecorderFailure = useAppSelector(
    (state) => state.gpsRecorder.error !== null,
  );

  // The recorder's UI belongs on the screen while its tool is open or a
  // recording is running. Named once: the menu and the notices below differ
  // only in what else keeps the notices alive.
  const gpsRecorderWanted =
    gpsRecorderAvailable &&
    !window.fmEmbedded &&
    (openTools.includes('gps-recorder') || gpsRecorderRecording);

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

  const showToposcope = useAppSelector((state) =>
    isToolOpen(state, 'toposcope'),
  );

  const showPanorama = useAppSelector((state) => isToolOpen(state, 'panorama'));

  const pickingToposcopeCenter = useAppSelector(
    (state) => state.toposcope.pickingCenter,
  );

  const pickingPanorama = useAppSelector(
    (state) => state.panorama.picking !== null,
  );

  const pickingViewshedViewpoint = useAppSelector(
    (state) => state.viewshed.pickingViewpoint,
  );

  const showGalleryPicker = useAppSelector(showGalleryPickerSelector);

  // The toolbars and the floating panels go while a place is being picked.
  const picking = useAppSelector(pickingModeSelector);

  // A mode waiting on a click clears the screen for it — but where a picking
  // mode brings its own menu, an armed one keeps the selection toolbar, which
  // is where it says what it wants and offers the way out.
  const inMode = useAppSelector(mapModeSelector);

  // Only whether a colorize legend is possible at all, so its chunk stays off a
  // page that will never show one. Each legend decides for itself from there.
  const colorizingRoute = useAppSelector((state) =>
    Boolean(state.routePlannerSettings.colorizeBy),
  );

  const colorizingTrack = useAppSelector((state) =>
    Boolean(state.trackViewerSettings.colorizeTrackBy),
  );

  const colorizingTracking = useAppSelector((state) =>
    Boolean(state.trackingSettings.colorizeBy),
  );

  const tracksFound = useAppSelector((state) =>
    Boolean(state.tracking.tracks.length),
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

  const showWeatherRadar = useAppSelector((state) =>
    state.map.layers.includes(RADAR_LAYER),
  );

  const showViewshed = useAppSelector((state) =>
    state.map.layers.includes(VIEWSHED_LAYER),
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

  const loadTrackFiles = useLoadDataFiles();

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

  const scLogo = useScrollClasses('horizontal');

  const scMapControls = useScrollClasses('horizontal');

  const elevationChartTarget = useAppSelector(
    (state) => state.elevationChart.target?.type,
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

  // Every toolbar that joins the strip below the logo, in the order it was
  // opened, so opening another doesn't reorder the ones already on the screen.
  // `open` is the toolbar's own reason to be up and knows nothing of a mode
  // clearing the chrome — that is `hidden`, which keeps the toolbar's place
  // instead of dropping it to the end when the mode ends.
  const toolbars = useOpenOrder(
    [
      {
        id: 'my-maps',
        open: !window.fmEmbedded && showMapsMenu,
        hidden: inMode,
        node: <MyMapsMenu />,
      },
      {
        id: 'gallery',
        open: showPictures,
        hidden: inMode,
        node: <AsyncComponent factory={galleryMenuFactory} />,
      },
      {
        id: 'weather-radar',
        open: showWeatherRadar,
        hidden: inMode,
        node: <AsyncComponent factory={weatherRadarMenuFactory} />,
      },
      {
        id: 'viewshed',
        open: showViewshed,
        hidden: inMode,
        node: <AsyncComponent factory={viewshedMenuFactory} />,
      },
      // A running recording keeps its toolbar — collapsed to a strip, and told
      // apart by its own gate — for as long as it runs, because nothing else on
      // the screen says the phone is recording. Also gated here for the same
      // reason the tool is: the tool can be named in the URL hash on a device
      // the recorder can't run on. Not in an embedded map: `openTool` is a no-op
      // there, so the strip could never be expanded — and the recording belongs
      // to the full app that started it.
      {
        id: 'gps-recorder',
        open: gpsRecorderWanted,
        hidden: inMode,
        node: <AsyncComponent factory={gpsRecorderMenuFactory} />,
      },
      // The three draw-* tools share one menu, so they share one id too: keying
      // them apart would unmount and re-mount it on every switch between them,
      // and its lazy chunk re-renders as nothing until the import settles — a
      // toolbar that blinks away for a frame.
      ...openTools.map((tool) => {
        const node = toolMenu(tool);

        return {
          id: isDrawTool(tool) ? 'drawing' : tool,
          open: node !== null,
          hidden: inMode,
          node,
        };
      }),
      // A tool keeps the feature that belongs to it selected, so the selection
      // toolbar sits alongside that tool's own. An armed mode keeps it — it is
      // where the mode says what it waits for and offers the way out.
      {
        id: 'selection',
        open: selectionType !== undefined,
        hidden: picking,
        node: selectionType && selectionMenu(selectionType),
      },
      // Each legend outlives its tool's toolbar: the colored line stays on the
      // map when the tool is closed, and a shared link need not name the tool at
      // all. Each hides itself; the flags here keep its chunk off a page that
      // shows no legend, and its slot out of the order until there is a line to
      // explain. Not in an embed — the legend's own control opens a tool, which
      // an embed refuses.
      {
        id: 'route-legend',
        open: !window.fmEmbedded && colorizingRoute && routeFound,
        hidden: inMode,
        node: <AsyncComponent factory={routePlannerColorizeLegendFactory} />,
      },
      {
        id: 'track-legend',
        open: !window.fmEmbedded && colorizingTrack && trackFound,
        hidden: inMode,
        node: <AsyncComponent factory={dataViewerColorizeLegendFactory} />,
      },
      {
        id: 'tracking-legend',
        open: !window.fmEmbedded && colorizingTracking && tracksFound,
        hidden: inMode,
        node: <AsyncComponent factory={trackingColorizeLegendFactory} />,
      },
    ].filter((toolbar) => toolbar.open),
  );

  return (
    <>
      {!window.fmHeadless && (
        <>
          {/* see https://stackoverflow.com/questions/24680588/load-external-images-in-print-media why we must allways fetch the image :-( */}
          <img
            id="freemap-logo-print"
            src={fmLogo}
            width="150"
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
                    type="button"
                    id="freemap-logo"
                    className={progress ? 'in-progress' : 'idle'}
                    onClick={handleLogoClick}
                  />

                  {/* The app's standing offline mark. The search box shows one
                      only for a query it can't answer itself, so this is what
                      says the connection is gone at all. */}
                  <OfflineBadge hint={m?.general.offline} />

                  {!window.fmEmbedded && !inMode && <MainMenuButton />}

                  {(!window.fmEmbedded || embedFeatures.includes('search')) && (
                    <SearchMenu
                      hidden={inMode}
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
                            active={elevationChartTarget === 'track-viewer'}
                            onClick={() =>
                              dispatch(dataViewerToggleElevationChart())
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
                            variant="secondary"
                            onClick={() =>
                              dispatch(
                                elevationChartTarget === 'route-planner'
                                  ? elevationChartClose()
                                  : elevationChartOpen({
                                      type: 'route-planner',
                                    }),
                              )
                            }
                            active={elevationChartTarget === 'route-planner'}
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

              {/* The recorder's toasts, apart from its menu: a failure can null
                  the status and unmount the menu in the same commit that should
                  announce it, so the announcer outlives it — mounted on there
                  being anything to announce, the failure itself included. */}
              {(gpsRecorderWanted ||
                (gpsRecorderAvailable &&
                  !window.fmEmbedded &&
                  gpsRecorderFailure)) && (
                <AsyncComponent factory={gpsRecorderNoticesFactory} />
              )}

              {toolbars
                .filter((toolbar) => !toolbar.hidden)
                .map(({ id, node }) => (
                  <Fragment key={id}>{node}</Fragment>
                ))}

              {pickingPosition && (
                <AsyncComponent factory={galleryPositionPickingMenuFactory} />
              )}

              {showPosition && (
                <AsyncComponent factory={galleryShowPositionMenuFactory} />
              )}

              {selectingHomeLocation !== false && (
                <AsyncComponent factory={homeLocationPickingMenuFactory} />
              )}

              {pickingToposcopeCenter && (
                <AsyncComponent factory={toposcopeCenterPickingMenuFactory} />
              )}

              {pickingPanorama && (
                <AsyncComponent factory={panoramaPickingMenuFactory} />
              )}

              {pickingViewshedViewpoint && (
                <AsyncComponent factory={viewshedViewpointPickingMenuFactory} />
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

            {/* Hidden, not unmounted: rebuilding a panorama or a profile is
                expensive, and a mode taking the map is a detour. */}
            <div className={inMode ? 'd-none' : undefined}>
              {showElevationChart && (
                <AsyncComponent factory={elevationChartFactory} />
              )}

              {showToposcope && <AsyncComponent factory={toposcopeFactory} />}

              {showPanorama && <AsyncComponent factory={panoramaFactory} />}
            </div>
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

            {pickingToposcopeCenter && (
              <AsyncComponent factory={toposcopeCenterPickingFactory} />
            )}

            {pickingPanorama && (
              <AsyncComponent factory={panoramaPickingFactory} />
            )}

            {pickingViewshedViewpoint && (
              <AsyncComponent factory={viewshedViewpointPickingFactory} />
            )}

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
        show={activeModal?.type === 'browse-cache'}
        factory={browseCacheModalFactory}
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
        show={activeModal?.type === 'elevation-settings'}
        factory={elevationSettingsModalFactory}
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
        factory={dataViewerUploadModalFactory}
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
        show={activeModal?.type === 'gps-recorder-settings'}
        factory={gpsRecorderSettingsModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'track-viewer-style'}
        factory={dataViewerStyleModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'track-viewer-match'}
        factory={dataViewerMatchModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'data-viewer-properties'}
        factory={dataViewerPropertiesModalFactory}
      />

      {/* Not in the tool's panel: the selection toolbar asks for elevation too,
          and it stands without the panel. */}
      <AsyncModal
        show={dataViewerElevationPrompt}
        factory={dataViewerElevationPromptModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'objects-style'}
        factory={objectsStyleModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'panorama-settings'}
        factory={panoramaSettingsModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'toposcope-settings'}
        factory={toposcopeSettingsModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'search-result-style'}
        factory={searchResultStyleModalFactory}
      />

      <AsyncModal
        show={activeModal?.type === 'route-planner-style'}
        factory={routePlannerStyleModalFactory}
      />

      <GalleryModals />
    </>
  );
}
