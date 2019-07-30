import axios, { AxiosRequestConfig, Method, CancelTokenSource } from 'axios';
import { RootState } from './storeCreator';
import { Dispatch } from 'redux';
import { RootAction } from './actions';
import {
  startProgress,
  stopProgress,
  setActiveModal,
  clearMap,
  setTool,
} from './actions/mainActions';
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

interface HttpRequestParams {
  getState: () => RootState;
  dispatch: Dispatch<RootAction>;
  expectedStatus?: number | number[];
  url: string;
  method: Method;
  body?: object;
  cancelActions?: ActionType<RootAction>[];
}

interface ICancelItem {
  cancelActions: ActionType<RootAction>[];
  source: CancelTokenSource;
}

export const cancelRegister = new Set<ICancelItem>();

export async function httpRequest({
  getState,
  dispatch,
  expectedStatus,
  method,
  url,
  body,
  cancelActions = [setTool, clearMap, setActiveModal],
}: HttpRequestParams) {
  let source: CancelTokenSource | undefined;
  let cancelItem: ICancelItem | undefined;

  if (cancelActions) {
    source = axios.CancelToken.source();
    cancelItem = { cancelActions, source };
    cancelRegister.add(cancelItem);
  }

  const pid = Math.random();
  dispatch(startProgress(pid));
  try {
    return await getAuthAxios(getState, expectedStatus).request({
      method,
      url,
      data: body,
      cancelToken: cancelItem ? cancelItem.source.token : undefined,
    });
  } finally {
    if (cancelItem) {
      cancelRegister.delete(cancelItem);
    }

    dispatch(stopProgress(pid));
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
