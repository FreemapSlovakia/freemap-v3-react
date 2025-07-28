import { FaFlask } from 'react-icons/fa';
import { IconBaseProps } from 'react-icons/lib';
import { useMessages } from '../l10nInjector.js';

export function ExperimentalFunction({ className, ...props }: IconBaseProps) {
  const m = useMessages();

  return (
    <FaFlask
      title={m?.general.experimentalFunction}
      {...props}
      className={'text-warning ' + (className ?? '')}
    />
  );
}
