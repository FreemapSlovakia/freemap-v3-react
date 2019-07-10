import { startProgress, stopProgress, request } from 'fm3/actions/mainActions';

import { getAuthAxios } from 'fm3/authAxios';
import { RootState } from 'fm3/storeCreator';
import { RootAction } from 'fm3/actions';
import { Middleware, Dispatch } from 'redux';
import { isActionOf } from 'typesafe-actions';
import { AxiosResponse } from 'axios';

export const requestMiddleware: Middleware<
  {},
  RootState,
  Dispatch<RootAction>
> = ({ dispatch, getState }) => next => async (action: RootAction) => {
  if (isActionOf(request.request, action)) {
    const pid = Math.random();
    dispatch(startProgress(pid));
    let response: AxiosResponse<any>;
    try {
      try {
        response = await getAuthAxios(getState).request({
          method: action.payload.method,
          url: action.payload.url,
          // TODO validateStatus
        });
      } finally {
        dispatch(stopProgress(pid));
      }

      dispatch(
        request.success({
          tag: action.payload.tag,
          result: response.data,
        }),
      );
    } catch (error) {
      dispatch(
        request.failure({
          tag: action.payload.tag,
          error,
        }),
      );
    }
  } else {
    next(action);
  }
};
