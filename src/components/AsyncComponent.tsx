import { useLazy } from 'fm3/hooks/useLazy';
import { ComponentType, ReactElement, useMemo } from 'react';

type Props<T extends ComponentType<any> = ComponentType<any>> = {
  factory(): Promise<{ default: T }>;
};

export function AsyncComponent({ factory }: Props): ReactElement | null {
  // NOTE factory dependenct is disabled for simpler parent code
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const Component = useLazy(useMemo(() => factory, []));

  return Component ? <Component /> : null;
}
