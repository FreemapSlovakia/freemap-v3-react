import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
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

interface HttpRequestParams extends Omit<AxiosRequestConfig, 'cancelToken'> {
  getState: () => RootState;
  dispatch: Dispatch<RootAction>;
  expectedStatus?: number | number[];
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
  cancelActions = [setTool, clearMap, setActiveModal],
  ...rest
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
      cancelToken: cancelItem ? cancelItem.source.token : undefined,
      ...rest,
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
