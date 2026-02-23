import { createAction } from '@reduxjs/toolkit';
import type { MessagePaths } from '../../../types/common.js';
import type { RootAction } from '../../../actions/index.js';

export type ToastAction = {
  action?: RootAction | RootAction[];
  style?: string;
} & ({ name: string } | { nameKey: MessagePaths });

export type Toast = (
  | { message: string }
  | { messageKey: MessagePaths; messageParams?: Record<string, unknown> }
) & {
  timeout?: number;
  style:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'light'
    | 'dark';
  actions?: ToastAction[];
  id?: string;
  cancelType?: string | string[] | RegExp;
  noClose?: boolean;
};

export type ResolvedToast = Toast & {
  actions: ToastAction[];
  id: string;
  timeoutSince: number | undefined;
};

export const toastsAdd = createAction('TOASTS_ADD', (toast: Toast) => {
  return {
    payload: {
      actions: [],
      id: Math.random().toString(36).slice(2),
      ...toast,
      timeoutSince: toast.timeout === undefined ? undefined : Date.now(),
    } satisfies ResolvedToast,
  };
});

export const toastsRemove = createAction<string>('TOASTS_REMOVE');

export const toastsStopTimeout = createAction<string>('TOASTS_STOP_TIMEOUT');

export const toastsRestartTimeout = createAction<{
  id: string;
  timeoutSince: number;
}>('TOASTS_RESTART_TIMEOUT');
