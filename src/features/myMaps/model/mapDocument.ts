import type { RootState } from '@app/store/store.js';
import {
  getMapContentParts,
  serializeQuery,
} from '@app/url/mapContentParts.js';
import { hash } from 'ohash';
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
  } = state;

  return {
    lines: drawingLines.lines,
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
    },
    objectsV2: {
      active: objects.active,
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
    drawingLines: { ...base.drawingLines, lines: data.lines ?? [] },
    drawingPoints: { ...base.drawingPoints, points: data.points ?? [] },
    routePlanner: {
      ...base.routePlanner,
      ...data.routePlanner,
      points: data.routePlanner?.points ?? [],
    },
    objects: { ...base.objects, active: data.objectsV2?.active ?? [] },
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

// Inputs of the last digest, so repeated calls on unrelated dispatches (panning,
// opening a menu) are free. A pure cache: a miss only costs a recomputation, so
// unlike a tracked flag it can't fall out of step with the state.
let memoInputs: unknown[] = [];

let memoValue = '';

/** The digest of what's on screen right now. */
export function fingerprintState(state: RootState): string {
  const inputs = [
    state.drawingLines.lines,
    state.drawingPoints.points,
    state.tracking.trackedDevices,
    state.routePlanner,
    state.objects.active,
    state.gallery.filter,
    state.trackViewer.trackGeojson,
    state.trackViewer.trackUID,
    state.trackViewer.gpxUrl,
  ];

  if (
    inputs.length === memoInputs.length &&
    inputs.every((input, i) => input === memoInputs[i])
  ) {
    return memoValue;
  }

  memoInputs = inputs;

  memoValue = fingerprint(state);

  return memoValue;
}
