import axios from 'axios';
import { Dispatch } from 'redux';
import { ResolvedToast, toastsAdd } from 'fm3/actions/toastsActions';
import { ActionType, PayloadAction } from 'typesafe-actions';

export function dispatchAxiosErrorAsToast(
  dispatch: Dispatch<ActionType<typeof toastsAdd>>,
  messageKey: string,
  err?: unknown,
  params: { [key: string]: any } = {},
  id?: string,
): PayloadAction<'TOASTS_ADD', ResolvedToast> | undefined {
  if (axios.isCancel(err)) {
    return;
  }

  return dispatch(
    toastsAdd({
      id,
      messageKey,
      messageParams: {
        ...params,
        ...(err instanceof Error ? { err: err.message } : {}),
      },
      style: 'danger',
    }),
  );
}
