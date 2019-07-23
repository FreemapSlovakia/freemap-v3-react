import * as React from 'react';
import { translate, splitAndSubstitute } from 'fm3/stringUtils';
import { Subtract } from 'utility-types';

function tx(key: string, params: { [key: string]: any } = {}, dflt = '') {
  const t = translate(global.translations || {}, key, dflt);
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

  type HocProps = Subtract<BaseProps, InjectedProps> & {
    // here you can extend hoc with new props
    initialCount?: number;
  };

  return class Hoc extends React.Component<HocProps> {
    static displayName = `injectL10n(${BaseComponent.name})`;
    static readonly WrappedComponent = BaseComponent;

    render() {
      const { ...restProps } = this.props;
      return <BaseComponent t={tx} {...restProps} />;

      // return connect((state: RootState) => ({
      //   language: state.l10n.language,
      // }))();
    }
  };
};

// TODO types
// export default function withTranslator {
//   return wrappedComponent => {
//     const x = props =>
//       React.createElement(wrappedComponent, { t: tx, ...props });

//     return connect((state: any) => ({
//       language: state.l10n.language,
//     }))(x);
//   };
// }
