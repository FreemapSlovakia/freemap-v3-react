import { useLazy } from 'fm3/hooks/useLazy';
import { ComponentType, ReactElement, useMemo } from 'react';

type Props<T extends ComponentType<any> = ComponentType<any>> =
  T extends ComponentType<infer P>
    ? {
        factory(): Promise<{ default: T }>;
      } & P
    : never;

export function AsyncComponent<
  T extends ComponentType<any> = ComponentType<any>,
>({ factory, ...rest }: Props<T>): ReactElement | null {
  // NOTE factory dependenct is disabled for simpler parent code
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const Component = useLazy(useMemo(() => factory, [])) as any; // TODO type

  return Component ? <Component {...rest} /> : null;
}
