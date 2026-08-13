import { z } from 'zod';
import { startRecorderSpan } from './perfProbe.js';
import {
  decodePoints,
  MIN_RECORDER_VERSION_CODE,
  RECORDER_ORIGIN,
  type RecorderConfig,
  RecorderError,
  type RecorderFailure,
  type RecorderPoint,
  type RecorderStatus,
  RecorderStatusSchema,
  RecorderTrackPageSchema,
} from './protocol.js';

/**
 * Chrome answers a blocked Local Network Access request with the same opaque
 * `TypeError` it uses for an unreachable host, so the permission state is the
 * only way to tell a refusal from a missing recorder.
 */
async function isLocalNetworkAccessDenied(): Promise<boolean> {
  try {
    const status = await navigator.permissions.query({
      name: 'local-network-access' as PermissionName,
    });

    return status.state === 'denied';
  } catch {
    // The browser doesn't know the permission, so it cannot be the cause.
    return false;
  }
}

/**
 * Deadlines for the loopback API. Nothing here crosses a network, so a request
 * still unanswered after seconds is not slow but gone — a recorder Android
 * killed, or a socket the browser froze with the page and never picked up
 * again. Without a deadline such a fetch stays pending for as long as the page
 * does, every later sync coalesces onto it, and the live view reads as
 * `connecting` until the page is reloaded.
 */
const STATUS_TIMEOUT_MS = 3000;

/** Transport commands, where the recorder starts or stops a service first. */
const COMMAND_TIMEOUT_MS = 8000;

/** A whole track is megabytes of body, so this is a transfer budget. */
const TRACK_TIMEOUT_MS = 20_000;

/** The caller's cancellation and the deadline, whichever comes first. */
function deadline(timeoutMs: number, signal?: AbortSignal): AbortSignal {
  const timeout = AbortSignal.timeout(timeoutMs);

  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

async function recorderFetch(
  path: string,
  timeoutMs: number,
  init?: RequestInit,
): Promise<Response> {
  let response: Response;

  try {
    response = await fetch(`${RECORDER_ORIGIN}${path}`, {
      ...init,
      signal: deadline(timeoutMs, init?.signal ?? undefined),
      // Declares the target up front so Chrome's Local Network Access check
      // resolves to the loopback space and prompts, instead of blocking.
      targetAddressSpace: 'loopback',
      mode: 'cors',
      cache: 'no-store',
    });
  } catch (err) {
    // Cancellation must stay an AbortError: the processor middleware treats it
    // as a silent cancel rather than a failure.
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }

    // An expired deadline is silence, and only silence: a Local Network Access
    // block is refused at once, so it can never be what ran out the clock.
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw new RecorderError(
        'unreachable',
        `${init?.method ?? 'GET'} ${path}: no answer in ${timeoutMs} ms`,
      );
    }

    throw new RecorderError(
      (await isLocalNetworkAccessDenied()) ? 'lna-denied' : 'unreachable',
      String(err),
    );
  }

  if (!response.ok) {
    // 403 and 409 carry the whole status object plus an `error` naming the
    // cause, so the body says more than the code: 403 is the recorder's own
    // `canRecord` gate, while 409 is either a delete refused mid-recording or
    // Android refusing a backgrounded foreground-service start (which the
    // battery-optimisation exemption fixes).
    const reason = await readErrorReason(response);

    throw new RecorderError(
      classifyHttpFailure(response.status, reason),
      `${init?.method ?? 'GET'} ${path} → HTTP ${response.status}${
        reason ? `: ${reason}` : ''
      }`,
    );
  }

  return response;
}

function classifyHttpFailure(
  status: number,
  reason: string | null,
): RecorderFailure {
  if (status === 403) {
    return 'setup-needed';
  }

  if (status === 409) {
    if (reason === 'recording') {
      return 'recording';
    }

    // The recorder answers a refused start with the exception's class name, so
    // the platform's own refusal is distinguishable from a recorder that simply
    // isn't set up — and it is the one the caller can do something about.
    return reason?.includes('ForegroundService')
      ? 'needs-foreground'
      : 'setup-needed';
  }

  return 'http';
}

async function readErrorReason(response: Response): Promise<string | null> {
  try {
    const body: unknown = await response.json();

    const reason =
      typeof body === 'object' && body !== null
        ? (body as { error?: unknown }).error
        : undefined;

    return typeof reason === 'string' ? reason : null;
  } catch {
    return null;
  }
}

/**
 * The first complaint, with a count of the rest. A schema error over a track page
 * carries one issue per point it disliked, and the first one names the column
 * that is actually the problem.
 */
function describeZodError(error: z.ZodError): string {
  const [issue] = error.issues;

  if (!issue) {
    return error.message;
  }

  const rest = error.issues.length - 1;

  return (
    `${issue.path.join('.') || '(root)'}: ${issue.message}` +
    (rest > 0 ? ` (+${rest} more)` : '')
  );
}

async function recorderJson(
  path: string,
  timeoutMs: number,
  init?: RequestInit,
): Promise<unknown> {
  const response = await recorderFetch(path, timeoutMs, init);

  try {
    return await response.json();
  } catch (err) {
    // The deadline can expire while the body is still arriving. That is the
    // same silence the fetch itself would have reported, not a malformed answer.
    if (err instanceof DOMException) {
      throw err.name === 'AbortError'
        ? err
        : new RecorderError('unreachable', `${path}: ${err.name}`);
    }

    // A recorder Android killed mid-body drops the connection, which the body
    // read reports as a `TypeError` — silence again, and told apart from the
    // `SyntaxError` of an answer that arrived whole and made no sense.
    if (err instanceof TypeError) {
      throw new RecorderError('unreachable', `${path}: ${err.message}`);
    }

    throw new RecorderError('protocol', `${path}: invalid JSON: ${err}`);
  }
}

/**
 * Just enough of the status to name the version. The full schema describes one
 * recorder and rejects anything else, so this is what tells an out-of-date APK
 * apart from an answer that makes no sense — the difference between offering the
 * user the download and telling them something is broken.
 */
const RecorderVersionProbeSchema = z.looseObject({
  version: z.looseObject({ code: z.number().int(), name: z.string() }),
});

export async function getStatus(signal?: AbortSignal): Promise<RecorderStatus> {
  const body = await recorderJson('/status', STATUS_TIMEOUT_MS, { signal });

  const result = RecorderStatusSchema.safeParse(body);

  if (!result.success) {
    const probe = RecorderVersionProbeSchema.safeParse(body);

    if (probe.success && probe.data.version.code < MIN_RECORDER_VERSION_CODE) {
      throw new RecorderError(
        'outdated',
        `recorder version ${probe.data.version.name} (code ${probe.data.version.code}) < ${MIN_RECORDER_VERSION_CODE}`,
      );
    }

    throw new RecorderError(
      'protocol',
      `/status: ${describeZodError(result.error)}`,
    );
  }

  return result.data;
}

/**
 * Widening backoff for waiting on the recorder after the launch intent: it needs
 * a moment to bind its socket or to bring its activity up, and while the browser
 * is backgrounded these timers are throttled, so the steps are generous.
 */
const WAIT_DELAYS_MS = [500, 1000, 1500, 2500, 4000, 6000];

async function pollStatus(
  signal: AbortSignal | undefined,
  until: (status: RecorderStatus) => boolean,
  unmet: () => RecorderError,
): Promise<RecorderStatus> {
  let last: unknown;

  for (let i = 0; ; i++) {
    try {
      const status = await getStatus(signal);

      if (until(status)) {
        return status;
      }

      last = unmet();
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw err;
      }

      // A refusal will not turn into a grant by waiting.
      if (err instanceof RecorderError && err.failure === 'lna-denied') {
        throw err;
      }

      last = err;
    }

    const delay = WAIT_DELAYS_MS[i];

    if (delay === undefined) {
      throw last;
    }

    await new Promise<void>((resolve) => setTimeout(resolve, delay));
  }
}

/** Waits for the recorder to answer at all. */
export function waitForStatus(signal?: AbortSignal): Promise<RecorderStatus> {
  return pollStatus(
    signal,
    () => true,
    () => new RecorderError('unreachable', 'the recorder did not answer'),
  );
}

/**
 * Waits for a recording to be running, for use after the launch intent has been
 * handed the job: the recorder answers throughout, so reachability says nothing
 * about whether it took. A setup step standing in the way is resolved on its own
 * screen first, which is why this waits as long as it does.
 */
export function waitForRecording(
  signal?: AbortSignal,
): Promise<RecorderStatus> {
  return pollStatus(
    signal,
    (status) => status.recording,
    () =>
      new RecorderError(
        'needs-foreground',
        'the recorder was launched but is not recording',
      ),
  );
}

/** Throws when the running recorder is too old for the endpoints used here. */
export function assertSupportedVersion(status: RecorderStatus): void {
  if (status.version.code < MIN_RECORDER_VERSION_CODE) {
    throw new RecorderError(
      'outdated',
      `recorder version ${status.version.name} (code ${status.version.code}) < ${MIN_RECORDER_VERSION_CODE}`,
    );
  }
}

/**
 * Begins recording, asking for the given sampling config. The recorder saves it
 * before it tries to start, so even a start it then refuses leaves the config
 * that was asked for in place — which is what makes the launch-intent fallback
 * begin the recording that was wanted.
 */
export async function startRecording(
  config: RecorderConfig,
  signal?: AbortSignal,
): Promise<void> {
  await recorderFetch('/start', COMMAND_TIMEOUT_MS, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
}

export async function stopRecording(signal?: AbortSignal): Promise<void> {
  await recorderFetch('/stop', COMMAND_TIMEOUT_MS, { method: 'POST', signal });
}

/**
 * Discards the recorder's whole track. The one call that destroys data the
 * recorder owns, so it is only ever made on an explicit, confirmed request.
 *
 * Refused with `409 "recording"` while a recording is in progress — stop first.
 * `seq` does not restart afterwards; `generation` is what marks the break.
 */
export async function clearTrack(signal?: AbortSignal): Promise<void> {
  await recorderFetch('/track', COMMAND_TIMEOUT_MS, {
    method: 'DELETE',
    signal,
  });
}

/**
 * Every point the recorder holds with a `seq` above the cursor — `since` is
 * exclusive. The page's column order comes back with it, because the stream
 * sends bare rows and needs it to decode them.
 */
export async function getTrackSince(
  since: number,
  signal?: AbortSignal,
): Promise<{ points: RecorderPoint[]; fields: string[] }> {
  // Timed apart, because they fail differently: the transfer is a wait, while
  // the parse below is a pass over every cell of every row and blocks.
  const fetched = startRecorderSpan('track-fetch', 1000);

  const body = await recorderJson(`/track?since=${since}`, TRACK_TIMEOUT_MS, {
    signal,
  });

  fetched();

  const parsed = startRecorderSpan('track-parse');

  const result = RecorderTrackPageSchema.safeParse(body);

  if (!result.success) {
    throw new RecorderError(
      'protocol',
      `/track: ${describeZodError(result.error)}`,
    );
  }

  const { fields, points } = result.data;

  const decoded = decodePoints(fields, points);

  parsed(decoded.length);

  return { points: decoded, fields };
}
