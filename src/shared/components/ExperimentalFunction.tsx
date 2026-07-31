import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import clsx from 'clsx';
import { FaFlask } from 'react-icons/fa';
import type { IconBaseProps } from 'react-icons/lib';

/**
 * Marks a function as not finished yet.
 *
 * Goes **beside** a `<Button>`, never inside one: the flask carries its own
 * long-press tooltip, and a press that has to mean either "explain the flask" or
 * "press the button" can only get one of them wrong.
 */
export function ExperimentalFunction({ className, ...props }: IconBaseProps) {
  const m = useMessages();

  return (
    <LongPressTooltip label={m?.general.experimentalFunction}>
      {({ props: tooltipProps }) => (
        <span
          {...tooltipProps}
          className={clsx('text-warning fm-cursor-help', className)}
        >
          <FaFlask {...props} />
        </span>
      )}
    </LongPressTooltip>
  );
}
