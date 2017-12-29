import React from 'react';
import PropTypes from 'prop-types';

export default class ErrorCatcher extends React.Component {
  static propTypes = {
    children: PropTypes.node,
  }

  state = {};

  componentDidCatch(error, info) {
    this.setState({ error, info });
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    // TODO add state, URL, link to reload and reset&reload

    return (
      <div style={{ padding: '10px' }}>
        <h1>Ups!</h1>
        <p>
          Voľačo nedobre sa udialo.
        </p>
        <p>
          Prosíme, <a href="https://github.com/FreemapSlovakia/freemap-v3-react/issues/new" target="_blank" rel="noopener noreferrer">nahlás nám chybu</a>,
          prípadne nám ju pošli na <a href="mailto:freemap@freemap.sk?subject=Nahlásenie%20chyby%20na%20www.freemap.sk">freemap@freemap.sk</a>.
          Nezabudni priložiť nižšieuvedené dáta pre ladenie.
        </p>
        <p>
          Ďakujeme.
        </p>
        <h2>Dáta pre ladenie</h2>
        <pre>
          {
            [
              this.state.error.stack,
              this.state.info && this.state.info.componentStack,
              Object.keys(localStorage).map(key => `${key}\n${localStorage.getItem(key)}\n----------\n`),
            ].filter(x => x).join('\n================\n')
          }
        </pre>
      </div>
    );
  }
}
