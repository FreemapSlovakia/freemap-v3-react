import { useLazyComponent } from 'fm3/hooks/useLazyComponent';
import { ShowProps, useShow } from 'fm3/hooks/useShow';
import { ComponentType, ReactElement } from 'react';

type Props<T extends ComponentType<ShowProps>> = {
  show: boolean;
  factory(): Promise<{ default: T }>;
};

export function AsyncModal({
  show,
  factory,
}: Props<ComponentType<ShowProps>>): ReactElement | null {
  const Modal = useLazyComponent(factory, show);

  return useShow(show) && Modal ? <Modal show={show} /> : null;
}
