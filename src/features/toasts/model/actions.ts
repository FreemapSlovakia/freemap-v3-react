import type { RootAction } from '@app/store/rootAction.js';
import type { RootState } from '@app/store/store.js';
import { createAction, type UnknownAction } from '@reduxjs/toolkit';
import type { Leaves, MessagePaths } from '@shared/types/common.js';
import type { ButtonVariant } from 'react-bootstrap/esm/types.js';
import type { Messages } from '@/translations/messagesInterface.js';

export type ToastAction = {
  action?: RootAction | RootAction[];
  /**
   * Makes the button a link. For a destination the app cannot express as an
   * action — an external page, or an `intent://` URL that hands off to another
   * app — where routing it through a dispatch would only lose the user's click
   * as the gesture that allowed the navigation.
   */
  href?: string;
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
  /**
   * Dispatched when the user dismisses the toast with its × — not when it goes
   * away on `cancelType`, a predicate, or a timeout. A toast that some other
   * state owns (a preference, a selection) needs the × to reach that owner;
   * `toastsRemove` can't, being what every automatic dismissal dispatches too.
   *
   * Typed as `UnknownAction` rather than `RootAction`: `RootAction` is derived
   * from every action creator, `toastsAdd` among them, so naming it here from a
   * plain (non-deferred) property of `Toast` closes the loop and collapses the
   * whole union to `any`.
   */
  onClose?: UnknownAction | UnknownAction[];
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
  /**
   * The user killed the countdown: it does not come back, `cancelType` and the
   * predicates leave the toast alone, and the attribution toast ignores the
   * click that otherwise dismisses it. Only the × takes it down.
   */
  pinned: boolean;
};

const toastsAddAction = createAction('TOASTS_ADD', (toast: StoredToast) => {
  return {
    payload: {
      id: Math.random().toString(36).slice(2),
      ...toast,
      actions: toast.actions ?? [],
      timeoutSince: toast.timeout === undefined ? undefined : Date.now(),
      pinned: false,
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

export const toastsSetPinned = createAction<{ id: string; pinned: boolean }>(
  'TOASTS_SET_PINNED',
);
