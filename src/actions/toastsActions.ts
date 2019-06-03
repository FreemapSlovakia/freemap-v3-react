import { createStandardAction } from 'typesafe-actions';

interface ToastType {
  message?: string;
  messageKey?: string;
  messageParams?: { [key: string]: string };
  actions?: any[]; // TODO
  timeout?: number;
  style?: 'info' | 'warning' | 'danger';
  collapseKey?: string;
  cancelType?: string;
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
  }: ToastType) => ({
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

export const toastsRemove = createStandardAction('TOASTS_REMOVE')<any>();

export const toastsStopTimeout = createStandardAction('TOASTS_STOP_TIMEOUT')<
  any
>();

export const toastsRestartTimeout = createStandardAction(
  'TOASTS_RESTART_TIMEOUT',
)<any>();

// helpers

export function toastsAddError(
  messageKey: string,
  err?: Error,
  params: { [key: string]: any } = {},
) {
  return toastsAdd({
    messageKey,
    messageParams: { ...params, ...(err ? { err: err.message } : {}) },
    style: 'danger',
  });
}
