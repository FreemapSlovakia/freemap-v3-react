import axios, { AxiosRequestConfig, Method } from 'axios';
import { RootState } from './storeCreator';
import { Dispatch } from 'redux';
import { RootAction } from './actions';
import { startProgress, stopProgress } from './actions/mainActions';

export function getAxios(expectedStatus?: number) {
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
  expectedStatus?: number,
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
  expectedStatus?: number;
  url: string;
  method: Method;
  body?: object;
}

export function httpRequest({
  getState,
  dispatch,
  expectedStatus,
  method,
  url,
  body,
}: HttpRequestParams) {
  const pid = Math.random();
  dispatch(startProgress(pid));
  try {
    return getAuthAxios(getState, expectedStatus).request({
      method,
      url,
      data: body,
    });
  } finally {
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
