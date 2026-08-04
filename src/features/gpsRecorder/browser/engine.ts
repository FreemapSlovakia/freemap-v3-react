import {
  isGeolocationSupported,
  subscribeGeolocation,
} from '@shared/geolocationWatch.js';
import { distance } from '@turf/distance';
import {
  MIN_RECORDER_VERSION_CODE,
  type RecorderConfig,
  RecorderError,
  type RecorderPoint,
  type RecorderStatus,
} from '../protocol.js';
import {
  appendBrowserPoints,
  type BrowserRecorderMeta,
  clearBrowserPoints,
  loadBrowserTrack,
  saveBrowserMeta,
} from './trackStore.js';

/**
 * Recording from the browser's own Geolocation API, for the platforms the
 * Android recorder cannot reach and for the ride that is not worth installing it
 * for.
 *
 * It is deliberately shaped like the recorder it stands in for: it hands out the
 * same {@link RecorderPoint}s under the same monotonic `seq`, marks breaks with
 * the same `seg`, and answers with the same {@link RecorderStatus} — so
 * everything downstream (the merge, the segment split, the statistics, the
 * GeoJSON, the elevation chart, the hand-over to the track viewer) is the code
 * that already existed and knows nothing about where the fixes came from.
 *
 * What it cannot be is as good. The web API chooses no provider, honours no
 * sampling interval, reports no satellite count, and stops delivering the moment
 * the page is hidden or the screen locks. The last of those is the one that
 * matters: it makes a break in the ride, so it is recorded as one — see
 * {@link STARVED_FACTOR}.
 */

/**
 * The columns this backend can fill. A subset of the recorder's: `altMsl` and
 * `sat` are always null here, so they are not claimed at all.
 */
export const BROWSER_RECORDER_FIELDS: readonly string[] = [
  'seq',
  'ts',
  'lat',
  'lon',
  'alt',
  'acc',
  'spd',
  'brg',
  'seg',
];

/**
 * A silence longer than this many times the requested interval — or than
 * {@link STARVED_FLOOR_MS}, whichever is longer — is treated as an interruption
 * and starts a new segment.
 *
 * This is not the display-side `splitGapS`, which is a preference about drawing
 * a line across a long stop. It is a fact about the recording: the watch stopped
 * delivering, almost always because the page was hidden or the screen locked,
 * and a straight line across that gap would claim a route nobody took. The
 * Android recorder gets the same claim for free from its own restarts.
 */
const STARVED_FACTOR = 4;

const STARVED_FLOOR_MS = 30_000;

/**
 * How far a fix may arrive ahead of the requested interval and still be kept.
 *
 * The platform delivers at a rate of its own choosing, typically about once a
 * second: without the tolerance, a fix arriving 20 ms early against a 1 s
 * interval would be dropped and the next one taken instead, halving the rate the
 * user asked for.
 */
function intervalToleranceMs(intervalMs: number): number {
  return Math.min(intervalMs / 4, 250);
}

/** Fixes not yet written to disk. */
let unflushed: RecorderPoint[] = [];

let flushTimer: ReturnType<typeof setTimeout> | undefined;

const FLUSH_DELAY_MS = 3000;

let meta: BrowserRecorderMeta | null = null;

let points: RecorderPoint[] = [];

let hydration: Promise<void> | null = null;

let unsubscribe: (() => void) | null = null;

let onPoints: ((points: RecorderPoint[]) => void) | null = null;

/**
 * The newest fix that was actually kept — what the interval, distance and
 * starvation tests are made against. Not simply `points.at(-1)`, which is the
 * same thing until a track is cleared under a running recording.
 */
let lastKept: RecorderPoint | null = null;

/**
 * Reads the track off disk once per page.
 *
 * A recording found running is resumed rather than reported as stopped: the tab
 * may have been reloaded mid-ride, and the ride is what the user cares about.
 * The watch needs no gesture once the permission has been granted, which it must
 * have been for there to be a recording to resume.
 */
function ensureHydrated(fallbackConfig: RecorderConfig): Promise<void> {
  hydration ??= loadBrowserTrack(fallbackConfig).then((loaded) => {
    meta = loaded.meta;

    points = loaded.points;

    lastKept = points.at(-1) ?? null;

    if (meta.recording) {
      watch();
    }
  });

  return hydration;
}

/**
 * A plain `Error`, not a {@link RecorderError}: every failure that has a cause
 * of its own names one, and reaching this would mean a caller skipped the
 * hydration every entry point awaits — which is a bug here rather than anything
 * the user could act on. `reportFailure` files it as `unknown`, which is what it
 * is.
 */
function currentMeta(): BrowserRecorderMeta {
  if (!meta) {
    throw new Error('the browser recorder is not loaded');
  }

  return meta;
}

/**
 * Whether the browser's location permission has been refused outright. `prompt`
 * is not a refusal — the watch is what raises the prompt — and a browser that
 * cannot answer the question at all is treated as not having refused.
 */
async function isLocationDenied(): Promise<boolean> {
  try {
    const status = await navigator.permissions.query({ name: 'geolocation' });

    return status.state === 'denied';
  } catch {
    return false;
  }
}

function finite(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * The fix's own time when it is plausibly a wall clock, otherwise now. A host
 * reporting a monotonic clock instead of the epoch the spec asks for would
 * otherwise stamp the whole ride in 1970.
 */
function fixTime(timestamp: number): number {
  return Number.isFinite(timestamp) &&
    Math.abs(Date.now() - timestamp) < 86_400_000
    ? timestamp
    : Date.now();
}

function acceptFix(position: GeolocationPosition): void {
  const state = currentMeta();

  const { coords } = position;

  const ts = fixTime(position.timestamp);

  const acc = finite(coords.accuracy);

  // Applied here rather than downstream, because it decides what is *recorded*:
  // a fix dropped for accuracy never existed as far as the ride is concerned.
  // (With the Android recorder this same filter runs on its side, which is why
  // `selectRecorderSegments` runs none of its own.)
  if (
    state.config.maxAccuracyM !== null &&
    acc !== null &&
    acc > state.config.maxAccuracyM
  ) {
    return;
  }

  if (lastKept) {
    const sinceLast = ts - lastKept.ts;

    // Out of order, or a duplicate of one already kept: the platform may repeat
    // the cached fix, and a non-monotonic timestamp would make every test below
    // meaningless.
    if (sinceLast <= 0) {
      return;
    }

    const starved =
      sinceLast >
      Math.max(state.config.intervalMs * STARVED_FACTOR, STARVED_FLOOR_MS);

    if (starved) {
      // The gap is real and belongs to the ride, so the break is recorded rather
      // than left for the display-side split to guess at.
      state.seg += 1;
    } else {
      if (
        sinceLast <
        state.config.intervalMs - intervalToleranceMs(state.config.intervalMs)
      ) {
        return;
      }

      if (
        state.config.minDistanceM > 0 &&
        distance(
          [lastKept.lon, lastKept.lat],
          [coords.longitude, coords.latitude],
          { units: 'meters' },
        ) < state.config.minDistanceM
      ) {
        return;
      }
    }
  }

  const point: RecorderPoint = {
    seq: state.nextSeq,
    ts,
    lat: coords.latitude,
    lon: coords.longitude,
    // The web API's altitude is metres above the WGS84 ellipsoid — the same
    // datum as the recorder's `alt`, and not what GPX `<ele>` means. There is no
    // mean-sea-level figure to be had here, so none is claimed.
    alt: finite(coords.altitude),
    altMsl: null,
    acc,
    // NaN slips through some implementations where the spec asks for null.
    spd: finite(coords.speed),
    brg: finite(coords.heading),
    // No satellite count in the web API, at all.
    sat: null,
    seg: state.seg,
  };

  state.nextSeq += 1;

  points.push(point);

  lastKept = point;

  unflushed.push(point);

  scheduleFlush();

  onPoints?.([point]);
}

function scheduleFlush(): void {
  flushTimer ??= setTimeout(() => {
    flushTimer = undefined;

    void flush();
  }, FLUSH_DELAY_MS);
}

/**
 * Writes what has arrived since the last write. Failures are swallowed on
 * purpose: the ride is in memory and on the screen either way, and a storage
 * error is not a reason to interrupt a recording in progress.
 */
async function flush(): Promise<void> {
  if (flushTimer !== undefined) {
    clearTimeout(flushTimer);

    flushTimer = undefined;
  }

  const batch = unflushed;

  unflushed = [];

  if (!meta) {
    return;
  }

  try {
    await appendBrowserPoints(batch, meta);
  } catch (err) {
    console.warn('Could not store recorded fixes:', err);
  }
}

/**
 * A page on its way out (hidden, frozen, or being unloaded) takes its unwritten
 * fixes with it, so the pending write is brought forward rather than left to its
 * timer — which the browser may never run again.
 */
function onPageHidden(): void {
  if (document.visibilityState === 'hidden') {
    void flush();
  }
}

function watch(): void {
  unsubscribe ??= (() => {
    document.addEventListener('visibilitychange', onPageHidden);

    window.addEventListener('pagehide', onPageHidden);

    const stop = subscribeGeolocation(acceptFix);

    return () => {
      document.removeEventListener('visibilitychange', onPageHidden);

      window.removeEventListener('pagehide', onPageHidden);

      stop();
    };
  })();
}

function unwatch(): void {
  unsubscribe?.();

  unsubscribe = null;
}

/**
 * The status, in the shape the Android recorder answers `GET /status` with, so
 * the whole feature reads it the same way whichever backend produced it.
 *
 * The Android-only fields carry their nothing-outstanding values, because that
 * is what they truthfully say here: there is no runtime permission to grant
 * beyond the one below, no battery optimisation to be exempt from and no vendor
 * autostart policy, so `useRecorderNotices` has no setup checklist to raise. The
 * browser's own hazard — a screen that locks — is not a setup step and is said
 * where the user can act on it instead.
 */
export async function browserRecorderStatus(
  config: RecorderConfig,
): Promise<RecorderStatus> {
  await ensureHydrated(config);

  const state = currentMeta();

  const canRecord = isGeolocationSupported() && !(await isLocationDenied());

  return {
    recording: state.recording,
    config: state.config,
    fields: [...BROWSER_RECORDER_FIELDS],
    count: points.length,
    lastSeq: points.at(-1)?.seq ?? 0,
    generation: state.generation,
    version: { code: MIN_RECORDER_VERSION_CODE, name: 'browser' },
    permissions: { fine: canRecord, background: true, notifications: true },
    batteryExempt: true,
    oem: { vendor: null, needed: false, acknowledged: true },
    canRecord,
    setupComplete: true,
    port: 0,
    portEcho: null,
  };
}

/** Every fix above the cursor — `since` is exclusive, as the recorder's is. */
export async function browserRecorderTrackSince(
  since: number,
  config: RecorderConfig,
): Promise<{ points: RecorderPoint[]; fields: readonly string[] }> {
  await ensureHydrated(config);

  return {
    points: points.filter((point) => point.seq > since),
    fields: BROWSER_RECORDER_FIELDS,
  };
}

export async function startBrowserRecording(
  config: RecorderConfig,
): Promise<void> {
  await ensureHydrated(config);

  if (!isGeolocationSupported()) {
    throw new RecorderError(
      'location-unavailable',
      'this browser has no Geolocation API',
    );
  }

  if (await isLocationDenied()) {
    throw new RecorderError(
      'location-denied',
      'the location permission was refused for this site',
    );
  }

  const state = currentMeta();

  state.config = config;

  // Every start opens a segment, exactly as the recorder's own does — a ride
  // resumed after a pause is one track with a break in it, not a straight line
  // across wherever the user went meanwhile.
  state.seg += 1;

  state.recording = true;

  // The next fix is a fresh start, not a continuation, so it must not be
  // measured against one from before the pause.
  lastKept = null;

  await saveBrowserMeta(state);

  watch();
}

export async function stopBrowserRecording(): Promise<void> {
  unwatch();

  if (meta) {
    meta.recording = false;
  }

  await flush();
}

/**
 * Discards the whole track. Refused while recording, matching the recorder's own
 * `409 "recording"` — the difference being that here the refusal is the point
 * rather than a consequence of a thread appending underneath.
 *
 * `seq` does not restart: a cursor held anywhere must never be served different
 * points under ids it already has, so `generation` is what marks the break.
 */
export async function clearBrowserRecording(): Promise<void> {
  const state = currentMeta();

  if (state.recording) {
    throw new RecorderError('recording', 'stop the recording first');
  }

  unflushed = [];

  points = [];

  lastKept = null;

  state.generation += 1;

  await clearBrowserPoints();

  await saveBrowserMeta(state);
}

/**
 * Where fixes go as they arrive. The browser backend has no socket to attach, so
 * this is its whole stream: one listener, set when the feature starts following
 * the recording and cleared when it stops.
 */
export function setBrowserPointListener(
  listener: ((points: RecorderPoint[]) => void) | null,
): void {
  onPoints = listener;
}

export function isBrowserRecording(): boolean {
  return meta?.recording === true;
}

/** Test seam: drops the loaded track so the next call reads from disk again. */
export function resetBrowserRecorder(): void {
  unwatch();

  hydration = null;

  meta = null;

  points = [];

  unflushed = [];

  lastKept = null;

  onPoints = null;
}
