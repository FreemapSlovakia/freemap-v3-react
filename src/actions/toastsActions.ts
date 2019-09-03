import { createStandardAction } from 'typesafe-actions';
import { RootAction } from '.';

export interface ToastAction {
  name?: string;
  nameKey?: string;
  action?: RootAction | RootAction[];
  style?: string;
}

export interface Toast {
  message?: string | JSX.Element; // PropTypes.node, // TODO string only
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

export const toastsAdd = createStandardAction('TOASTS_ADD').map(
  ({
    message,
    messageKey,
    messageParams,
    actions = [],
    timeout,
    style,
    collapseKey,
    cancelType,
  }: Toast) => ({
    payload: {
      id: Math.random(),
      message,
      messageKey,
      actions,
      timeout,
      style,
      collapseKey,
      cancelType,
      messageParams,
    },
  }),
);

export const toastsRemove = createStandardAction('TOASTS_REMOVE')<number>();

export const toastsStopTimeout = createStandardAction('TOASTS_STOP_TIMEOUT')<
  number
>();

export const toastsRestartTimeout = createStandardAction(
  'TOASTS_RESTART_TIMEOUT',
)<number>();

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
