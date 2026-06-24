import type { RootAction } from '@app/store/rootAction.js';
import type { RootState } from '@app/store/store.js';
import { createAction, type UnknownAction } from '@reduxjs/toolkit';
import type { Leaves, MessagePaths } from '@shared/types/common.js';
import { ButtonVariant } from 'react-bootstrap/esm/types.js';
import type { Messages } from '@/translations/messagesInterface.js';

export type ToastAction = {
  action?: RootAction | RootAction[];
  variant?: ButtonVariant;
} & ({ name: string } | { nameKey: MessagePaths });

/**
 * `messageKey` is resolved at render against `messageLoader`'s message bundle,
 * or against the global `Messages` when no loader is given. Keys are typed
 * against `T`, inferred from the loader (defaulting to the global `Messages`).
 */
export type Toast<T = Messages> = {
  messageKey: Leaves<T>;
  messageParams?: Record<string, unknown>;
  messageLoader?: (language: string) => Promise<T>;
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
  // Dismissal conditions, combined per `predicatesOperation` (default OR). The
  // `cancelType` action-type match mirrors `cancelActions` on httpRequest.
  cancelType?: string | string[] | RegExp;
  actionPredicate?: (action: UnknownAction) => boolean;
  statePredicate?: (state: RootState) => boolean;
  stateChangePredicate?: (state: RootState) => unknown;
  predicatesOperation?: 'AND' | 'OR';
  noClose?: boolean;
};

// Heterogeneous toasts widen their message-bundle type once stored: every
// `Toast<T>` (T being some message bundle) assigns into `Toast<MessageBundle>`.
type MessageBundle = Record<string, unknown>;

type StoredToast = Toast<MessageBundle>;

export type ResolvedToast = StoredToast & {
  actions: ToastAction[];
  id: string;
  timeoutSince: number | undefined;
};

const toastsAddAction = createAction('TOASTS_ADD', (toast: StoredToast) => {
  return {
    payload: {
      id: Math.random().toString(36).slice(2),
      ...toast,
      actions: toast.actions ?? [],
      timeoutSince: toast.timeout === undefined ? undefined : Date.now(),
    } satisfies ResolvedToast,
  };
});

// Generic wrapper so `messageKey` is type-checked against `messageLoader`'s
// bundle (or the global `Messages`), while keeping the action-creator statics
// (`type`, `match`, …) the reducer and root-action union rely on.
export const toastsAdd = Object.assign(
  <T extends MessageBundle = Messages>(toast: Toast<T>) =>
    toastsAddAction(toast),
  toastsAddAction,
);

export const toastsRemove = createAction<string>('TOASTS_REMOVE');

export const toastsStopTimeout = createAction<string>('TOASTS_STOP_TIMEOUT');

export const toastsRestartTimeout = createAction<{
  id: string;
  timeoutSince: number;
}>('TOASTS_RESTART_TIMEOUT');
