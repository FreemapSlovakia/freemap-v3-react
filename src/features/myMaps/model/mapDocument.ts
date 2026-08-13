import type { RootState } from '@app/store/store.js';
import {
  getMapContentParts,
  serializeQuery,
} from '@app/url/mapContentParts.js';
import {
  type DrawnLine,
  type Line,
  toWireHoleIndexes,
} from '@features/drawing/model/actions/drawingLineActions.js';
import { routePlannerFromMapData } from '@features/routePlanner/model/reducer.js';
import { savedRouteFromState } from '@features/routePlanner/model/savedRoute.js';
import { savedSearchResultsFromState } from '@features/search/model/savedSearchResults.js';
import { hash } from 'ohash';
import { createSelector } from 'reselect';
import type { MapData } from './actions.js';

/**
 * The saveable map document as it currently stands. Single source of truth for
 * what a saved map contains — used both to persist the map and to decide whether
 * it has unsaved changes.
 */
export function getMapDataFromState(state: RootState): MapData {
  const {
    tracking,
    drawingLines,
    drawingPoints,
    routePlanner,
    objects,
    gallery,
    trackViewer,
    map,
    search,
  } = state;

  const holeIndexes = toWireHoleIndexes(drawingLines.lines);

  return {
    // Without the store-only `id`: a document carries no line identity, and
    // reading one back assigns fresh ids anyway, so a hole names its parent by
    // position instead.
    lines: drawingLines.lines.map(
      ({ id: _id, holeOfId: _holeOfId, ...line }, i) => ({
        ...line,
        holeOf: holeIndexes[i],
      }),
    ),
    points: drawingPoints.points,
    tracking: {
      trackedDevices: tracking.trackedDevices,
    },
    routePlanner: {
      transportType: routePlanner.transportType,
      points: routePlanner.points,
      finishOnly: routePlanner.finishOnly,
      pickMode: routePlanner.pickMode,
      mode: routePlanner.mode,
      milestones: routePlanner.milestones,
      roundtripParams: routePlanner.roundtripParams,
      isochroneParams: routePlanner.isochroneParams,
      // The computed route, so the map opens without a routing request — and
      // opens at all offline. Deliberately outside the fingerprint below: it is
      // built lazily after the map is on screen, so digesting it would report a
      // map as changed for merely having been looked at.
      result: savedRouteFromState(routePlanner),
    },
    objectsV2: {
      active: objects.active,
    },
    // The pinned results themselves, so the map draws them without fetching
    // each element again — and draws the ones the URL can't name at all.
    search: {
      results: savedSearchResultsFromState(search),
    },
    galleryFilter: gallery.filter,
    // Only the fields the loader reads back; the rest of the slice is transient
    // view state (selected track, elevation decision, render cache).
    trackViewer: {
      trackGeojson: trackViewer.trackGeojson,
      trackUID: trackViewer.trackUID,
      gpxUrl: trackViewer.gpxUrl,
    },
    map: {
      lat: map.lat,
      lon: map.lon,
      zoom: map.zoom,
      layers: map.layers,
      customLayers: map.customLayers,
      shading: map.shading,
    },
  };
}

// A track is large and changes rarely, so its digest is cached against the
// object itself — a drawing edit then re-digests only the small fields.
const trackFingerprints = new WeakMap<object, string>();

function fingerprintTrack(track: object | null | undefined): string {
  if (!track) {
    return '';
  }

  const cached = trackFingerprints.get(track);

  if (cached !== undefined) {
    return cached;
  }

  const fingerprint = hash(track);

  trackFingerprints.set(track, fingerprint);

  return fingerprint;
}

/**
 * No digest equals this, so a map carrying it reads as having unsaved changes.
 * Used when content was restored but the copy to compare it against can't be
 * read: it can't be shown as saved, and treating it as unsaved is the safe
 * answer.
 */
export const UNKNOWN_FINGERPRINT = '';

/**
 * What the map holds, exactly as the URL writes it.
 *
 * Sharing the URL's own serialization is what makes the comparison reliable: a
 * map restored from its URL produces the identical string, so anything the round
 * trip drops or reshapes — point ids, coordinate precision, a default line cap,
 * an unset filter — is absent from both sides instead of reading as a change.
 * Exported for the dev-only mismatch logging.
 */
export function mapContentString(state: RootState): string {
  return serializeQuery(getMapContentParts(state));
}

/**
 * A digest of everything that counts as a change to the map, for comparing the
 * screen against the stored copy: the content the URL carries, plus the track,
 * which it can't.
 *
 * The map viewport and layers are deliberately absent — panning and switching
 * the background aren't edits — as are custom layers and shading, which live in
 * localStorage and merge in from there.
 */
function fingerprint(state: RootState): string {
  return hash([
    mapContentString(state),
    fingerprintTrack(state.trackViewer.trackGeojson),
  ]);
}

/**
 * A document's lines in store shape, so the shared serialization sees what it
 * would on screen. Giving each line its index as its id makes the `holeOf`
 * index and the store's `holeOfId` the same number, and the serializer maps it
 * straight back.
 */
function linesAsState(lines: Line[]): DrawnLine[] {
  return lines.map(({ holeOf, ...line }, id) => ({
    ...line,
    id,
    holeOfId: holeOf,
  }));
}

/**
 * The digest a map document would produce if it were on screen, for deciding
 * whether restored content actually differs from the stored map when no working
 * copy is available.
 *
 * Goes through the same serialization by borrowing the current state and
 * substituting the document's own slices — the URL serializer only emits values
 * that are set, so fields a document omits simply produce nothing, exactly as
 * they do for an untouched map.
 */
export function fingerprintDocument(data: MapData, base: RootState): string {
  return fingerprint({
    ...base,
    drawingLines: {
      ...base.drawingLines,
      lines: linesAsState(data.lines ?? []),
    },
    drawingPoints: { ...base.drawingPoints, points: data.points ?? [] },
    // Built by the same function the load uses, so the two can't disagree about
    // what a document puts on screen. Slice defaults, not live state, stand in
    // for fields the document omits (e.g. a legacy document without
    // `finishOnly`) — falling back to the screen would make a genuinely changed
    // map read as saved.
    routePlanner: routePlannerFromMapData(data.routePlanner),
    objects: { ...base.objects, active: data.objectsV2?.active ?? [] },
    // Nothing is previewed in a document: a stored result was kept, or it
    // wouldn't have been stored. A document written before pins were stored
    // says nothing about them and so is read as holding whatever is on screen —
    // the same as the load, which takes none off such a map. Answering `[]` for
    // it would report every one of them as changed forever.
    search: data.search
      ? {
          ...base.search,
          selectedResults: data.search.results,
          previewId: null,
        }
      : base.search,
    gallery: { ...base.gallery, filter: data.galleryFilter ?? {} },
    tracking: {
      ...base.tracking,
      trackedDevices: data.tracking?.trackedDevices ?? [],
    },
    trackViewer: {
      ...base.trackViewer,
      trackGeojson: data.trackViewer?.trackGeojson ?? null,
      trackUID: data.trackViewer?.trackUID ?? null,
      gpxUrl: data.trackViewer?.gpxUrl ?? null,
    },
  } as RootState);
}

/**
 * The digest of what's on screen right now.
 *
 * Memoized on exactly the slices the content serialization reads, so the
 * repeated calls on unrelated dispatches — panning, opening a menu — are free
 * and this stays cheap enough for the unsaved-changes selector to call on every
 * render. A pure cache: a miss only costs a recomputation, so unlike a tracked
 * flag it can't fall out of step with the state.
 */
export const fingerprintState = createSelector(
  [
    (state: RootState) => state.drawingLines.lines,
    (state: RootState) => state.drawingPoints.points,
    (state: RootState) => state.tracking.trackedDevices,
    (state: RootState) => state.routePlanner,
    (state: RootState) => state.objects.active,
    (state: RootState) => state.gallery.filter,
    (state: RootState) => state.trackViewer.trackGeojson,
    (state: RootState) => state.trackViewer.trackUID,
    (state: RootState) => state.trackViewer.gpxUrl,
    (state: RootState) => state.search.selectedResults,
    (state: RootState) => state.search.previewId,
  ],
  (
    lines,
    points,
    trackedDevices,
    routePlanner,
    active,
    filter,
    trackGeojson,
    trackUID,
    gpxUrl,
    selectedResults,
    previewId,
  ) =>
    // Only the slices the serialization reads are rebuilt, so anything it starts
    // reading without being listed above fails here rather than silently
    // digesting a stale value.
    fingerprint({
      drawingLines: { lines },
      drawingPoints: { points },
      tracking: { trackedDevices },
      routePlanner,
      objects: { active },
      gallery: { filter },
      trackViewer: { trackGeojson, trackUID, gpxUrl },
      search: { selectedResults, previewId },
    } as RootState),
);
