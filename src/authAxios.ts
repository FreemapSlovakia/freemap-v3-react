import axios, { AxiosRequestConfig } from 'axios';
import { RootState } from './storeCreator';

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
