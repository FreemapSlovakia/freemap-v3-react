import { createAction } from 'typesafe-actions';
import { RootAction } from '.';

export interface ToastAction {
  name?: string;
  nameKey?: string;
  action?: RootAction | RootAction[];
  style?: string;
}

export interface Toast {
  message?: string | JSX.Element; // TODO string only
  messageKey?: string;
  messageParams?: { [key: string]: any };
  timeout?: number;
  style?: 'info' | 'warning' | 'danger';
  actions?: ToastAction[];
  collapseKey?: string;
  cancelType?: string | string[] | RegExp;
}

export interface ResolvedToast extends Toast {
  id: number;
  actions: ToastAction[];
}

export const toastsAdd = createAction('TOASTS_ADD', (toast: Toast) =>
  Object.assign({ actions: [] as ToastAction[] }, toast, {
    id: Math.random(),
  }),
)<ResolvedToast>();

export const toastsRemove = createAction('TOASTS_REMOVE')<number>();

export const toastsStopTimeout = createAction('TOASTS_STOP_TIMEOUT')<number>();

export const toastsRestartTimeout = createAction('TOASTS_RESTART_TIMEOUT')<
  number
>();

// helpers

/**
 * @deprecated use dispatchAxiosErrorAsToast
 */
export function toastsAddError(
  messageKey?: string,
  err?: Error,
  params: { [key: string]: any } = {},
) {
  return toastsAdd({
    messageKey,
    messageParams: { ...params, ...(err ? { err: err.message } : {}) },
    style: 'danger',
  });
}
