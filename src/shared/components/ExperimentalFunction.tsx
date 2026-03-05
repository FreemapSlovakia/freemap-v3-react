import { useMessages } from '@features/l10n/l10nInjector.js';
import clsx from 'clsx';
import { FaFlask } from 'react-icons/fa';
import { IconBaseProps } from 'react-icons/lib';

export function ExperimentalFunction({ className, ...props }: IconBaseProps) {
  const m = useMessages();

  return (
    <FaFlask
      title={m?.general.experimentalFunction}
      {...props}
      className={clsx('text-warning', className)}
    />
  );
}
