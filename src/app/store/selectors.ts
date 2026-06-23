import { PickMode } from '@features/routePlanner/model/actions.js';
import { Track } from '@features/tracking/model/types.js';
import { createSelector } from 'reselect';
import marker from '@/images/cursors/marker.svg';
import pencil from '@/images/cursors/pencil.svg';
import { Tool } from '../store/actions.js';
import type { RootState } from '../store/store.js';

export const toolSelector = (state: RootState): Tool | null => state.main.tool;

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

// The active tool as far as map interaction is concerned: the selected tool,
// but masked to null while a picking mode owns the map so map-click tools go
// inert. Map-interaction code should read this; menus/processors that want the
// genuinely-selected tool should use toolSelector.
export const activeMapToolSelector = (state: RootState): Tool | null =>
  pickingModeSelector(state) ? null : state.main.tool;

export const showGalleryPickerSelector = createSelector(
  toolSelector,
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
    (!tool ||
      ['photos', 'import-file', 'objects', 'changesets'].includes(tool)) &&
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

export const selectingModeSelector = (state: RootState): boolean =>
  !window.fmEmbedded &&
  !pickingModeSelector(state) &&
  !state.drawingLines.drawing &&
  (state.main.tool === null ||
    state.main.tool === 'import-file' ||
    state.main.tool === 'changesets' ||
    state.main.tool === 'objects' ||
    state.main.tool === 'tracking' ||
    (state.main.tool === 'route-planner' &&
      state.routePlanner.pickMode === null));

export const drawingLinePolys = (state: RootState): boolean =>
  !pickingModeSelector(state) &&
  (state.drawingLines.drawing ||
    state.main.tool === 'draw-lines' ||
    state.main.tool === 'draw-polygons');

export const trackGeojsonIsSuitableForElevationChart = (
  state: RootState,
): boolean => {
  return (
    state.trackViewer.trackGeojson?.features?.[0]?.geometry.type ===
    'LineString'
  );
};

export const askingCookieConsentSelector = (state: RootState): boolean =>
  'cookieConsent' in state.toasts.toasts;
