import axios from 'axios';
import { ResolvedToast, toastsAdd } from 'fm3/actions/toastsActions';
import { MessagePaths } from 'fm3/types/common';
import { Dispatch } from 'redux';
import { ActionType, PayloadAction } from 'typesafe-actions';

export function dispatchAxiosErrorAsToast(
  dispatch: Dispatch<ActionType<typeof toastsAdd>>,
  messageKey: MessagePaths,
  err?: unknown,
  params: { [key: string]: unknown } = {},
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
