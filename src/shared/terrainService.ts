import { HttpError, httpRequest, isNetworkError } from '@app/httpRequest.js';
import type { RootState } from '@app/store/store.js';
import type { CancelTriggers } from '@shared/cancelRegister.js';
import z from 'zod';

/**
 * Why a render didn't happen, in terms a panel can say something about.
 * `noData` is the service's 500, which in practice means the viewpoint has no
 * elevation data — the one failure a user can act on by clicking elsewhere.
 */
export type TerrainErrorCode =
  | 'offline'
  | 'unreachable'
  | 'busy'
  | 'tooMany'
  | 'noData'
  | 'failed';

export function terrainErrorCode(err: unknown): TerrainErrorCode {
  // A request that never reached the server looks the same whether the machine
  // is offline, DNS failed, the service is down, or CORS refused the response —
  // the browser gives one `TypeError` for all of them. Only a browser that says
  // it is offline may be told it is offline; anything else says the service
  // could not be reached, which is all we actually know.
  if (isNetworkError(err)) {
    return navigator.onLine ? 'unreachable' : 'offline';
  }

  if (err instanceof HttpError) {
    return err.status === 503
      ? 'busy'
      : err.status === 429
        ? 'tooMany'
        : err.status === 500
          ? 'noData'
          : 'failed';
  }

  return 'failed';
}

const ProgressSchema = z.object({
  phase: z.enum(['queued', 'rendering', 'encoding', 'done']),
  /** Renders that must finish before this one starts; `0` means next. */
  ahead: z.number().default(0),
  /** 0–100 through the render; a column or ray count, so the rate drifts. */
  percent: z.number().default(0),
});

/**
 * How far along a render is. The picture arrives all at once at the end, so
 * this comes over a side channel — see the service's `docs/API.md`.
 */
export type TerrainProgress = z.infer<typeof ProgressSchema>;

/**
 * Rejects the service's `unknown` phase along with anything malformed: the
 * token is only registered once its request lands, and until then there is
 * nothing to say.
 */
function parseProgress(data: string): TerrainProgress | null {
  try {
    const parsed = ProgressSchema.safeParse(JSON.parse(data));

    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/**
 * Watches one render, by the token its request carries. Subscribed before the
 * request goes out, which is what makes the queued phase visible.
 */
function watchProgress(
  token: string,
  onProgress: (progress: TerrainProgress) => void,
): () => void {
  const events = new EventSource(
    `${process.env['TERRAIN_URL']}/progress/${token}`,
  );

  // Set on open, not on the first usable event: the service reports `unknown`
  // until the request lands, and those parse to nothing.
  let opened = false;

  events.onopen = () => {
    opened = true;
  };

  events.onmessage = ({ data }) => {
    const progress = parseProgress(data);

    if (!progress) {
      return;
    }

    onProgress(progress);

    // `done` is the last event and the browser reopens a stream that ends.
    if (progress.phase === 'done') {
      events.close();
    }
  };

  // Never connected, so the side channel isn't there — let it go rather than
  // have the browser retry it for the length of the render.
  events.onerror = () => {
    if (!opened) {
      events.close();
    }
  };

  return () => events.close();
}

/**
 * Posts one render to the terrain service and hands back its multipart body.
 *
 * Seconds of work on the server, serialised there, so the caller owns the
 * progress and the cancellation — pass the triggers that make this render
 * pointless. Hanging up stops the work within about a second, so a reframed
 * view must abort the render in flight rather than queue behind it.
 */
export async function requestTerrainRender(
  path: string,
  request: unknown,
  getState: () => RootState,
  cancel: CancelTriggers,
  onProgress?: (progress: TerrainProgress) => void,
): Promise<FormData> {
  const { user } = getState().auth;

  // Ours to invent; the service only keys `/progress/{token}` on it.
  const token = crypto.randomUUID();

  const unwatch = onProgress ? watchProgress(token, onProgress) : undefined;

  try {
    const response = await httpRequest({
      ...cancel,
      getState,
      method: 'POST',
      // Absolute, so `httpRequest` adds no credentials of its own; the terrain
      // service clamps quality per account and needs the token to do it.
      url: `${process.env['TERRAIN_URL']}${path}`,
      data: request,
      headers: {
        'X-Job': token,
        ...(user ? { Authorization: `Bearer ${user.authToken}` } : {}),
      },
    });

    return await response.formData();
  } finally {
    unwatch?.();
  }
}

/**
 * The two parts every render answers with: its JSON `meta`, parsed by the
 * endpoint's own schema, and the picture as an object URL. A `depth` part, where
 * one was asked for, is the caller's to take out of the same form.
 */
export function terrainParts<T>(
  form: FormData,
  schema: { parse: (data: unknown) => T },
): { meta: T; imageUrl: string } {
  const metaPart = form.get('meta');

  if (typeof metaPart !== 'string') {
    throw new Error('missing terrain meta');
  }

  const imagePart = form.get('image');

  if (!(imagePart instanceof Blob)) {
    throw new Error('missing terrain image');
  }

  return {
    meta: schema.parse(JSON.parse(metaPart)),
    imageUrl: URL.createObjectURL(imagePart),
  };
}
