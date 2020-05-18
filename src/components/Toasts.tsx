import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import {
  toastsRemove,
  toastsStopTimeout,
  toastsRestartTimeout,
} from 'fm3/actions/toastsActions';
import { Toast } from 'fm3/components/Toast';
import { withTranslator, Translator } from 'fm3/l10nInjector';

import 'fm3/styles/toasts.scss';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const ToastsInt: React.FC<Props> = ({
  toasts,
  onAction,
  onTimeoutStop,
  onTimeoutRestart,
  t,
}) => {
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
            onAction={onAction}
            actions={actions.map((action) => ({
              ...action,
              name: action.nameKey ? t(action.nameKey) : action.name,
            }))}
            onTimeoutStop={onTimeoutStop}
            onTimeoutRestart={onTimeoutRestart}
          />
        ),
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  toasts: state.toasts.toasts,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onAction(id: string, action?: RootAction | RootAction[]) {
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
  onTimeoutStop(id: string) {
    dispatch(toastsStopTimeout(id));
  },
  onTimeoutRestart(id: string) {
    dispatch(toastsRestartTimeout(id));
  },
});

export const Toasts = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(ToastsInt));
