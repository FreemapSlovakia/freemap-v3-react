import React from 'react';
import { translate, splitAndSubstitute } from 'fm3/stringUtils';

export default function injectL10n(propertyName = 't') {
  return wrappedComponent => props => React.createElement(wrappedComponent, { [propertyName]: tx, ...props });
}

function tx(key, params = {}, dflt = '') {
  const t = translate(global.translations || {}, key, dflt);
  return typeof t === 'function' ? t(params) : splitAndSubstitute(t, params);
}
