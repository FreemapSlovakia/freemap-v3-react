import { RootAction } from 'fm3/actions';
import {
  ToastAction,
  toastsRemove,
  toastsRestartTimeout,
  toastsStopTimeout,
} from 'fm3/actions/toastsActions';
import { Toast } from 'fm3/components/Toast';
import { getMessageByKey, useMessages } from 'fm3/l10nInjector';
import 'fm3/styles/toasts.scss';
import { Messages } from 'fm3/translations/messagesInterface';
import { ReactElement, ReactNode, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

function tx(m: Messages | undefined, { name, nameKey }: ToastAction) {
  if (name !== undefined) {
    return name;
  }

  if (nameKey) {
    const v = getMessageByKey(m, nameKey);

    if (typeof v === 'string') {
      return v;
    }

    if (v instanceof Function) {
      return v.call(undefined);
    }
  }

  return '…';
}

export function Toasts(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const toasts = useSelector((state) => state.toasts.toasts);

  const items = useMemo(
    () =>
      toasts
        .map(
          ({
            id,
            actions,
            style,
            message,
            messageKey,
            messageParams,
            noClose,
          }) => {
            let msg: ReactNode;

            if (message !== undefined) {
              msg = message;
            } else if (messageKey) {
              const v = getMessageByKey(m, messageKey);

              if (typeof v === 'string') {
                msg = v;
              } else if (v instanceof Function) {
                msg = v.call(undefined, messageParams);
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
          action.forEach((a) => dispatch(a));
        } else {
          dispatch(action);
        }
      }
    },
    [dispatch],
  );

  return (
    <div className="fm-toasts">
      {items.map(({ id, actions, style, msg, noClose }) => {
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
            onTimeoutStop={() => {
              dispatch(toastsStopTimeout(id));
            }}
            onTimeoutRestart={() => {
              dispatch(toastsRestartTimeout(id));
            }}
          />
        );
      })}
    </div>
  );
}
