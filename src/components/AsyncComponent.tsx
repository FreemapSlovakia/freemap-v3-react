import { useLazy } from 'fm3/hooks/useLazy';
import {
  ComponentType,
  ReactElement,
  FunctionComponent,
  ComponentClass,
  Attributes,
} from 'react';

type Factory<T> = () => Promise<{ default: T }>;

// This madness has been created with help of ChatGPT: https://chatgpt.com/share/671bee06-98f0-8007-9924-8c153485614e

/* Overload for FunctionComponent with specific props */
export function AsyncComponent<P>(
  props: { factory: Factory<FunctionComponent<P>> } & P & Attributes,
): ReactElement | null;

/* Overload for ComponentClass with specific props */
export function AsyncComponent<P>(
  props: { factory: Factory<ComponentClass<P>> } & P & Attributes,
): ReactElement | null;

/* Implementation */
export function AsyncComponent<P>(
  props: { factory: Factory<ComponentType<P>> } & P & Attributes,
): ReactElement | null {
  const { factory, ...rest } = props;

  const Component = useLazy(factory);

  return !Component ? null : (
    <Component {...(rest as unknown as P & Attributes)} />
  );
}
