import { clearMapFeatures } from '@app/store/actions.js';
import type { RootState } from './store/store.js';
import {
  ActionCreatorMatchable,
  CancelItem,
  cancelRegister,
} from '../cancelRegister.js';

export class HttpError extends Error {
  status: number;
  body: string;

  constructor(status: number, body: string) {
    super('Unexpected HTTP response ' + status + ': ' + body);

    this.status = status;

    this.body = body;
  }
}

interface HttpRequestParams extends Omit<RequestInit, 'signal'> {
  url: string;
  data?: unknown;
  getState: () => RootState;
  expectedStatus?: number | number[] | null;
  cancelActions?: ActionCreatorMatchable[];
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
  data,
  ...rest
}: HttpRequestParams): Promise<Response> {
  let ac: AbortController | undefined;

  let cancelItem: CancelItem | undefined;

  if (cancelActions && cancelActions.length) {
    ac = new AbortController();

    cancelItem = {
      cancelActions,
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
    let response;

    try {
      response = await fetch(
        urlIsRelative ? process.env['API_URL'] + url : url,
        init,
      );
    } catch (err) {
      (err as { _fm_fetchError: boolean })._fm_fetchError = true;

      throw err;
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
