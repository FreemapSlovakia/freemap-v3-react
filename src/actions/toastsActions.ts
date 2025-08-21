import { createAction } from '@reduxjs/toolkit';
import type { MessagePaths } from '../types/common.js';
import type { RootAction } from './index.js';

export interface ToastAction {
  name?: string;
  nameKey?: MessagePaths;
  action?: RootAction | RootAction[];
  style?: string;
}

export interface Toast {
  message?: string;
  messageKey?: MessagePaths;
  messageParams?: Record<string, unknown>; // after upgrading redux Record<string, unknown> doesn't work here
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
}

export type ResolvedToast = Toast & {
  actions: ToastAction[];
  id: string;
  timeoutSince: number | undefined;
};

export const toastsAdd = createAction('TOASTS_ADD', (toast: Toast) => {
  return {
    payload: {
      actions: [] as ToastAction[],
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
