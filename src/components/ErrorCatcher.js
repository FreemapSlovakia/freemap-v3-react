import { connect } from 'react-redux';
import { compose } from 'redux';
import React from 'react';
import PropTypes from 'prop-types';

import injectL10n from 'fm3/l10nInjector';

class ErrorCatcher extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    erroredAction: PropTypes.shape({}),
    reducingError: PropTypes.instanceOf(Error),
    state: PropTypes.shape({
      l10n: PropTypes.shape({
        translations: PropTypes.shape({}),
      }),
    }),
    t: PropTypes.func.isRequired,
  }

  state = {};

  componentDidCatch(error, info) {
    this.setState({ error, info });
  }

  render() {
    const { t, reducingError, children, erroredAction, state } = this.props;
    const { error, info } = this.state;

    if (!error && !reducingError) {
      return children;
    }

    const simplerState = { ...state, l10n: { ...state.l10n, translations: undefined } };
    if (simplerState.auth.user) {
      delete simplerState.auth.user.authToken;
    }

    return (
      <div style={{ padding: '10px' }}>
        <div
          // eslint-disable-next-line
          dangerouslySetInnerHTML={{ __html: t('errorCatcher.html') }}
        />
        <pre>
          {
            [
              ['URL', window.location.href],
              ['User Agent', navigator.userAgent],
              ['Errored Action', erroredAction],
              ['Reducing Error', reducingError && reducingError.stack],
              ['Component Error', error && error.stack],
              ['Component Stack', info && info.componentStack],
              ['App State', JSON.stringify(simplerState, null, 2)],
              ['Local Storage', Object
                .keys(localStorage)
                .map(key => `${key}\n${localStorage.getItem(key)}`)
                .join('\n----------------\n'),
              ],
            ]
              .filter(([, x]) => x)
              .map(([title, detail]) => `================\n${title}\n================\n${detail}`)
              .join('\n')
          }
        </pre>
      </div>
    );
  }
}

export default compose(
  injectL10n(),
  connect(
    state => ({
      state,
      erroredAction: state.main.erroredAction,
      reducingError: state.main.reducingError,
    }),
  ),
)(ErrorCatcher);
