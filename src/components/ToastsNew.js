import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { toastsRemove } from 'fm3/actions/toastsActions';

import Toast from 'fm3/components/Toast';

import 'fm3/styles/toasts.scss';

function Toasts({ toasts, onAction }) {
  return (
    <div className="toasts">
      {toasts.map(({ message, id, actions }) => (
        <Toast key={id} id={id} message={message} onAction={onAction} actions={actions} />
      ))}
    </div>
  );
}

Toasts.propTypes = {
  onAction: PropTypes.func.isRequired,
  toasts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      message: PropTypes.node.isRequired,
      actions: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
          action: PropTypes.object,
        }),
      ).isRequired,
    }),
  ).isRequired,
};

export default connect(
  state => ({
    toasts: state.toasts.toasts,
  }),
  dispatch => ({
    onAction(id, action) {
      dispatch(toastsRemove(id)); // TODO use some flag
      if (action) {
        dispatch(action);
      }
    },
  }),
)(Toasts);
