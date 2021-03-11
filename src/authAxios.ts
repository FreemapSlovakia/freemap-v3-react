import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CancelTokenSource,
} from 'axios';
import { ActionCreator } from 'typesafe-actions';
import { clearMap } from './actions/mainActions';
import { CancelItem, cancelRegister } from './cancelRegister';
import { RootState } from './storeCreator';

export function getAxios(expectedStatus?: number | number[]): AxiosInstance {
  const cfg: AxiosRequestConfig = {
    baseURL: process.env['API_URL'],
  };

  if (expectedStatus) {
    cfg.validateStatus = createValidateStatus(expectedStatus);
  }

  return axios.create(cfg);
}

export function getAuthAxios(
  getState: () => RootState,
  expectedStatus?: number | number[],
): AxiosInstance {
  const instance = getAxios(expectedStatus);

  instance.interceptors.request.use((cfg) => {
    const { user } = getState().auth;
    return !user
      ? cfg
      : {
          ...cfg,
          headers: {
            ...(cfg.headers || {}),
            Authorization: `Bearer ${user.authToken}`,
          },
        };
  });

  return instance;
}

interface HttpRequestParams extends Omit<AxiosRequestConfig, 'cancelToken'> {
  getState: () => RootState;
  expectedStatus?: number | number[];
  cancelActions?: ActionCreator<string>[];
}

export async function httpRequest({
  getState,
  expectedStatus,
  cancelActions = [
    clearMap,
    // selectFeature,
    // setActiveModal -- TODO we should maybe cancel only if closing modal
  ],
  ...rest
}: HttpRequestParams): Promise<AxiosResponse<unknown>> {
  let source: CancelTokenSource | undefined;
  let cancelItem: CancelItem | undefined;

  if (cancelActions && cancelActions.length) {
    source = axios.CancelToken.source();

    cancelItem = {
      cancelActions,
      cancel: source.cancel,
    };

    cancelRegister.add(cancelItem);
  }

  const params = {
    cancelToken: source?.token,
    ...rest,
  };

  try {
    if (!rest.url || /^(https?:)?\/\//.test(rest.url)) {
      return await getAxios(expectedStatus).request<unknown>(params);
    } else {
      return await getAuthAxios(getState, expectedStatus).request(params);
    }
  } finally {
    if (cancelItem) {
      cancelRegister.delete(cancelItem);
    }
  }
}

function createValidateStatus(expectedStatus: number | number[] = 200) {
  if (typeof expectedStatus === 'number') {
    return (status: number) => status === expectedStatus;
  }

  if (Array.isArray(expectedStatus)) {
    return (status: number) => expectedStatus.includes(status);
  }

  throw new Error('invalid expectedStatus');
}
