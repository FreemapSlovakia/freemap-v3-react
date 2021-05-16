import { Tool } from 'fm3/actions/mainActions';
import { PickMode } from 'fm3/actions/routePlannerActions';
import { Track } from 'fm3/types/trackingTypes';
import { DefaultRootState } from 'react-redux';
import { createSelector } from 'reselect';

export const toolSelector = (state: DefaultRootState): Tool | null =>
  state.main.tool;

export const mapOverlaysSelector = (state: DefaultRootState): string[] =>
  state.map.overlays;

export const selectingHomeLocationSelector = (
  state: DefaultRootState,
): boolean => state.main.selectingHomeLocation;

export const routePlannerPickModeSelector = (
  state: DefaultRootState,
): PickMode | null => state.routePlanner.pickMode;

export const galleryPickingPositionForIdSelector = (
  state: DefaultRootState,
): number | null => state.gallery.pickingPositionForId;

export const galleryShowPositionSelector = (state: DefaultRootState): boolean =>
  state.gallery.showPosition;

export const showGalleryPickerSelector = createSelector(
  toolSelector,
  mapOverlaysSelector,
  galleryPickingPositionForIdSelector,
  galleryShowPositionSelector,
  selectingHomeLocationSelector,
  (
    tool,
    mapOverlays,
    galleryPickingPositionForId,
    galleryShowPosition,
    selectingHomeLocation,
  ) =>
    (!tool ||
      ['photos', 'track-viewer', 'objects', 'changesets'].includes(tool)) &&
    mapOverlays.includes('I') &&
    galleryPickingPositionForId === null &&
    !galleryShowPosition &&
    !selectingHomeLocation,
);

export const showGalleryViewerSelector = (state: DefaultRootState): boolean =>
  state.gallery.pickingPositionForId === null &&
  state.gallery.activeImageId !== null &&
  !state.gallery.showPosition;

export const mouseCursorSelector = createSelector(
  selectingHomeLocationSelector,
  toolSelector,
  routePlannerPickModeSelector,
  showGalleryPickerSelector,
  (selectingHomeLocation, tool, routePlannerPickMode, showGalleryPicker) => {
    if (selectingHomeLocation || showGalleryPicker) {
      return 'crosshair';
    }

    switch (tool) {
      case 'draw-lines':
      case 'draw-polygons':
      case 'map-details':
      case 'draw-points':
        return 'crosshair';
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
