import { AsyncLoadingIndicator } from 'fm3/components/AsyncLoadingIndicator';
import { ShowProps, useShow } from 'fm3/hooks/useShow';
import { ComponentType, lazy, ReactElement, Suspense, useMemo } from 'react';

type Props<T extends ComponentType<ShowProps>> = {
  show: boolean;
  factory(): Promise<{ default: T }>;
};

export function AsyncModal({
  show,
  factory,
}: Props<ComponentType<ShowProps>>): ReactElement | null {
  // NOTE dependencies are disabled for simpler parent code
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const Modal = useMemo(() => lazy(factory), []);

  return (
    useShow(show) && (
      <Suspense fallback={<AsyncLoadingIndicator />}>
        <Modal show={show} />
      </Suspense>
    )
  );
}
