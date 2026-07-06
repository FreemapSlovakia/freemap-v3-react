import {
  type CancelItem,
  type CancelTriggers,
  cancelRegister,
} from '@shared/cancelRegister.js';
import { clearMapFeatures } from './store/actions.js';
import type { RootState } from './store/store.js';

export class HttpError extends Error {
  status: number;
  body: string;

  constructor(status: number, body: string) {
    super('Unexpected HTTP response ' + status + ': ' + body);

    this.status = status;

    this.body = body;
  }
}

/**
 * Thrown by `httpRequest` when the request never reached the server — a
 * `fetch()` transport failure (offline, DNS, refused, CORS). A dedicated type
 * lets callers detect this precisely, since a bare `TypeError` can come from
 * unrelated code.
 */
export class NetworkError extends Error {
  constructor(cause: unknown) {
    super('Network request failed', { cause });

    this.name = 'NetworkError';
  }
}

/**
 * True when an `httpRequest` failed because the request never reached the
 * server, as opposed to a server response (`HttpError`), a parse error, or a
 * deliberate abort. Gates offline fallbacks, so it must be precise — hence a
 * dedicated `NetworkError` rather than an over-broad `TypeError` check.
 */
export function isNetworkError(err: unknown): boolean {
  return err instanceof NetworkError;
}

interface HttpRequestParams
  extends Omit<RequestInit, 'signal'>,
    CancelTriggers {
  url: string;
  data?: unknown;
  getState: () => RootState;
  expectedStatus?: number | number[] | null;
}

export function addHeader(
  headers: HeadersInit | undefined,
  name: string,
  value: string,
) {
  if (!headers) {
    return { [name]: value };
  }

  if (headers instanceof Headers) {
    headers.append(name, value);
  } else if (Array.isArray(headers)) {
    headers.push([name, value]);
  } else if (headers) {
    headers[name] = value;
  }

  return headers;
}

export async function httpRequest({
  url,
  getState,
  expectedStatus,
  cancelActions = [
    clearMapFeatures,
    // selectFeature,
    // setActiveModal -- TODO we should maybe cancel only if closing modal
  ],
  actionPredicate,
  statePredicate,
  stateChangePredicate,
  predicatesOperation,
  data,
  ...rest
}: HttpRequestParams): Promise<Response> {
  let ac: AbortController | undefined;

  let cancelItem: CancelItem | undefined;

  if (
    cancelActions?.length ||
    actionPredicate ||
    statePredicate ||
    stateChangePredicate
  ) {
    ac = new AbortController();

    cancelItem = {
      cancelActions,
      actionPredicate,
      statePredicate,
      stateChangePredicate,
      predicatesOperation,
      cancel(reason) {
        ac?.abort(
          reason === undefined
            ? reason
            : new DOMException(reason, 'AbortError'),
        );
      },
    };

    cancelRegister.add(cancelItem);
  }

  const init: RequestInit = ac
    ? {
        ...rest,
        signal: ac.signal,
      }
    : rest;

  const urlIsRelative = !/^(https?:)?\/\//.test(url);

  const { user } = getState().auth;

  if (urlIsRelative && user) {
    const authorization = `Bearer ${user.authToken}`;

    init.headers = addHeader(init.headers, 'Authorization', authorization);

    init.mode = 'cors';
  }

  if (data !== undefined) {
    init.headers = addHeader(init.headers, 'Content-Type', 'application/json');

    init.body = JSON.stringify(data);
  }

  try {
    // Build the Request first: a malformed URL/header/method throws a
    // `TypeError` here (a programmer error), keeping those out of the fetch
    // catch below so only genuine transport failures become `NetworkError`.
    const request = new Request(
      urlIsRelative ? process.env['API_URL'] + url : url,
      init,
    );

    let response: Response;

    try {
      response = await fetch(request);
    } catch (err) {
      // A valid request only rejects with a `TypeError` on a transport failure
      // (offline, DNS, refused, CORS); surface it as a typed `NetworkError`.
      // Anything else (e.g. an `AbortError`) propagates as-is.
      throw err instanceof TypeError ? new NetworkError(err) : err;
    }

    const { status } = response;

    if (
      expectedStatus !== null &&
      (expectedStatus === undefined
        ? !response.ok
        : typeof expectedStatus === 'number'
          ? status !== expectedStatus
          : !expectedStatus.includes(status))
    ) {
      throw new HttpError(status, await response.text());
    }

    return response;
  } finally {
    if (cancelItem) {
      cancelRegister.delete(cancelItem);
    }
  }
}
