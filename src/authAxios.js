import axios from 'axios';

export function getAxios(expectedStatus) {
  const cfg = {
    baseURL: process.env.API_URL,
  };

  if (expectedStatus) {
    cfg.validateStatus = createValidateStatus(expectedStatus);
  }

  return axios.create(cfg);
}

export function getAuthAxios(getState, expectedStatus) {
  const instance = getAxios(expectedStatus);

  instance.interceptors.request.use((cfg) => {
    const { user } = getState().auth;
    return !user ? cfg : {
      ...cfg,
      headers: {
        ...(cfg.headers || {}),
        Authorization: `Bearer ${user.authToken}`,
      },
    };
  });

  return instance;
}

function createValidateStatus(expectedStatus = 200) {
  if (typeof expectedStatus === 'number') {
    return status => status === expectedStatus;
  }

  if (Array.isArray(expectedStatus)) {
    return status => expectedStatus.includes(status);
  }

  if (typeof expectedStatus === 'function') {
    return expectedStatus;
  }

  throw new Error('invalid expectedStatus');
}
