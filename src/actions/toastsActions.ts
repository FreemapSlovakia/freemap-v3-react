import { MessagePaths } from 'fm3/types/common';
import { createAction } from 'typesafe-actions';
import { RootAction } from '.';

export interface ToastAction {
  name?: string;
  nameKey?: MessagePaths;
  action?: RootAction | RootAction[];
  style?: string;
}

export interface Toast {
  message?: string;
  messageKey?: MessagePaths;
  messageParams?: Record<string, any>; // after upgrading redux Record<string, unknown> doesn't work here
  timeout?: number;
  style?:
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
};

export const toastsAdd = createAction('TOASTS_ADD', (toast: Toast) =>
  Object.assign(
    { actions: [] as ToastAction[], id: Math.random().toString(36).slice(2) },
    toast,
  ),
)<ResolvedToast>();

export const toastsRemove = createAction('TOASTS_REMOVE')<string>();

export const toastsStopTimeout = createAction('TOASTS_STOP_TIMEOUT')<string>();

export const toastsRestartTimeout = createAction(
  'TOASTS_RESTART_TIMEOUT',
)<string>();
