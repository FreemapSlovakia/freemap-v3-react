import { RootState } from 'fm3/storeCreator';
import { createSelector } from 'reselect';

export const toolSelector = (state: RootState) => state.main.selection?.type;

export const mapOverlaysSelector = (state: RootState) => state.map.overlays;

export const selectingHomeLocationSelector = (state: RootState) =>
  state.main.selectingHomeLocation;

export const routePlannerPickModeSelector = (state: RootState) =>
  state.routePlanner.pickMode;

export const galleryPickingPositionForIdSelector = (state: RootState) =>
  state.gallery.pickingPositionForId;

export const galleryShowPositionSelector = (state: RootState) =>
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

export const showGalleryViewer = (state: RootState) =>
  !state.gallery.pickingPositionForId &&
  state.gallery.activeImageId &&
  !state.gallery.showPosition;

export const mouseCursorSelector = createSelector(
  selectingHomeLocationSelector,
  toolSelector,
  routePlannerPickModeSelector,
  showGalleryPickerSelector,
  (selectingHomeLocation, tool, routePlannerPickMode, showGalleryPicker) => {
    if (selectingHomeLocation) {
      return 'crosshair';
    }
    switch (tool) {
      case 'draw-lines':
      case 'draw-polygons':
      case 'map-details':
      case 'route-planner':
      case 'draw-points':
        return routePlannerPickMode ? 'crosshair' : 'auto';
      default:
        return showGalleryPicker ? 'crosshair' : 'auto';
    }
  },
);

////

export const trackingTracksSelector = (state: RootState) =>
  state.tracking.tracks;

export const trackingActiveTrackIdSelector = (state: RootState) =>
  state.main.selection?.type === 'tracking' && state.main.selection?.id;

export const trackingTrackSelector = createSelector(
  trackingTracksSelector,
  trackingActiveTrackIdSelector,
  (trackingTracks, trackingActiveTrackId) =>
    trackingActiveTrackId
      ? trackingTracks.find(t => t.id === trackingActiveTrackId)
      : undefined,
);
