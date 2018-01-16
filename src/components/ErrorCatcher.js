import { connect } from 'react-redux';
import { compose } from 'redux';
import React from 'react';
import PropTypes from 'prop-types';

import injectL10n from 'fm3/l10nInjector';

class ErrorCatcher extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    t: PropTypes.func.isRequired,
    ticketId: PropTypes.string,
  }

  state = {};

  componentDidCatch(error) {
    // eslint-disable-next-line
    this.setState({ error });
  }

  render() {
    const { t, children, ticketId } = this.props;

    if (!this.state.error && !ticketId) {
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
      ticketId: state.error.ticketId,
    }),
  ),
)(ErrorCatcher);
