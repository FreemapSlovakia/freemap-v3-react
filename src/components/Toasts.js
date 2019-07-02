import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';

import * as FmPropTypes from 'fm3/propTypes';
import {
  toastsRemove,
  toastsStopTimeout,
  toastsRestartTimeout,
} from 'fm3/actions/toastsActions';
import Toast from 'fm3/components/Toast';
import injectL10n from 'fm3/l10nInjector';

import 'fm3/styles/toasts.scss';

function Toasts({ toasts, onAction, onTimeoutStop, onTimeoutRestart, t }) {
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
            actions={actions.map(action => ({
              ...action,
              name: action.name || t(action.nameKey),
            }))}
            onTimeoutStop={onTimeoutStop}
            onTimeoutRestart={onTimeoutRestart}
          />
        ),
      )}
    </div>
  );
}

Toasts.propTypes = {
  onAction: PropTypes.func.isRequired,
  onTimeoutStop: PropTypes.func.isRequired,
  onTimeoutRestart: PropTypes.func.isRequired,
  toasts: PropTypes.arrayOf(FmPropTypes.toast.isRequired).isRequired,
  t: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  toasts: state.toasts.toasts,
});

const mapDispatchToProps = dispatch => ({
  onAction(id, action) {
    // TODO use some action flag to indicate that we want the action to close the toast
    dispatch(toastsRemove(id));
    if (action) {
      if (Array.isArray(action)) {
        action.forEach(a => dispatch(a));
      } else {
        dispatch(action);
      }
    }
  },
  onTimeoutStop(id) {
    dispatch(toastsStopTimeout(id));
  },
  onTimeoutRestart(id) {
    dispatch(toastsRestartTimeout(id));
  },
});

export default compose(
  injectL10n(),
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(Toasts);
