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

async function recorderFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  let response: Response;

  try {
    response = await fetch(`${RECORDER_ORIGIN}${path}`, {
      ...init,
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
    return reason === 'recording' ? 'recording' : 'setup-needed';
  }

  // A recorder that predates an endpoint answers 404 ("no such endpoint") or
  // 405; either way the caller can fall back to what older builds do offer.
  if (status === 404 || status === 405) {
    return 'unsupported';
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

async function recorderJson(
  path: string,
  init?: RequestInit,
): Promise<unknown> {
  const response = await recorderFetch(path, init);

  try {
    return await response.json();
  } catch (err) {
    throw new RecorderError('protocol', `${path}: invalid JSON: ${err}`);
  }
}

export async function getStatus(signal?: AbortSignal): Promise<RecorderStatus> {
  const result = RecorderStatusSchema.safeParse(
    await recorderJson('/status', { signal }),
  );

  if (!result.success) {
    throw new RecorderError('protocol', `/status: ${result.error.message}`);
  }

  return result.data;
}

/**
 * Polls `/status` with a widening backoff, for use right after the launch
 * intent: the recorder needs a moment to bind its socket, and while the browser
 * is backgrounded these timers are throttled, so the steps are generous.
 */
export async function waitForStatus(
  signal?: AbortSignal,
): Promise<RecorderStatus> {
  const delays = [500, 1000, 1500, 2500, 4000, 6000];

  let last: unknown;

  for (let i = 0; ; i++) {
    try {
      return await getStatus(signal);
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

    const delay = delays[i];

    if (delay === undefined) {
      throw last;
    }

    await new Promise<void>((resolve) => setTimeout(resolve, delay));
  }
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
 * Begins recording, asking for the given sampling config. A recorder that
 * doesn't read the body ignores it and reports no `config` in `/status`, which
 * is how the UI knows the settings didn't take.
 */
export async function startRecording(
  config?: RecorderConfig,
  signal?: AbortSignal,
): Promise<void> {
  await recorderFetch('/start', {
    method: 'POST',
    signal,
    ...(config && {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    }),
  });
}

export async function stopRecording(signal?: AbortSignal): Promise<void> {
  await recorderFetch('/stop', { method: 'POST', signal });
}

/**
 * Suspends the session without ending it, keeping the GPS engine warm so the
 * first fixes after a resume are usable.
 *
 * Falls back to `POST /stop` on a recorder without the endpoint: from this
 * app's side the difference is only that a resume then costs a re-acquisition,
 * since the segment break is tracked here either way.
 */
export async function pauseRecording(signal?: AbortSignal): Promise<void> {
  try {
    await recorderFetch('/pause', { method: 'POST', signal });
  } catch (err) {
    if (!(err instanceof RecorderError) || err.failure !== 'unsupported') {
      throw err;
    }

    await stopRecording(signal);
  }
}

/** Resumes a paused session; see {@link pauseRecording} for the fallback. */
export async function resumeRecording(
  config?: RecorderConfig,
  signal?: AbortSignal,
): Promise<void> {
  try {
    await recorderFetch('/resume', { method: 'POST', signal });
  } catch (err) {
    if (!(err instanceof RecorderError) || err.failure !== 'unsupported') {
      throw err;
    }

    await startRecording(config, signal);
  }
}

/**
 * Discards the recorder's whole track. The one call that destroys data the
 * recorder owns, so it is only ever made on an explicit, confirmed request.
 *
 * Refused with `409 "recording"` while a recording is in progress — stop first.
 * `seq` does not restart afterwards; `generation` is what marks the break.
 */
export async function clearTrack(signal?: AbortSignal): Promise<void> {
  await recorderFetch('/track', { method: 'DELETE', signal });
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
  const result = RecorderTrackPageSchema.safeParse(
    await recorderJson(`/track?since=${since}`, { signal }),
  );

  if (!result.success) {
    throw new RecorderError('protocol', `/track: ${result.error.message}`);
  }

  const { fields, points } = result.data;

  return { points: decodePoints(fields, points), fields };
}
