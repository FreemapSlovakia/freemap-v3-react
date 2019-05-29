import * as React from 'react';
import { translate, splitAndSubstitute } from 'fm3/stringUtils';
import { connect } from 'react-redux';

// TODO types
export default function injectL10n() {
  return wrappedComponent => {
    const x = props =>
      React.createElement(wrappedComponent, { t: tx, ...props });

    return connect((state: any) => ({
      language: state.l10n.language,
    }))(x);
  };
}

function tx(key: string, params: { [key: string]: any } = {}, dflt = '') {
  const t = translate(global.translations || {}, key, dflt);
  return typeof t === 'function' ? t(params) : splitAndSubstitute(t, params);
}

export type Translator = typeof tx;
