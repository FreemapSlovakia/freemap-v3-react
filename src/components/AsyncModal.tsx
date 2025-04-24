import { ComponentType, ReactElement, useMemo } from 'react';
import { useLazy } from '../hooks/useLazy.js';
import { ShowProps, useShow } from '../hooks/useShow.js';

type Props<T extends ComponentType<ShowProps>> = {
  show: boolean;
  factory: () => Promise<{ default: T }>;
};

export function AsyncModal({
  show,
  factory,
}: Props<ComponentType<ShowProps>>): ReactElement | null {
  const Modal = useLazy(
    useMemo(() => factory, [factory]),
    show,
  );

  return useShow(show) && Modal ? <Modal show={show} /> : null;
}
