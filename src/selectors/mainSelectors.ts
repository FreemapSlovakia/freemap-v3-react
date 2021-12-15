import { Tool } from 'fm3/actions/mainActions';
import { PickMode } from 'fm3/actions/routePlannerActions';
import marker from 'fm3/images/cursors/marker.svg';
import pencil from 'fm3/images/cursors/pencil.svg';
import { Track } from 'fm3/types/trackingTypes';
import { DefaultRootState } from 'react-redux';
import { createSelector } from 'reselect';

export const toolSelector = (state: DefaultRootState): Tool | null =>
  state.main.tool;

export const mapOverlaysSelector = (state: DefaultRootState): string[] =>
  state.map.overlays;

export const selectingHomeLocationSelector = (
  state: DefaultRootState,
): boolean => state.main.selectingHomeLocation !== false;

export const routePlannerPickModeSelector = (
  state: DefaultRootState,
): PickMode | null => state.routePlanner.pickMode;

export const galleryPickingPositionForIdSelector = (
  state: DefaultRootState,
): number | null => state.gallery.pickingPositionForId;

export const galleryShowPositionSelector = (state: DefaultRootState): boolean =>
  state.gallery.showPosition;

export const drawingLineSelector = (state: DefaultRootState): boolean =>
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

export const showGalleryViewerSelector = (state: DefaultRootState): boolean =>
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
  (state: DefaultRootState) => state.drawingLines.drawing,
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

export const trackingTracksSelector = (state: DefaultRootState): Track[] =>
  state.tracking.tracks;

export const trackingActiveTrackIdSelector = (
  state: DefaultRootState,
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

export const selectingModeSelector = (state: DefaultRootState): boolean =>
  !window.fmEmbedded &&
  !state.drawingLines.drawing &&
  (state.main.tool === null ||
    state.main.tool === 'track-viewer' ||
    state.main.tool === 'changesets' ||
    state.main.tool === 'objects' ||
    (state.main.tool === 'route-planner' &&
      state.routePlanner.pickMode === null));

export const drawingLinePolys = (state: DefaultRootState): boolean =>
  state.drawingLines.drawing ||
  state.main.tool === 'draw-lines' ||
  state.main.tool === 'draw-polygons';

export const trackGeojsonIsSuitableForElevationChart = (
  state: DefaultRootState,
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
