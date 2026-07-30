import z from 'zod';

/**
 * Loopback origin of the recorder's HTTP API.
 *
 * The IP literal is mandatory — `localhost` resolves through the name lookup
 * and Chrome then classifies the request differently for the Local Network
 * Access check, so the loopback opt-in would not apply.
 *
 * The port must match the one the recorder APK binds; it also restates it as
 * `port` in `/status`.
 */
export const RECORDER_ORIGIN = 'http://127.0.0.1:8378';

/**
 * Below this there is no `generation`, so a cleared track cannot be detected,
 * and no `DELETE /track`. (Below 3, CORS also answered with a single hardcoded
 * origin the production page could never match.)
 */
export const MIN_RECORDER_VERSION_CODE = 4;

/**
 * Where a device without the recorder installed ends up. A direct APK link, so
 * following it starts the download straight away — Chrome then asks the user to
 * confirm, and Android needs "install unknown apps" for this browser.
 */
export const RECORDER_DOWNLOAD_URL =
  'https://download.freemap.sk/freemap-gps-recorder/freemap-gps-recorder.apk';

/**
 * Launches the recorder app. The `start` authority is what makes it begin
 * recording and hand focus straight back — any other authority merely opens
 * it. `port` is echoed back as `portEcho` in `/status`, so the page can confirm
 * both ends agree on the port. Without the app installed, Android follows
 * `browser_fallback_url` to the download page.
 */
export const RECORDER_INTENT_URL =
  `intent://start?port=${new URL(RECORDER_ORIGIN).port}` +
  '#Intent;scheme=freemap-gps-recorder;' +
  `S.browser_fallback_url=${encodeURIComponent(RECORDER_DOWNLOAD_URL)};end`;

/**
 * Points travel columnar: a row per fix, ordered by a `fields` header. `/status`
 * names the order and `/track` restates it with every page, so this last-resort
 * list only decodes a stream attached before either has been read.
 *
 * Naming more columns than an older recorder sends is safe — a name that maps
 * past the end of a row reads as absent — but naming them in the wrong order
 * would not be, which is why the recorder's list is append-only.
 */
export const DEFAULT_POINT_FIELDS = [
  'seq',
  'ts',
  'lat',
  'lon',
  'alt',
  'acc',
  'spd',
  'brg',
  'altMsl',
  'altAcc',
  'spdAcc',
  'brgAcc',
  'sat',
  'src',
  'seg',
] as const;

/** One recorded fix, decoded out of its row. */
export interface RecorderPoint {
  /** Recorder-assigned monotonic id; the `/track?since=` cursor and SSE event id. */
  seq: number;
  /** Fix time, epoch milliseconds. */
  ts: number;
  lat: number;
  lon: number;
  /** Metres above the WGS84 ellipsoid, or null when the fix carried none. */
  alt: number | null;
  /** Horizontal accuracy in metres at 68% confidence, or null. */
  acc: number | null;
  /** Ground speed in m/s, or null. A standstill is 0, absent is null. */
  spd: number | null;
  /** Degrees clockwise from true north, or null. */
  brg: number | null;
  /**
   * Segment ordinal, incremented by the recorder whenever recording starts or
   * resumes: a point whose `seg` differs from its predecessor's begins a new
   * segment. Null on a recorder that doesn't send the column, which is why
   * `splitPointsIntoSegments` also splits on a time gap and on the breaks this
   * app caused itself.
   */
  seg: number | null;
}

/**
 * A cell holds whatever its column holds — a number, a null, or `src`'s provider
 * name. The `fields` list is append-only and a reader is meant to ignore the
 * columns it doesn't know, so typing cells as numbers would break the whole page
 * on the day a non-numeric column is appended.
 */
const RecorderRowSchema = z.array(z.unknown());

export const RecorderTrackPageSchema = z.looseObject({
  fields: z.array(z.string()),
  points: z.array(RecorderRowSchema),
});

/**
 * A stream event carries one row, or a batch of them — told apart by
 * {@link streamPayloadToRows} rather than by the schema, since a row of unknown
 * cells and a batch of rows are the same shape to it.
 */
export const RecorderStreamPayloadSchema = RecorderRowSchema;

/**
 * Reads rows against their declared column order, so a reordered or extended
 * `fields` header costs nothing here. A cell that isn't the number its column
 * should hold reads as absent, and a row without a position is not a fix and is
 * dropped.
 */
export function decodePoints(
  fields: readonly string[],
  rows: readonly (readonly unknown[])[],
): RecorderPoint[] {
  const at = new Map(fields.map((name, i) => [name, i]));

  const read = (row: readonly unknown[], name: string): number | null => {
    const i = at.get(name);

    const cell = i === undefined ? null : row[i];

    return typeof cell === 'number' && Number.isFinite(cell) ? cell : null;
  };

  const points: RecorderPoint[] = [];

  for (const row of rows) {
    const seq = read(row, 'seq');
    const ts = read(row, 'ts');
    const lat = read(row, 'lat');
    const lon = read(row, 'lon');

    if (seq === null || ts === null || lat === null || lon === null) {
      continue;
    }

    points.push({
      seq,
      ts,
      lat,
      lon,
      alt: read(row, 'alt'),
      acc: read(row, 'acc'),
      spd: read(row, 'spd'),
      brg: read(row, 'brg'),
      seg: read(row, 'seg'),
    });
  }

  return points;
}

/** Normalizes a stream payload to rows, whether it carried one or a batch. */
export function streamPayloadToRows(
  payload: readonly unknown[],
): (readonly unknown[])[] {
  return payload.length > 0 && Array.isArray(payload[0])
    ? (payload as (readonly unknown[])[])
    : [payload];
}

/** How the recorder samples, sent as the `POST /start` body. */
export const RecorderConfigSchema = z.looseObject({
  /** Desired milliseconds between fixes. */
  intervalMs: z.number().int().positive(),
  /** Minimum displacement in metres before a fix is recorded; 0 records every one. */
  minDistanceM: z.number().nonnegative(),
  /** Fixes with a worse `acc` are discarded; null keeps every fix. */
  maxAccuracyM: z.number().positive().nullable(),
  /** Accuracy/battery trade-off, mapped to Android's `Priority` constants. */
  priority: z.enum(['high', 'balanced', 'low']),
});

export type RecorderConfig = z.infer<typeof RecorderConfigSchema>;

export const RecorderStatusSchema = z.looseObject({
  recording: z.boolean(),
  /**
   * Whether a live session is only suspended. Absent on a recorder without
   * `/pause`, where a pause is a `POST /stop` the app remembers locally.
   */
  paused: z.boolean().nullish(),
  /**
   * The sampling config in force, after the recorder clamped what was asked for
   * to what the platform allows. Its presence is how support for a configurable
   * `POST /start` is detected — a recorder that ignored the body reports none.
   */
  config: RecorderConfigSchema.nullish(),
  /**
   * The point column names, in order — the same list `/track` returns with every
   * page. Absent on a recorder that doesn't send it, where the order has to come
   * from a page instead.
   */
  fields: z.array(z.string()).nullish(),
  /** Points held on disk. */
  count: z.number().int(),
  /** Highest `seq` on file; 0 while the track is empty. */
  lastSeq: z.number().int().nullish(),
  /**
   * How many times the track has been thrown away. The only reliable signal
   * that points held here are gone: `seq` never restarts, so a cleared track is
   * otherwise indistinguishable from one that simply hasn't grown.
   *
   * Optional only so a recorder below `MIN_RECORDER_VERSION_CODE` — which is
   * defined as the versions that don't send it — still parses far enough to be
   * reported as outdated rather than as an unexpected answer.
   */
  generation: z.number().int().nullish(),
  version: z.looseObject({
    code: z.number().int(),
    name: z.string(),
  }),
  /** Android runtime permissions, by name. */
  permissions: z.looseObject({
    fine: z.boolean(),
    background: z.boolean(),
    notifications: z.boolean(),
  }),
  /** False while the recorder is subject to battery optimization. */
  batteryExempt: z.boolean(),
  /**
   * Vendor autostart/battery policy that Android's own settings don't cover.
   * `vendor` is null on a device with no such quirk, and `needed` is false with it.
   */
  oem: z
    .looseObject({
      vendor: z.string().nullable(),
      needed: z.boolean(),
      acknowledged: z.boolean(),
    })
    .nullish(),
  /** Whether the recorder can record right now. The gate that blocks a start. */
  canRecord: z.boolean(),
  /** False while a recommended (but non-blocking) setup step is outstanding. */
  setupComplete: z.boolean(),
  port: z.number().int().nullish(),
  /** The port the launch link asked for, so both ends can be shown to agree. */
  portEcho: z.number().int().nullish(),
  /** Present only on an error response, naming what went wrong. */
  error: z.string().nullish(),
});

export type RecorderStatus = z.infer<typeof RecorderStatusSchema>;

/** Permissions reported as not granted, for a setup message. */
export function missingPermissions(status: RecorderStatus): string[] {
  return Object.entries(status.permissions)
    .filter(([, granted]) => granted === false)
    .map(([name]) => name);
}

/**
 * Why talking to the recorder failed. The three the UI must tell apart are
 * `unreachable` (offer the install/download page), `lna-denied` (recording is
 * unaffected, only the live view is lost) and `setup-needed` (send the user
 * back into the app to grant what it asks for).
 */
export type RecorderFailure =
  /** Nothing answered — the recorder is probably not installed or not running. */
  | 'unreachable'
  /** Chrome's Local Network Access permission was refused for this origin. */
  | 'lna-denied'
  /** Reachable, but not in a state where it can record. */
  | 'setup-needed'
  /** Refused because a recording is in progress; stop it first. */
  | 'recording'
  /** The endpoint isn't in this recorder's build; the caller falls back. */
  | 'unsupported'
  /** Reachable, but older than `MIN_RECORDER_VERSION_CODE`. */
  | 'outdated'
  /** Reachable, but answered with an error status. */
  | 'http'
  /** Reachable, but the body did not match the expected shape. */
  | 'protocol';

/**
 * Detail text is shown verbatim and kept in the store, so it has to stay short
 * whatever produced it: a schema complaint about a track page names every point
 * it disliked, which on a long recording is megabytes of it.
 */
export function truncateDetail(text: string): string {
  return text.length <= 300 ? text : `${text.slice(0, 300)}…`;
}

export class RecorderError extends Error {
  readonly failure: RecorderFailure;

  constructor(failure: RecorderFailure, message: string) {
    super(truncateDetail(message));

    this.name = 'RecorderError';

    this.failure = failure;
  }
}
