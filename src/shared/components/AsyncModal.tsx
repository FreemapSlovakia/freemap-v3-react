import { useLazy } from '@app/hooks/useLazy.js';
import {
  type ComponentType,
  type ReactElement,
  useMemo,
  useState,
} from 'react';
import { type ShowProps, useShow } from '../hooks/useShow.js';

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

  // A fresh instance per opening: one reopened while the last still fades out
  // would otherwise carry on with its state.
  const [opening, setOpening] = useState({ show, count: 0 });

  if (show !== opening.show) {
    setOpening({ show, count: opening.count + (show ? 1 : 0) });
  }

  return useShow(show) && Modal ? (
    <Modal key={opening.count} show={show} />
  ) : null;
}
