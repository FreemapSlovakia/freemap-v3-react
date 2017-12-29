import { connect } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';

class ErrorCatcher extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    erroredAction: PropTypes.shape({}),
    reducingError: PropTypes.instanceOf(Error),
    state: PropTypes.shape({}),
  }

  state = {};

  componentDidCatch(error, info) {
    this.setState({ error, info });
  }

  render() {
    if (!this.state.error && !this.props.reducingError) {
      return this.props.children;
    }

    return (
      <div style={{ padding: '10px' }}>
        <h1>Ups!</h1>
        <p>
          Voľačo nedobre sa udialo.
        </p>
        <p>
          Prosíme Ťa, <a href="https://github.com/FreemapSlovakia/freemap-v3-react/issues/new" target="_blank" rel="noopener noreferrer">nahlás nám chybu</a>,
          prípadne nám ju pošli na <a href="mailto:freemap@freemap.sk?subject=Nahlásenie%20chyby%20na%20www.freemap.sk">freemap@freemap.sk</a>.
          Nezabudni, prosím, priložiť krátky popis, ako sa ti podarilo vyvolať chybu a nižšieuvedené dáta pre ladenie.
        </p>
        <p>
          Ďakujeme.
        </p>
        Akcie:
        <ul>
          <li><a href="">znovunačítať poslednú stránku</a></li>
          <li><a href="/">znovunačítať úvodnú stránku</a></li>
          <li><a href="/?reset-local-storage">zmazať lokálne dáta a znovunačítať úvodnú stránku</a></li>
        </ul>
        <h2>Dáta pre ladenie</h2>
        <pre>
          {
            [
              ['URL', window.location.href],
              ['User Agent', navigator.userAgent],
              ['Errored Action', this.props.erroredAction],
              ['Reducing Error', this.props.reducingError && this.props.reducingError.stack],
              ['Component Error', this.state.error && this.state.error.stack],
              ['Component Stack', this.state.info && this.state.info.componentStack],
              ['App State', JSON.stringify(this.props.state, null, 2)],
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

export default connect(
  state => ({
    state,
    erroredAction: state.main.erroredAction,
    reducingError: state.main.reducingError,
  }),
)(ErrorCatcher);
