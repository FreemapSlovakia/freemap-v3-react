import * as React from 'react';
import { translate, splitAndSubstitute } from 'fm3/stringUtils';
import { Subtract } from 'utility-types';
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
  _BaseComponent: React.ComponentType<BaseProps>,
) => {
  // fix for TypeScript issues: https://github.com/piotrwitek/react-redux-typescript-guide/issues/111
  const BaseComponent = _BaseComponent as React.ComponentType<InjectedProps>;

  type HocProps = Subtract<BaseProps, InjectedProps>;
  type TStateProps = ReturnType<typeof mapStateToProps>;

  class Hoc extends React.Component<HocProps> {
    static displayName = `injectL10n(${BaseComponent.name})`;
    static readonly WrappedComponent = BaseComponent;

    render() {
      const { ...restProps } = this.props;
      return <BaseComponent t={tx} {...restProps} />;
    }
  }

  const mapStateToProps = (state: RootState) => ({
    languageCounter: state.l10n.counter, // force applying english language on load
  });

  return connect<TStateProps, {}, HocProps, RootState>(mapStateToProps)(
    Hoc as any, // see https://github.com/piotrwitek/react-redux-typescript-guide/issues/111#issuecomment-524465225
  );
};
