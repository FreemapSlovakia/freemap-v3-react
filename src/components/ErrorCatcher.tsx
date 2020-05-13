import { connect } from 'react-redux';
import React from 'react';

import { withTranslator, Translator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';

type Props = ReturnType<typeof mapStateToProps> & {
  t: Translator;
  children: JSX.Element | JSX.Element[];
};

interface State {
  error?: Error;
}

class ErrorCatcherInt extends React.Component<Props, State> {
  state: State = {};

  componentDidCatch(error: Error) {
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

export const ErrorCatcher = connect(mapStateToProps)(
  withTranslator(ErrorCatcherInt),
);
