import React, { ReactElement } from 'react';

import {
  toastsRemove,
  toastsStopTimeout,
  toastsRestartTimeout,
} from 'fm3/actions/toastsActions';
import { Toast } from 'fm3/components/Toast';
import { useTranslator } from 'fm3/l10nInjector';

import 'fm3/styles/toasts.scss';
import { RootState } from 'fm3/storeCreator';
import { useDispatch, useSelector } from 'react-redux';

export function Toasts(): ReactElement {
  const t = useTranslator();

  const dispatch = useDispatch();

  const toasts = useSelector((state: RootState) => state.toasts.toasts);

  return (
    <div className="toasts">
      {toasts.map(
        ({ message, messageKey, messageParams, id, actions, style }) => (
          <Toast
            key={id}
            id={id}
            message={
              message ||
              (messageKey ? t(messageKey, messageParams, message) : '???')
            }
            style={style}
            onAction={(action) => {
              // TODO use some action flag to indicate that we want the action to close the toast
              dispatch(toastsRemove(id));
              if (action) {
                if (Array.isArray(action)) {
                  action.forEach((a) => dispatch(a));
                } else {
                  dispatch(action);
                }
              }
            }}
            actions={actions.map((action) => ({
              ...action,
              name: action.nameKey ? t(action.nameKey) : action.name,
            }))}
            onTimeoutStop={() => {
              dispatch(toastsStopTimeout(id));
            }}
            onTimeoutRestart={() => {
              dispatch(toastsRestartTimeout(id));
            }}
          />
        ),
      )}
    </div>
  );
}
