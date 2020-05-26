import axios, { AxiosRequestConfig, CancelTokenSource, Canceler } from 'axios';
import { RootState } from './storeCreator';
import { setActiveModal, clearMap, selectFeature } from './actions/mainActions';
import { ActionCreator } from 'typesafe-actions';

export function getAxios(expectedStatus?: number | number[]) {
  const cfg: AxiosRequestConfig = {
    baseURL: process.env.API_URL,
  };

  if (expectedStatus) {
    cfg.validateStatus = createValidateStatus(expectedStatus);
  }

  return axios.create(cfg);
}

export function getAuthAxios(
  getState: () => RootState,
  expectedStatus?: number | number[],
) {
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

export interface CancelItem {
  cancelActions: ActionCreator<string>[];
  cancel: Canceler;
}

export const cancelRegister = new Set<CancelItem>(); // TODO move elsewhere as it is reused in other places

export async function httpRequest({
  getState,
  expectedStatus,
  cancelActions = [selectFeature, clearMap, setActiveModal],
  ...rest
}: HttpRequestParams) {
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
      return await getAxios(expectedStatus).request(params);
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
