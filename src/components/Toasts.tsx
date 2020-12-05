import React, { ReactElement, ReactNode, useCallback, useMemo } from 'react';

import {
  toastsRemove,
  toastsStopTimeout,
  toastsRestartTimeout,
} from 'fm3/actions/toastsActions';
import { Toast } from 'fm3/components/Toast';
import { getMessageByKey, useMessages } from 'fm3/l10nInjector';

import 'fm3/styles/toasts.scss';
import { RootState } from 'fm3/storeCreator';
import { useDispatch, useSelector } from 'react-redux';
import { RootAction } from 'fm3/actions';

export function Toasts(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const toasts = useSelector((state: RootState) => state.toasts.toasts);

  const items = useMemo(
    () =>
      toasts.map(
        ({ id, actions, style, message, messageKey, messageParams }) => {
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
              msg = '???';
            }
          }

          return {
            id,
            actions,
            style,
            msg,
          };
        },
      ),
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
    <div className="toasts">
      {items.map(({ id, actions, style, msg }) => {
        return (
          <Toast
            key={id}
            id={id}
            message={msg}
            style={style}
            onAction={handleAction}
            actions={actions.map((action) => ({
              ...action,
              name: action.nameKey ? 't(action.nameKey)' : action.name,
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
