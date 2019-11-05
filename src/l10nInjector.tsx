import * as React from 'react';
import { translate, splitAndSubstitute } from 'fm3/stringUtils';
import { Diff } from 'utility-types';
import { connect } from 'react-redux';
import { RootState } from './storeCreator';

function tx(key: string, params: { [key: string]: any } = {}, dflt = '') {
  const t = translate(window.translations, key, dflt);
  return typeof t === 'function' ? t(params) : splitAndSubstitute(t, params);
}

export type Translator = typeof tx;

interface InjectedProps {
  t: Translator;
}

export const withTranslator = <BaseProps extends InjectedProps>(
  BaseComponent: React.ComponentType<BaseProps>,
) => {
  type HocProps = Diff<BaseProps, InjectedProps>;

  class Hoc extends React.Component<InjectedProps> {
    static displayName = `injectL10n(${BaseComponent.name})`;
    static readonly WrappedComponent = BaseComponent;

    render() {
      const { ...restProps } = this.props;
      return <BaseComponent t={tx} {...(restProps as BaseProps)} />;
    }
  }

  const mapStateToProps = (state: RootState) => ({
    languageCounter: state.l10n.counter, // force applying english language on load
  });

  return connect<ReturnType<typeof mapStateToProps>, {}, HocProps, RootState>(
    mapStateToProps,
  )(Hoc);
};
