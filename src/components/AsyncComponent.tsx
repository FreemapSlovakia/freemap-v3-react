import { AsyncLoadingIndicator } from 'fm3/components/AsyncLoadingIndicator';
import { ComponentType, lazy, ReactElement, Suspense, useMemo } from 'react';

type Props<T extends ComponentType<any> = ComponentType<any>> = {
  factory(): Promise<{ default: T }>;
};

export function AsyncComponent({ factory }: Props): ReactElement | null {
  // NOTE dependencies are disabled for simpler parent code
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const Component = useMemo(() => lazy(factory), []);

  return (
    <Suspense fallback={<AsyncLoadingIndicator />}>
      <Component />
    </Suspense>
  );
}
