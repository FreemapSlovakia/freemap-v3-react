import { connect } from 'react-redux';
import { compose } from 'redux';
import React from 'react';
import PropTypes from 'prop-types';

import injectL10n from 'fm3/l10nInjector';

class ErrorCatcher extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    t: PropTypes.func.isRequired,
    errorTicketId: PropTypes.string,
  };

  state = {};

  componentDidCatch(error) {
    // eslint-disable-next-line
    console.error(error);
    this.setState({ error });
  }

  render() {
    const { t, children, errorTicketId } = this.props;

    if (!this.state.error) {
      return children;
    }

    return (
      <div
        style={{ padding: '10px' }}
        dangerouslySetInnerHTML={{
          __html: t('errorCatcher.html', { ticketId: errorTicketId || '...' }),
        }}
      />
    );
  }
}

export default compose(
  injectL10n(),
  connect(state => ({
    errorTicketId: state.main.errorTicketId,
  })),
)(ErrorCatcher);
