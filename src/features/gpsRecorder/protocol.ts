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
 * The recorder is a self-hosted APK that has never been released to anyone but
 * its own developers, so there is exactly one version to speak to and nothing to
 * be compatible with. Everything below assumes this one: no optional fields
 * standing in for an older build, no feature detection, no fallbacks. Raise this
 * with the recorder, and delete whatever the new contract makes unnecessary
 * rather than keeping a branch for the version before it.
 */
export const MIN_RECORDER_VERSION_CODE = 11;

/**
 * Where a device without the recorder installed ends up. A direct APK link, so
 * following it starts the download straight away — Chrome then asks the user to
 * confirm, and Android needs "install unknown apps" for this browser.
 */
export const RECORDER_DOWNLOAD_URL =
  'https://download.freemap.sk/freemap-gps-recorder/freemap-gps-recorder.apk';

function intentUrl(authority: string): string {
  return (
    `intent://${authority}?port=${new URL(RECORDER_ORIGIN).port}` +
    '#Intent;scheme=freemap-gps-recorder;' +
    `S.browser_fallback_url=${encodeURIComponent(RECORDER_DOWNLOAD_URL)};end`
  );
}

/**
 * Launches the recorder app **and starts recording**: the `start` authority is
 * what makes it begin, and hand focus straight back.
 *
 * `port` is echoed back as `portEcho` in `/status`, so the page can confirm both
 * ends agree on the port. Without the app installed, Android follows
 * `browser_fallback_url` to the download page — which is why this doubles as the
 * install prompt.
 */
export const RECORDER_INTENT_URL = intentUrl('start');

/**
 * Launches the recorder app and nothing more — any authority other than `start`
 * merely opens it. Its process is what serves the HTTP API, so this is how a page
 * revives a recorder that was killed or swiped away, without also deciding on the
 * user's behalf that a recording should begin.
 */
export const RECORDER_OPEN_INTENT_URL = intentUrl('open');

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
  /**
   * Metres above mean sea level — what GPX `<ele>` is defined as, so this is the
   * elevation to prefer wherever a track leaves this app.
   *
   * Null below Android 14, and until a GNSS fix has been seen, which is why
   * {@link RecorderPoint.alt} has to stay the fallback. The two differ by the
   * geoid separation: around 42 m over Slovakia, with the ellipsoid above.
   */
  altMsl: number | null;
  /** Horizontal accuracy in metres at 68% confidence, or null. */
  acc: number | null;
  /** Ground speed in m/s, or null. A standstill is 0, absent is null. */
  spd: number | null;
  /** Degrees clockwise from true north, or null. */
  brg: number | null;
  /**
   * Segment ordinal, incremented by the recorder on every start: a point whose
   * `seg` differs from its predecessor's begins a new segment. The recorder is
   * the only thing that decides where a track breaks, which is why this app
   * keeps no break list of its own.
   */
  seg: number;
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
    const seg = read(row, 'seg');

    if (
      seq === null ||
      ts === null ||
      lat === null ||
      lon === null ||
      seg === null
    ) {
      continue;
    }

    points.push({
      seq,
      ts,
      lat,
      lon,
      seg,
      alt: read(row, 'alt'),
      altMsl: read(row, 'altMsl'),
      acc: read(row, 'acc'),
      spd: read(row, 'spd'),
      brg: read(row, 'brg'),
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
  /**
   * Accuracy/battery trade-off, mapped to Android's `Priority` constants. A
   * fused concept: the recorder ignores it under `source: 'gps'`, while still
   * storing it for the switch back.
   */
  priority: z.enum(['high', 'balanced', 'low']),
  /**
   * Which provider the fixes come from. `fused` blends GNSS with wifi, cell and
   * the phone's sensors and places the user better in a street; `gps` is the
   * platform's receiver with nothing in front of it.
   *
   * It is the altitude that makes this worth choosing: the fused altitude is
   * modelled and refreshed every few seconds, repeated verbatim in between —
   * around four points in five carry a copy of the one before at a 1 s
   * interval, which draws a profile as flat treads and sharp risers and
   * inflates any climb computed from it. `gps` recomputes it every epoch, at
   * the cost of metres of noise, and carries its own `altMsl` instead of one
   * rebuilt from a geoid separation.
   */
  source: z.enum(['fused', 'gps']),
});

export type RecorderConfig = z.infer<typeof RecorderConfigSchema>;

export const RecorderStatusSchema = z.looseObject({
  recording: z.boolean(),
  /**
   * The sampling config in force, after the recorder clamped what was asked for
   * to what the platform allows.
   */
  config: RecorderConfigSchema,
  /**
   * The point column names, in order — the same list `/track` returns with every
   * page. Here as well because a stream attached without reading a page still
   * needs it to decode the bare rows that follow.
   */
  fields: z.array(z.string()),
  /** Points held on disk. */
  count: z.number().int(),
  /** Highest `seq` on file; 0 while the track is empty. */
  lastSeq: z.number().int(),
  /**
   * How many times the track has been thrown away. The only reliable signal
   * that points held here are gone: `seq` never restarts, so a cleared track is
   * otherwise indistinguishable from one that simply hasn't grown.
   */
  generation: z.number().int(),
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
  oem: z.looseObject({
    vendor: z.string().nullable(),
    needed: z.boolean(),
    acknowledged: z.boolean(),
  }),
  /** Whether the recorder can record right now. The gate that blocks a start. */
  canRecord: z.boolean(),
  /** False while a recommended (but non-blocking) setup step is outstanding. */
  setupComplete: z.boolean(),
  port: z.number().int(),
  /**
   * The port the launch link asked for, so both ends can be shown to agree; null
   * until the recorder has been launched by one.
   */
  portEcho: z.number().int().nullable(),
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
  /**
   * Android refused the recorder's foreground-service start because the recorder
   * was in the background — which it is whenever the page is what the user is
   * looking at. Recoverable by launching it, so its own activity makes the call.
   */
  | 'needs-foreground'
  /** Reachable, but older than `MIN_RECORDER_VERSION_CODE`. */
  | 'outdated'
  /**
   * The browser would not promise to keep its storage, so the recording was left
   * on the recorder rather than trusted to a copy it may evict.
   */
  | 'not-persisted'
  /**
   * The page does not hold the whole recording — fixes are still on the recorder
   * that never reached here — so nothing was taken and nothing was deleted.
   */
  | 'incomplete'
  /**
   * The browser could not store the track in a form it would read back, so the
   * recording was left on the recorder.
   */
  | 'not-stored'
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
