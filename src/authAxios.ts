import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import { RootState } from './storeCreator';
import { RootAction } from './actions';
import { setActiveModal, clearMap, setTool } from './actions/mainActions';
import { ActionType } from 'typesafe-actions';

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

  instance.interceptors.request.use(cfg => {
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
  cancelActions?: ActionType<RootAction>[];
}

interface CancelItem {
  cancelActions: ActionType<RootAction>[];
  source: CancelTokenSource;
}

export const cancelRegister = new Set<CancelItem>();

export async function httpRequest({
  getState,
  expectedStatus,
  cancelActions = [setTool, clearMap, setActiveModal],
  ...rest
}: HttpRequestParams) {
  let source: CancelTokenSource | undefined;
  let cancelItem: CancelItem | undefined;

  if (cancelActions) {
    source = axios.CancelToken.source();
    cancelItem = { cancelActions, source };
    cancelRegister.add(cancelItem);
  }

  const params = {
    cancelToken: cancelItem ? cancelItem.source.token : undefined,
    ...rest,
  };

  try {
    if (!rest.url || /^(https?:)?\/\//.test(rest.url)) {
      return getAxios(expectedStatus).request(params);
    } else {
      return getAuthAxios(getState, expectedStatus).request(params);
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

  if (typeof expectedStatus === 'function') {
    return expectedStatus;
  }

  throw new Error('invalid expectedStatus');
}
