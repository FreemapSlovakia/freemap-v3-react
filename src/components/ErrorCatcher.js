import { connect } from 'react-redux';
import { compose } from 'redux';
import React from 'react';
import PropTypes from 'prop-types';

import injectL10n from 'fm3/l10nInjector';
import { errorComponentError } from 'fm3/actions/errorActions';

class ErrorCatcher extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    errored: PropTypes.bool,
    t: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
    ticketId: PropTypes.string,
  }

  state = {};

  componentDidCatch(error, info) {
    // hack for globalErrorHandler.js
    // eslint-disable-next-line
    error.handledInErrorCatcher = true;
    this.setState({ error });
    this.props.onError(error, info.componentStack);
  }

  render() {
    const { t, errored, children, ticketId } = this.props;

    if (!this.state.error && !errored) {
      return children;
    }

    return (
      <div style={{ padding: '10px' }}>
        <div
          // eslint-disable-next-line
          dangerouslySetInnerHTML={{ __html: t('errorCatcher.html') }}
        />
        <p>
          Ticket ID: {ticketId}
        </p>
      </div>
    );
  }
}

export default compose(
  injectL10n(),
  connect(
    state => ({
      errored: !!state.error.reducingError,
      ticketId: state.error.ticketId,
    }),
    dispatch => ({
      onError(error, componentStack) {
        dispatch(errorComponentError(error, componentStack));
      },
    }),
  ),
)(ErrorCatcher);
