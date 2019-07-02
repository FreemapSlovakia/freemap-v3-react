import { connect } from 'react-redux';
import { compose } from 'redux';
import React from 'react';

import injectL10n, { Translator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';

type Props = ReturnType<typeof mapStateToProps> & {
  t: Translator;
};

interface IState {
  error?: Error;
}

class ErrorCatcher extends React.Component<Props, IState> {
  state: IState = {};

  componentDidCatch(error: Error) {
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

const mapStateToProps = (state: RootState) => ({
  errorTicketId: state.main.errorTicketId,
});

export default compose(
  injectL10n(),
  connect(mapStateToProps),
)(ErrorCatcher);
