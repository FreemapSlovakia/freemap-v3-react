import { createSelector } from 'reselect';
import { Tool } from '../actions/mainActions.js';
import { PickMode } from '../actions/routePlannerActions.js';
import marker from '../images/cursors/marker.svg';
import pencil from '../images/cursors/pencil.svg';
import type { RootState } from '../store.js';
import { Track } from '../types/trackingTypes.js';

export const toolSelector = (state: RootState): Tool | null => state.main.tool;

export const mapOverlaysSelector = (state: RootState): string[] =>
  state.map.overlays;

export const selectingHomeLocationSelector = (state: RootState): boolean =>
  state.main.selectingHomeLocation !== false;

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

export const showGalleryPickerSelector = createSelector(
  toolSelector,
  mapOverlaysSelector,
  galleryPickingPositionForIdSelector,
  galleryShowPositionSelector,
  selectingHomeLocationSelector,
  drawingLineSelector,
  (
    tool,
    mapOverlays,
    galleryPickingPositionForId,
    galleryShowPosition,
    selectingHomeLocation,
    drawingLine,
  ) =>
    (!tool ||
      ['photos', 'track-viewer', 'objects', 'changesets'].includes(tool)) &&
    mapOverlays.includes('I') &&
    galleryPickingPositionForId === null &&
    !galleryShowPosition &&
    !selectingHomeLocation &&
    !drawingLine,
);

export const showGalleryViewerSelector = (state: RootState): boolean =>
  state.gallery.pickingPositionForId === null &&
  state.gallery.activeImageId !== null &&
  !state.gallery.showPosition;

const pencilCursor = `url(${pencil}) 1.5 20, crosshair`;

const markerCursor = `url(${marker}) 13.5 26, crosshair`;

export const mouseCursorSelector = createSelector(
  selectingHomeLocationSelector,
  toolSelector,
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
  !state.drawingLines.drawing &&
  (state.main.tool === null ||
    state.main.tool === 'track-viewer' ||
    state.main.tool === 'changesets' ||
    state.main.tool === 'objects' ||
    (state.main.tool === 'route-planner' &&
      state.routePlanner.pickMode === null));

export const drawingLinePolys = (state: RootState): boolean =>
  state.drawingLines.drawing ||
  state.main.tool === 'draw-lines' ||
  state.main.tool === 'draw-polygons';

export const trackGeojsonIsSuitableForElevationChart = (
  state: RootState,
): boolean => {
  const { trackGeojson } = state.trackViewer;

  if (trackGeojson && trackGeojson.features) {
    const firstGeojsonFeature = trackGeojson.features[0];

    return (
      firstGeojsonFeature && firstGeojsonFeature.geometry.type === 'LineString'
    );
  }

  return false;
};
