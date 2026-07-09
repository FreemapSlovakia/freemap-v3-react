import type { PickMode } from '@features/routePlanner/model/actions.js';
import type { Track } from '@features/tracking/model/types.js';
import { isTrackLine } from '@features/trackViewer/trackSelection.js';
import { isDrawTool } from '@shared/toolDefinitions.js';
import { createSelector } from 'reselect';
import marker from '@/images/cursors/marker.svg';
import pencil from '@/images/cursors/pencil.svg';
import type { Tool } from '../store/actions.js';
import type { RootState } from '../store/store.js';

export const toolsSelector = (state: RootState): Tool[] => state.main.tools;

// The focused/active tool — i.e. the one that owns map clicks. The reducer only
// ever sets `activeTool` to a map-click tool (or null), so it always reflects
// "the active mode" without further filtering.
export const activeModeSelector = (state: RootState): Tool | null =>
  state.main.activeTool;

// The open draw-* tool, regardless of which tool is focused (the three draw
// tools share one menu, so at most one is open).
export const openDrawToolSelector = (state: RootState): Tool | null =>
  state.main.tools.find(isDrawTool) ?? null;

export const mapLayersSelector = (state: RootState): string[] =>
  state.map.layers;

export const selectingHomeLocationSelector = (state: RootState): boolean =>
  state.homeLocation.selectingHomeLocation !== false;

export const routePlannerPickModeSelector = (
  state: RootState,
): PickMode | null => state.routePlanner.pickMode;

export const galleryPickingPositionForIdSelector = (
  state: RootState,
): number | null => state.gallery.pickingPositionForId;

export const galleryShowPositionSelector = (state: RootState): boolean =>
  state.gallery.showPosition;

export const drawingLineSelector = (state: RootState): boolean =>
  state.drawingLines.drawing;

export const mapAreaSelectingSelector = (state: RootState): boolean =>
  state.mapArea.selecting !== null;

// True while the map is in a dedicated mode that takes over the map: picking a
// home location, picking or showing a photo location, or drawing an export/cache
// area. In these modes the regular features stay visible but non-interactive and
// the tools stay inert (clicks don't draw points, add route legs, etc.).
export const pickingModeSelector = (state: RootState): boolean =>
  selectingHomeLocationSelector(state) ||
  galleryPickingPositionForIdSelector(state) !== null ||
  galleryShowPositionSelector(state) ||
  mapAreaSelectingSelector(state);

// The active tool as far as map interaction is concerned: the open map-click
// tool, but masked to null while a picking mode owns the map so it goes inert.
// Map-interaction code should read this; menus/processors that want the open
// set should use toolsSelector / activeModeSelector.
export const activeMapToolSelector = (state: RootState): Tool | null =>
  pickingModeSelector(state) ? null : activeModeSelector(state);

export const showGalleryPickerSelector = createSelector(
  activeMapToolSelector,
  mapLayersSelector,
  galleryPickingPositionForIdSelector,
  galleryShowPositionSelector,
  selectingHomeLocationSelector,
  drawingLineSelector,
  mapAreaSelectingSelector,
  (
    tool,
    layers,
    galleryPickingPositionForId,
    galleryShowPosition,
    selectingHomeLocation,
    drawingLine,
    mapAreaSelecting,
  ) =>
    // gallery picker is available only when no map-click tool owns the click
    !tool &&
    layers.includes('I') &&
    galleryPickingPositionForId === null &&
    !galleryShowPosition &&
    !selectingHomeLocation &&
    !drawingLine &&
    !mapAreaSelecting,
);

export const showGalleryViewerSelector = (state: RootState): boolean =>
  state.gallery.pickingPositionForId === null &&
  state.gallery.activeImageId !== null &&
  !state.gallery.showPosition;

const pencilCursor = `url(${pencil}) 1.5 20, crosshair`;

const markerCursor = `url(${marker}) 13.5 26, crosshair`;

export const mouseCursorSelector = createSelector(
  selectingHomeLocationSelector,
  activeMapToolSelector,
  routePlannerPickModeSelector,
  showGalleryPickerSelector,
  galleryShowPositionSelector,
  (state: RootState) => state.drawingLines.drawing,
  (
    selectingHomeLocation,
    tool,
    routePlannerPickMode,
    showGalleryPicker,
    galleryShowPosition,
    drawing,
  ) => {
    if (galleryShowPosition) {
      return 'auto';
    }

    if (selectingHomeLocation || showGalleryPicker) {
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
): string | number | undefined =>
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
    !pickingModeSelector(state) &&
    !state.drawingLines.drawing &&
    // selection works when no map-click tool captures the click, except a
    // route-planner that is actively picking points
    (mode === null ||
      (mode === 'route-planner' && state.routePlanner.pickMode === null))
  );
};

export const drawingLinePolys = (state: RootState): boolean => {
  // The active drawing tool captures clicks (to start a line) — being merely
  // open (visible toolbar) must not. An in-progress drawing also captures
  // clicks (to append points) even after its tool was deactivated or closed,
  // and during a "continue" that never activated a tool.
  const tool = activeMapToolSelector(state);

  return (
    tool === 'draw-lines' ||
    tool === 'draw-polygons' ||
    // A picking mode owns the map, so an in-progress drawing must go inert there
    // too — mirror the masking `activeMapToolSelector` already applies.
    (state.drawingLines.drawing && !pickingModeSelector(state))
  );
};

export const trackGeojsonIsSuitableForElevationChart = (
  state: RootState,
): boolean =>
  // Any line-like feature (the active track is chosen among them); a
  // `MultiLineString` is a multi-segment recording (an interrupted track).
  (state.trackViewer.trackGeojson?.features ?? []).some(isTrackLine);

export const askingCookieConsentSelector = (state: RootState): boolean =>
  'cookieConsent' in state.toasts.toasts;

// Whether `clearMapFeatures` would actually remove anything from the map —
// drives showing the "Clear map" command. Mirrors the slices that reset on
// `clearMapFeatures` (see their reducers), limited to the ones that put
// user-visible features on the map.
export const hasClearableMapFeaturesSelector = (state: RootState): boolean =>
  state.main.selection !== null ||
  state.drawingPoints.points.length > 0 ||
  state.drawingLines.lines.length > 0 ||
  state.routePlanner.points.length > 0 ||
  state.objects.objects.length > 0 ||
  state.changesets.changesets.length > 0 ||
  state.search.selectedResult !== null ||
  state.trackViewer.trackGeojson !== null ||
  state.tracking.trackedDevices.length > 0;
