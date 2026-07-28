import z from 'zod';

/**
 * Loopback origin of the recorder's HTTP API.
 *
 * The IP literal is mandatory — `localhost` resolves through the name lookup
 * and Chrome then classifies the request differently for the Local Network
 * Access check, so the loopback opt-in below would not apply.
 *
 * The port must match the one the recorder APK binds.
 */
export const RECORDER_ORIGIN = 'http://127.0.0.1:8390';

/** Recorder builds older than this lack endpoints this build depends on. */
export const MIN_RECORDER_VERSION_CODE = 1;

/** Where a device without the recorder installed ends up. */
export const RECORDER_DOWNLOAD_URL = 'https://www.freemap.sk/recorder';

/**
 * Launches the recorder app. An installed app handles the custom scheme and
 * takes focus; without it Android follows `browser_fallback_url` to the
 * download page.
 */
export const RECORDER_INTENT_URL =
  'intent://open/#Intent;scheme=freemap-recorder;' +
  `S.browser_fallback_url=${encodeURIComponent(RECORDER_DOWNLOAD_URL)};end`;

/**
 * One recorded fix. `seq` is the recorder-assigned, monotonically increasing id
 * that doubles as the `/track?since=` cursor and the SSE event id.
 */
export const RecorderPointSchema = z.looseObject({
  seq: z.number().int(),
  lat: z.number(),
  lon: z.number(),
  /** Fix time, epoch milliseconds. */
  ts: z.number(),
  /** Metres above the ellipsoid, when the fix carries altitude. */
  ele: z.number().nullish(),
  /** Horizontal accuracy in metres. */
  accuracy: z.number().nullish(),
  /** Ground speed in m/s. */
  speed: z.number().nullish(),
  /** Course over ground in degrees. */
  bearing: z.number().nullish(),
});

export type RecorderPoint = z.infer<typeof RecorderPointSchema>;

export const RecorderStatusSchema = z.looseObject({
  versionCode: z.number().int(),
  recording: z.boolean(),
  pointCount: z.number().int(),
  /** Android runtime permissions the recorder still needs to record. */
  missingPermissions: z.array(z.string()).default([]),
  /** False while the recorder is subject to battery optimization. */
  batteryExempt: z.boolean().nullish(),
  /** Start of the current recording session, epoch milliseconds. */
  startedAt: z.number().nullish(),
});

export type RecorderStatus = z.infer<typeof RecorderStatusSchema>;

export const RecorderTrackPageSchema = z.looseObject({
  points: z.array(RecorderPointSchema),
});

/** A single point or a batch, as `/stream` may send either. */
export const RecorderStreamPayloadSchema = z.union([
  RecorderPointSchema,
  z.array(RecorderPointSchema),
]);

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
  /** Reachable, but reporting permissions it still needs. */
  | 'setup-needed'
  /** Reachable, but older than `MIN_RECORDER_VERSION_CODE`. */
  | 'outdated'
  /** Reachable, but answered with an error status. */
  | 'http'
  /** Reachable, but the body did not match the expected shape. */
  | 'protocol';

export class RecorderError extends Error {
  readonly failure: RecorderFailure;

  constructor(failure: RecorderFailure, message: string) {
    super(message);

    this.name = 'RecorderError';

    this.failure = failure;
  }
}
