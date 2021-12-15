import { useLazy } from 'fm3/hooks/useLazy';
import { ComponentType, ReactElement } from 'react';

type Props<T extends ComponentType<any> = ComponentType<any>> =
  T extends ComponentType<infer P>
    ? {
        factory: () => Promise<{ default: T }>;
      } & P
    : never;

export function AsyncComponent<
  T extends ComponentType<any> = ComponentType<any>,
>({ factory, ...rest }: Props<T>): ReactElement | null {
  const Component = useLazy(factory) as any; // TODO type

  return Component ? <Component {...rest} /> : null;
}
