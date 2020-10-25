import { createAction, PayloadAction } from 'typesafe-actions';
import { RootAction } from '.';

export interface ToastAction {
  name?: string;
  nameKey?: string;
  action?: RootAction | RootAction[];
  style?: string;
}

export interface Toast {
  message?: string;
  messageKey?: string;
  messageParams?: { [key: string]: unknown };
  timeout?: number;
  style?: 'info' | 'warning' | 'danger';
  actions?: ToastAction[];
  id?: string;
  cancelType?: string | string[] | RegExp;
}

export interface ResolvedToast extends Toast {
  actions: ToastAction[];
  id: string;
}

export const toastsAdd = createAction('TOASTS_ADD', (toast: Toast) =>
  Object.assign(
    { actions: [] as ToastAction[], id: Math.random().toString(36).slice(2) },
    toast,
  ),
)<ResolvedToast>();

export const toastsRemove = createAction('TOASTS_REMOVE')<string>();

export const toastsStopTimeout = createAction('TOASTS_STOP_TIMEOUT')<string>();

export const toastsRestartTimeout = createAction('TOASTS_RESTART_TIMEOUT')<
  string
>();

// helpers

/**
 * @deprecated use dispatchAxiosErrorAsToast
 */
export function toastsAddError(
  messageKey?: string,
  err?: Error,
  params: { [key: string]: unknown } = {},
): PayloadAction<'TOASTS_ADD', ResolvedToast> {
  return toastsAdd({
    id: Math.random().toString(36).slice(2),
    messageKey,
    messageParams: { ...params, ...(err ? { err: err.message } : {}) },
    style: 'danger',
  });
}
