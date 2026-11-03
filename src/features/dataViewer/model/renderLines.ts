import type { RootAction } from '@app/store/rootAction.js';
import type { RootState } from '@app/store/store.js';
import { colorizerNeedsElevation } from '@shared/colorizers/index.js';
import {
  creditedAttributions,
  densifyGeometry,
  enrichElevations,
  newElevationCredits,
  withElevationAttributions,
} from '@shared/elevation.js';
import { smoothElevation } from '@shared/elevationSmoothing.js';
import { elevationCoverage, withoutPerPointData } from '@shared/geoutils.js';
import type { AttributionDef } from '@shared/mapDefinitions.js';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { Dispatch } from 'redux';
import { isRecording } from '../trackChannels.js';
import {
  isTrackLine,
  resolveActiveTrack,
  type TrackLine,
} from '../trackSelection.js';
import { dataViewerSetRenderGeojson } from './actions.js';
import { withoutElevation } from './elevationTargets.js';
import type { ElevationDecision } from './reducer.js';
import { TRACK_INFO_TOAST_ID } from './trackInfoToast.js';

/**
 * The render copy of the loaded lines (`renderTrackGeojson`): what the chart,
 * the colorize and the info stats draw, never exported. Any line but a
 * recording (`isRecording`) is drawn from the terrain model throughout — at its
 * vertices and densified between them — whatever it stores. A recording keeps
 * its measurements: *fill missing* fills its gaps (no points added, so its
 * channels stay) and *override all* also densifies it. Terrain values get the
 * culvert ditches filled.
 *
 * Kept per line against its geometry, which a restyle leaves alone, so an edit
 * costs only the line whose shape it changed; fetched only for what is shown
 * (`shownLines`), the lines of one build in one request.
 */

/** A line's sampled geometry, and what it is credited to. */
type Entry = {
  geometry: TrackLine['geometry'];
  terrain: boolean;
  /** Points were inserted, so per-point data no longer lines up. */
  densified: boolean;
  /** Every model that answered the build — of this line or another in it. */
  attributions: AttributionDef[];
};

type Key = 'terrain' | ElevationDecision;

const built = new WeakMap<Geometry, Map<Key, Promise<Entry>>>();

const resolved = new WeakMap<Geometry, Map<Key, Entry>>();

/** Recordings one feature's *override all* replaced, drawn as overridden. */
const overridden = new WeakSet<Geometry>();

const recordings = new WeakMap<TrackLine, boolean>();

const rendered = new WeakMap<
  Entry,
  { properties: unknown; settings: object; feature: TrackLine }
>();

/** Draws this recording's geometry as an overridden one's, for this session. */
export function markOverridden(geometry: Geometry): void {
  overridden.add(geometry);
}

function recording(line: TrackLine): boolean {
  let is = recordings.get(line);

  if (is === undefined) {
    is = isRecording(line);

    recordings.set(line, is);
  }

  return is;
}

/** What a line's copy is built under: a recording's depends on the choice. */
function keyOf(line: TrackLine, decision: ElevationDecision): Key {
  return !recording(line)
    ? 'terrain'
    : overridden.has(line.geometry)
      ? 'all'
      : decision;
}

/** Whether the line is drawn from anything but what it stores. */
function sampled(line: TrackLine, key: Key): boolean {
  return (
    key === 'terrain' ||
    key === 'all' ||
    (key === 'missing' && elevationCoverage([line]) !== 'full')
  );
}

/** The lines something on screen shows elevation of, by index. */
export function shownLines(state: RootState): number[] {
  const { trackGeojson, activeTrackIndex } = state.trackViewer;

  const mode = state.trackViewerSettings.colorizeTrackBy;

  if (mode && colorizerNeedsElevation(mode)) {
    return (trackGeojson?.features ?? []).flatMap((f, i) =>
      isTrackLine(f) ? [i] : [],
    );
  }

  if (
    state.elevationChart.target?.type === 'track-viewer' ||
    TRACK_INFO_TOAST_ID in state.toasts.toasts
  ) {
    const active = resolveActiveTrack(trackGeojson, activeTrackIndex);

    return active ? [active.index] : [];
  }

  return [];
}

/** Whether a line has a render copy still to fetch. */
export function needsBuild(
  line: Feature,
  decision: ElevationDecision,
): boolean {
  if (!isTrackLine(line)) {
    return false;
  }

  const key = keyOf(line, decision);

  return !built.get(line.geometry)?.has(key) && sampled(line, key);
}

/** Fetches the render copies of the given lines that are still missing. */
export async function buildLines(
  getState: () => RootState,
  dispatch: Dispatch<RootAction>,
  indices: number[],
): Promise<void> {
  const { trackGeojson, elevationDecision } = getState().trackViewer;

  const todo: {
    geometry: Geometry;
    key: Key;
    prepared: TrackLine;
    densified: boolean;
  }[] = [];

  const waits: Promise<Entry>[] = [];

  for (const i of indices) {
    const line = trackGeojson?.features[i];

    if (!line || !isTrackLine(line)) {
      continue;
    }

    const key = keyOf(line, elevationDecision);

    const pending = built.get(line.geometry)?.get(key);

    if (pending) {
      waits.push(pending);
    } else if (sampled(line, key)) {
      const prepared =
        key === 'terrain'
          ? densifyGeometry(withoutElevation(line) as TrackLine)
          : key === 'all'
            ? densifyGeometry(line)
            : line;

      todo.push({
        geometry: line.geometry,
        key,
        prepared,
        // Only a recording has per-point data to fall out of line.
        densified: key === 'all' && prepared !== line,
      });
    }
  }

  if (todo.length) {
    const credits = newElevationCredits();

    // One request for every line of the build.
    const batch = enrichElevations(
      todo.map(({ prepared }) => prepared),
      'missing',
      getState,
      undefined,
      credits,
    );

    for (const [k, { geometry, key, densified }] of todo.entries()) {
      const terrain = key !== 'missing';

      const entry = batch.then((sampledLines): Entry => {
        const result = {
          geometry: sampledLines[k]!.geometry,
          terrain,
          densified,
          attributions: terrain ? creditedAttributions(credits) : [],
        };

        let byKey = resolved.get(geometry);

        if (!byKey) {
          byKey = new Map();

          resolved.set(geometry, byKey);
        }

        byKey.set(key, result);

        return result;
      });

      let byKey = built.get(geometry);

      if (!byKey) {
        byKey = new Map();

        built.set(geometry, byKey);
      }

      byKey.set(key, entry);

      // A failed request is asked again next time.
      entry.catch(() => built.get(geometry)?.delete(key));

      waits.push(entry);
    }
  }

  await Promise.all(waits);

  publish(getState, dispatch);
}

/** Puts what is built so far on the slice, with nothing fetched. */
export function publish(
  getState: () => RootState,
  dispatch: Dispatch<RootAction>,
): void {
  const state = getState();

  const { trackGeojson, renderTrackGeojson, elevationDecision } =
    state.trackViewer;

  let any = false;

  const features = (trackGeojson?.features ?? []).map((f) => {
    if (!isTrackLine(f)) {
      return f;
    }

    const entry = resolved.get(f.geometry)?.get(keyOf(f, elevationDecision));

    if (!entry) {
      return f;
    }

    any = true;

    return renderOf(f, entry, state.elevationSettings);
  });

  const next: FeatureCollection | null =
    any && trackGeojson ? { ...trackGeojson, features } : null;

  const same =
    next === null
      ? renderTrackGeojson === null
      : renderTrackGeojson !== null &&
        renderTrackGeojson.features.length === features.length &&
        features.every((f, i) => f === renderTrackGeojson.features[i]);

  if (!same) {
    dispatch(dataViewerSetRenderGeojson(next));
  }
}

/** The line as drawn: its own properties on the sampled geometry. */
function renderOf(
  line: TrackLine,
  entry: Entry,
  settings: RootState['elevationSettings'],
): TrackLine {
  const cached = rendered.get(entry);

  if (cached?.properties === line.properties && cached.settings === settings) {
    return cached.feature;
  }

  const base: TrackLine = {
    type: 'Feature',
    properties: entry.densified
      ? withoutPerPointData(line.properties)
      : line.properties,
    geometry: entry.geometry,
  };

  const feature = entry.terrain
    ? smoothElevation(
        withElevationAttributions(base, entry.attributions),
        settings,
      )
    : base;

  rendered.set(entry, { properties: line.properties, settings, feature });

  return feature;
}
