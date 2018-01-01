import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

export default function injectL10n(propertyName = 't') {
  return (wrappedComponent) => {
    class L10n extends React.Component {
      static propTypes = {
        translations: PropTypes.shape({}).isRequired,
      };

      translate = (key, dflt = '_') =>
        (key && key.split('.').reduce((a, b) => (typeof a === 'object' && b in a ? a[b] : dflt), this.props.translations));

      render() {
        return React.createElement(wrappedComponent, { [propertyName]: this.translate, ...this.props });
      }
    }

    return connect(state => ({
      translations: state.l10n.translations,
    }))(L10n);
  };
}
