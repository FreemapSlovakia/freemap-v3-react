import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate, splitAndSubstitute } from 'fm3/stringUtils';

export default function injectL10n(propertyName = 't') {
  return (wrappedComponent) => {
    class L10n extends React.Component {
      static propTypes = {
        translations: PropTypes.shape({}).isRequired,
      };

      tx = (key, params = {}, dflt = '') => splitAndSubstitute(translate(this.props.translations, key, dflt), params);

      render() {
        return React.createElement(wrappedComponent, { [propertyName]: this.tx, ...this.props });
      }
    }

    return connect(state => ({
      translations: state.l10n.translations,
    }))(L10n);
  };
}
