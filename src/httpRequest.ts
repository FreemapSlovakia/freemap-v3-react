import { ActionCreator } from 'typesafe-actions';
import { clearMapFeatures } from './actions/mainActions';
import { CancelItem, cancelRegister } from './cancelRegister';
import { RootState } from './reducers';

interface HttpRequestParams extends Omit<RequestInit, 'signal'> {
  url: string;
  data?: unknown;
  getState: () => RootState;
  expectedStatus?: number | number[];
  cancelActions?: ActionCreator<string>[];
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
      cancel() {
        ac?.abort();
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
    let response: Response;

    try {
      response = await fetch(
        urlIsRelative ? process.env['API_URL'] + url : url,
        init,
      );
    } catch (err) {
      (err as any)._fm_fetchError = true;

      throw err;
    }

    const { status } = response;

    if (
      expectedStatus === undefined
        ? !response.ok
        : typeof expectedStatus === 'number'
          ? status !== expectedStatus
          : !expectedStatus.includes(status)
    ) {
      throw new Error('Unexpected status ' + status);
    }

    return response;
  } finally {
    if (cancelItem) {
      cancelRegister.delete(cancelItem);
    }
  }
}
