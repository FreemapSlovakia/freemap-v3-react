import type { RootState } from '@app/store/store.js';
import {
  getMapContentParts,
  serializeQuery,
} from '@app/url/mapContentParts.js';
import {
  featureToWire,
  toWire,
  wireForm,
} from '@features/dataViewer/drawingWire.js';
import { documentFeatures } from '@features/dataViewer/model/collection.js';
import {
  completeCollection,
  featuresInLink,
} from '@features/dataViewer/model/urlForm.js';
import { presetOnlyConfigs } from '@features/map/model/layerSetup.js';
import { inlinePresets } from '@features/map/model/mapPreset.js';
import { routePlannerFromMapData } from '@features/routePlanner/model/reducer.js';
import { savedRouteFromState } from '@features/routePlanner/model/savedRoute.js';
import { savedSearchResultsFromState } from '@features/search/model/savedSearchResults.js';
import { upgradeObjectFilter } from '@osm/taxon.js';
import type { Feature } from 'geojson';
import { hash } from 'ohash';
import { createSelector } from 'reselect';
import type { MapData } from './actions.js';

/**
 * Where each feature stands, in the order the document lists them — its points,
 * then its lines, then the rest — or `undefined` when that is already the order.
 */
function documentOrder(features: readonly Feature[]): number[] | undefined {
  const groups: number[][] = [[], [], []];

  for (const [i, feature] of features.entries()) {
    const wire = featureToWire(feature);

    groups[!wire ? 2 : 'point' in wire ? 0 : 1]!.push(i);
  }

  const order = groups.flat();

  return order.every((at, i) => at === i) ? undefined : order;
}

/**
 * The saveable map document as it currently stands. Single source of truth for
 * what a saved map contains — used both to persist the map and to decide whether
 * it has unsaved changes.
 */
export function getMapDataFromState(state: RootState): MapData {
  const { tracking, routePlanner, objects, gallery, trackViewer, map, search } =
    state;

  // What the drawing form can say goes where every client reads it; the rest
  // rides as the viewer's track.
  const features = trackViewer.trackGeojson
    ? completeCollection(trackViewer.trackGeojson).features
    : [];

  const { items, rest } = toWire(features);

  const { points, lines } = wireForm(items);

  const order = documentOrder(features);

  return {
    lines,
    points,
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
      trackGeojson: rest.length
        ? { type: 'FeatureCollection', features: rest }
        : null,
      trackUID: trackViewer.trackUID,
      gpxUrl: trackViewer.gpxUrl,
      ...(order && { order }),
    },
    map: {
      lat: map.lat,
      lon: map.lon,
      zoom: map.zoom,
      customLayers: map.customLayers,
      ...documentLayers(map),
    },
  };
}

/**
 * The stack with its presets copied in, for readers who don't have the
 * author's presets, and each drawn map's setup: a map only in presets by its
 * shading and layers, the copies holding the rest.
 */
function documentLayers(map: RootState['map']) {
  const inline = inlinePresets(
    map.layers,
    (id) =>
      map.presets.find((p) => p.id === id) ??
      map.linkPresets.find((p) => p.id === id),
  );

  return {
    ...inline,
    layerSetups: Object.fromEntries([
      ...map.layers.flatMap((type) =>
        map.layerSetups[type] ? [[type, map.layerSetups[type]]] : [],
      ),
      ...presetOnlyConfigs(inline.presets, map.layers, map.layerSetups),
    ]),
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
 * screen against the stored copy: the content the URL carries, plus the
 * features where it can't carry them.
 *
 * The map viewport and layers are deliberately absent — panning and switching
 * the background aren't edits — as are custom layers and shading, which live in
 * localStorage and merge in from there.
 */
function fingerprint(state: RootState): string {
  const fc = state.trackViewer.trackGeojson;

  return hash([
    mapContentString(state),
    // What the link carries is in the content string already.
    featuresInLink(state.trackViewer) || !fc
      ? ''
      : fingerprintTrack(completeCollection(fc)),
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
  const features = documentFeatures(
    data.points,
    data.lines,
    data.trackViewer?.trackGeojson,
    data.trackViewer?.order,
  );

  return fingerprint({
    ...base,
    // Built by the same function the load uses, so the two can't disagree about
    // what a document puts on screen. Slice defaults, not live state, stand in
    // for fields the document omits (e.g. a legacy document without
    // `finishOnly`) — falling back to the screen would make a genuinely changed
    // map read as saved.
    routePlanner: routePlannerFromMapData(data.routePlanner),
    objects: {
      ...base.objects,
      active: [
        ...new Set((data.objectsV2?.active ?? []).map(upgradeObjectFilter)),
      ],
    },
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
      trackGeojson: features.length
        ? { type: 'FeatureCollection', features }
        : null,
      // A source the document names is downloaded into features, not kept.
      trackUID: null,
      gpxUrl: null,
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
      tracking: { trackedDevices },
      routePlanner,
      objects: { active },
      gallery: { filter },
      trackViewer: { trackGeojson, trackUID, gpxUrl },
      search: { selectedResults, previewId },
    } as RootState),
);
