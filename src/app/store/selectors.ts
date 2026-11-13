import { COOKIE_CONSENT_TOAST_ID } from '@features/cookieConsent/model/toastAction.js';
import { isTrackLine } from '@features/dataViewer/trackSelection.js';
import { areFeaturesHidden } from '@features/map/featuresOpacity.js';
import type { PickMode } from '@features/routePlanner/model/actions.js';
import type { Track } from '@features/tracking/model/types.js';
import { isDrawTool } from '@shared/toolDefinitions.js';
import { createSelector } from 'reselect';
import marker from '@/images/cursors/marker.svg';
import pencil from '@/images/cursors/pencil.svg';
import type { Tool } from '../store/actions.js';
import type { RootState } from '../store/store.js';

// Whether a tool's toolbar is on the screen, whichever slot it is open in.
export const isToolOpen = (state: RootState, tool: Tool): boolean =>
  state.main.mapTool === tool || state.main.panelTools.includes(tool);

// Every open tool, the map-click one first — memoized, so subscribing to it
// doesn't re-render on every unrelated action the way a fresh array would.
export const openToolsSelector = createSelector(
  (state: RootState) => state.main.mapTool,
  (state: RootState) => state.main.panelTools,
  (mapTool, panelTools): Tool[] =>
    mapTool ? [mapTool, ...panelTools] : panelTools,
);

// The open tool as far as map clicks go — i.e. the one that owns them; null
// while only toolbar-only tools are open.
export const activeModeSelector = (state: RootState): Tool | null =>
  state.main.mapTool;

// The open draw-* tool (the three of them share one menu, and the map-click
// slot they all take).
export const openDrawToolSelector = (state: RootState): Tool | null =>
  isDrawTool(state.main.mapTool) ? state.main.mapTool : null;

export const mapLayersSelector = (state: RootState): string[] =>
  state.map.layers;

export const routePlannerPickModeSelector = (
  state: RootState,
): PickMode | null => state.routePlanner.pickMode;

export const drawingLineSelector = (state: RootState): boolean =>
  state.trackViewer.drawing !== null;

/** The layers the user has on: during a library preview, those it puts back. */
export const userLayersSelector = (state: RootState): string[] =>
  state.mapLibrary.preview?.restore ?? state.map.layers;

/**
 * The modes the map waits in for a click that says where: features go inert
 * and `Main` puts the chrome away. Every such mode belongs here; the UI turns
 * on one at a time, and should two be on, the first listed wins.
 */
const PICKING_MODES = [
  ['gallery-position', (s) => s.gallery.pickingPositionForId !== null],
  ['event-start', (s) => s.events.pickingStart],
  ['toposcope-center', (s) => s.toposcope.pickingCenter],
  ['panorama', (s) => s.panorama.picking !== null],
  ['viewshed-viewpoint', (s) => s.viewshed.pickingViewpoint],
  ['map-area', (s) => s.mapArea.selecting !== null],
  ['map-library-preview', (s) => s.mapLibrary.preview !== null],
  ['home-location', (s) => s.homeLocation.selectingHomeLocation !== false],
  ['gallery-show-position', (s) => s.gallery.showPosition],
] as const satisfies readonly (readonly [string, (s: RootState) => boolean])[];

export type PickingMode = (typeof PICKING_MODES)[number][0];

export const pickingModeSelector = (state: RootState): PickingMode | null =>
  PICKING_MODES.find(([, on]) => on(state))?.[0] ?? null;

/** Whether any picking mode is on. */
export const inPickingModeSelector = (state: RootState): boolean =>
  pickingModeSelector(state) !== null;

/** The cursor over the map in each: a crosshair where a place is picked. */
const PICKING_CURSOR: Record<PickingMode, string> = {
  'gallery-position': 'crosshair',
  'event-start': 'crosshair',
  'toposcope-center': 'crosshair',
  panorama: 'crosshair',
  'viewshed-viewpoint': 'crosshair',
  'home-location': 'crosshair',
  // A click on the map does nothing in these: the area is set by its handles,
  // and the other two only show something.
  'map-area': 'auto',
  'map-library-preview': 'auto',
  'gallery-show-position': 'auto',
};

/**
 * True while the map is given over to a click on a *feature* — joining two
 * lines, aiming a cut. The chrome goes away as it does for a picking mode, but
 * the features stay live: the click these are waiting for is a click on one.
 * The armed mode's own toolbar says what it wants and cancels it.
 */
export const armedModeSelector = (state: RootState): boolean =>
  // The feature's toolbar rides its selection, so a mode can never take the
  // chrome away without it.
  state.main.selection?.type === 'feature' &&
  (state.trackViewer.joinWith !== null || state.trackViewer.splitting);

/** Whether the map is in a mode of its own, whichever kind. */
export const mapModeSelector = (state: RootState): boolean =>
  inPickingModeSelector(state) || armedModeSelector(state);

// The active tool as far as map interaction is concerned: the open map-click
// tool, but masked to null while a picking mode owns the map so it goes inert.
// Map-interaction code should read this; menus/processors that want to know
// whether a toolbar is up should use isToolOpen.
export const activeMapToolSelector = (state: RootState): Tool | null =>
  inPickingModeSelector(state) ? null : activeModeSelector(state);

export const showGalleryPickerSelector = createSelector(
  activeMapToolSelector,
  mapLayersSelector,
  inPickingModeSelector,
  drawingLineSelector,
  (state: RootState) => areFeaturesHidden(state.map.featuresOpacity),
  (tool, layers, picking, drawingLine, hidden) =>
    // The picker takes clicks of its own, so it wants the map to itself; not
    // for photos faded with the features (⇧D) out of sight.
    !tool && layers.includes('I') && !picking && !drawingLine && !hidden,
);

export const showGalleryViewerSelector = (state: RootState): boolean =>
  state.gallery.pickingPositionForId === null &&
  state.gallery.activeImageId !== null &&
  !state.gallery.showPosition;

const pencilCursor = `url(${pencil}) 1.5 20, crosshair`;

const markerCursor = `url(${marker}) 13.5 26, crosshair`;

export const mouseCursorSelector = createSelector(
  pickingModeSelector,
  activeMapToolSelector,
  routePlannerPickModeSelector,
  showGalleryPickerSelector,
  drawingLineSelector,
  (picking, tool, routePlannerPickMode, showGalleryPicker, drawing) => {
    if (picking) {
      return PICKING_CURSOR[picking];
    }

    if (showGalleryPicker) {
      return 'crosshair';
    }

    if (drawing) {
      return pencilCursor;
    }

    switch (tool) {
      case 'draw-lines':
        return pencilCursor;

      case 'draw-polygons':
        return pencilCursor;

      case 'map-details':
        return 'help';

      case 'draw-points':
        return markerCursor;

      case 'route-planner':
        return routePlannerPickMode ? 'crosshair' : 'auto';

      default:
        return 'auto';
    }
  },
);

////

export const trackingTracksSelector = (state: RootState): Track[] =>
  state.tracking.tracks;

export const trackingActiveTrackIdSelector = (
  state: RootState,
): string | undefined =>
  state.main.selection?.type === 'tracking'
    ? state.main.selection.id
    : undefined;

export const trackingTrackSelector = createSelector(
  trackingTracksSelector,
  trackingActiveTrackIdSelector,
  (trackingTracks, trackingActiveTrackId) =>
    trackingActiveTrackId
      ? trackingTracks.find((t) => t.token === trackingActiveTrackId)
      : undefined,
);

export const selectingModeSelector = (state: RootState): boolean => {
  const mode = activeModeSelector(state);

  return (
    !window.fmEmbedded &&
    !inPickingModeSelector(state) &&
    state.trackViewer.drawing === null &&
    // selection works when no map-click tool captures the click, except a
    // route-planner that is actively picking points
    (mode === null ||
      (mode === 'route-planner' && state.routePlanner.pickMode === null))
  );
};

export const drawingLinePolys = (state: RootState): boolean => {
  // The open drawing tool captures clicks (to start a line). So does an
  // in-progress drawing (to append points), which a "continue" starts without
  // opening any tool.
  const tool = activeMapToolSelector(state);

  return (
    tool === 'draw-lines' ||
    tool === 'draw-polygons' ||
    // A picking mode owns the map, so an in-progress drawing must go inert there
    // too — mirror the masking `activeMapToolSelector` already applies.
    (state.trackViewer.drawing !== null && !inPickingModeSelector(state))
  );
};

export const trackGeojsonIsSuitableForElevationChart = (
  state: RootState,
): boolean =>
  // Any line-like feature (the active track is chosen among them); a
  // `MultiLineString` is a multi-segment recording (an interrupted track).
  (state.trackViewer.trackGeojson?.features ?? []).some(isTrackLine);

export const askingCookieConsentSelector = (state: RootState): boolean =>
  COOKIE_CONSENT_TOAST_ID in state.toasts.toasts;

// Whether `clearMapFeatures` would actually remove anything from the map —
// drives showing the "Clear map" command. Mirrors the slices that reset on
// `clearMapFeatures` (see their reducers), limited to the ones that put
// user-visible features on the map.
export const hasClearableMapFeaturesSelector = (state: RootState): boolean =>
  state.main.selection !== null ||
  state.routePlanner.points.length > 0 ||
  state.objects.objects.length > 0 ||
  state.changesets.changesets.length > 0 ||
  state.search.selectedResults.length > 0 ||
  state.trackViewer.trackGeojson !== null ||
  state.tracking.trackedDevices.length > 0;
