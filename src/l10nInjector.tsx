import React from 'react';
import { translate, splitAndSubstitute } from 'fm3/stringUtils';
import { Diff } from 'utility-types';
import { connect } from 'react-redux';
import { RootState } from './storeCreator';

function tx(key: string, params: { [key: string]: unknown } = {}, dflt = '') {
  const t = translate(window.translations, key, dflt);
  return typeof t === 'function' ? t(params) : splitAndSubstitute(t, params);
}

export type Translator = typeof tx;

interface InjectedProps {
  t: Translator;
}

// eslint-disable-next-line
export const withTranslator = <BaseProps extends InjectedProps>(
  BaseComponent: React.ComponentType<BaseProps>,
) => {
  const mapStateToProps = (state: RootState) => ({
    languageCounter: state.l10n.counter, // force applying english language on load
  });

  type HocProps = ReturnType<typeof mapStateToProps>;

  class Hoc extends React.Component<HocProps> {
    static displayName = `injectL10n(${BaseComponent.name})`;
    static readonly WrappedComponent = BaseComponent;

    render() {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { languageCounter, ...restProps } = this.props;

      return <BaseComponent {...(restProps as BaseProps)} t={tx} />;
    }
  }

  type OwnProps = Diff<BaseProps, InjectedProps>;

  return connect<HocProps, undefined, OwnProps, RootState>(mapStateToProps)(
    Hoc,
  );
};
