import { type ReactElement, ReactNode, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import type { RootAction } from '../actions/index.js';
import {
  ToastAction,
  toastsRemove,
  toastsRestartTimeout,
  toastsStopTimeout,
} from '../actions/toastsActions.js';
import { Toast } from '../components/Toast.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { getMessageByKey, useMessages } from '../l10nInjector.js';
import '../styles/toasts.scss';
import { Messages } from '../translations/messagesInterface.js';

function tx(m: Messages | undefined, toastAction: ToastAction) {
  if ('name' in toastAction) {
    return toastAction.name;
  }

  const v = getMessageByKey(m, toastAction.nameKey);

  if (typeof v === 'string') {
    return v;
  }

  if (v instanceof Function) {
    return v.call(undefined);
  }

  return '…';
}

export function Toasts(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const toasts = useAppSelector((state) => state.toasts.toasts);

  const items = useMemo(
    () =>
      Object.values(toasts)
        .map(
          ({ id, actions, style, noClose, timeout, timeoutSince, ...rest }) => {
            let msg: ReactNode;

            if ('message' in rest) {
              msg = rest.message;
            } else {
              const v = getMessageByKey(m, rest.messageKey);

              if (typeof v === 'string') {
                msg = v;
              } else if (typeof v === 'function') {
                msg = v.call(undefined, rest.messageParams);
              } else {
                msg = '…';
              }
            }

            return {
              id,
              actions,
              style,
              msg,
              noClose,
              timeout,
              timeoutSince,
            };
          },
        )
        .reverse(),
    [m, toasts],
  );

  const handleAction = useCallback(
    (id: string, action?: RootAction | RootAction[]) => {
      // TODO use some action flag to indicate that we want the action to close the toast
      dispatch(toastsRemove(id));

      if (action) {
        if (Array.isArray(action)) {
          for (const a of action) {
            dispatch(a);
          }
        } else {
          dispatch(action);
        }
      }
    },
    [dispatch],
  );

  return (
    <div className="fm-toasts">
      {items.map(
        ({ id, actions, style, msg, noClose, timeout, timeoutSince }) => {
          return (
            <Toast
              key={id}
              id={id}
              message={msg}
              style={style}
              noClose={noClose}
              onAction={handleAction}
              actions={actions.map((action) => ({
                ...action,
                name: tx(m, action),
              }))}
              timeout={timeout}
              timeoutSince={timeoutSince}
              onTimeoutStop={() => dispatch(toastsStopTimeout(id))}
              onTimeoutRestart={() =>
                dispatch(toastsRestartTimeout({ id, timeoutSince: Date.now() }))
              }
            />
          );
        },
      )}
    </div>
  );
}
