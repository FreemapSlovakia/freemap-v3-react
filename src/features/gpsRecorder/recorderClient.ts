import {
  MIN_RECORDER_VERSION_CODE,
  RECORDER_ORIGIN,
  RecorderError,
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
    throw new RecorderError(
      'http',
      `${init?.method ?? 'GET'} ${path} → HTTP ${response.status}`,
    );
  }

  return response;
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
  if (status.versionCode < MIN_RECORDER_VERSION_CODE) {
    throw new RecorderError(
      'outdated',
      `recorder versionCode ${status.versionCode} < ${MIN_RECORDER_VERSION_CODE}`,
    );
  }
}

export async function startRecording(signal?: AbortSignal): Promise<void> {
  await recorderFetch('/start', { method: 'POST', signal });
}

export async function stopRecording(signal?: AbortSignal): Promise<void> {
  await recorderFetch('/stop', { method: 'POST', signal });
}

/** Every point the recorder holds with a `seq` above the cursor. */
export async function getTrackSince(
  since: number,
  signal?: AbortSignal,
): Promise<RecorderPoint[]> {
  const result = RecorderTrackPageSchema.safeParse(
    await recorderJson(`/track?since=${since}`, { signal }),
  );

  if (!result.success) {
    throw new RecorderError('protocol', `/track: ${result.error.message}`);
  }

  return result.data.points;
}
