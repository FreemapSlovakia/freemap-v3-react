import { Tool } from 'fm3/actions/mainActions';
import { PickMode } from 'fm3/actions/routePlannerActions';
import { RootState } from 'fm3/storeCreator';
import { Track } from 'fm3/types/trackingTypes';
import { createSelector } from 'reselect';

export const toolSelector = (state: RootState): Tool | null => state.main.tool;

export const mapOverlaysSelector = (state: RootState): string[] =>
  state.map.overlays;

export const selectingHomeLocationSelector = (state: RootState): boolean =>
  state.main.selectingHomeLocation;

export const routePlannerPickModeSelector = (
  state: RootState,
): PickMode | null => state.routePlanner.pickMode;

export const galleryPickingPositionForIdSelector = (
  state: RootState,
): number | null => state.gallery.pickingPositionForId;

export const galleryShowPositionSelector = (state: RootState): boolean =>
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

export const showGalleryViewerSelector = (state: RootState): boolean =>
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
      ? trackingTracks.find((t) => t.id === trackingActiveTrackId)
      : undefined,
);

export const selectingModeSelector = (state: RootState): boolean =>
  !window.fmEmbedded &&
  !state.drawingLines.drawing &&
  (state.main.tool === null ||
    state.main.tool === 'track-viewer' ||
    state.main.tool === 'changesets' ||
    state.main.tool === 'maps' ||
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
