import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import clsx from 'clsx';
import type { ReactElement, ReactNode } from 'react';
import { BiWifiOff } from 'react-icons/bi';

type Props = {
  className?: string;
  /** Replaces the generic "needs a connection" wording. */
  hint?: ReactNode;
  /**
   * Overrides the live check, for a mark that answers for a read that already
   * failed on the connection — it stands until that reading is taken again,
   * whatever the connection does meanwhile.
   */
  offline?: boolean;
};

/**
 * Says that a control needs a connection, with the reason in a tooltip; renders
 * nothing while online. As in `PremiumGem`, `pointerEvents: 'initial'` keeps it
 * hoverable inside a disabled dropdown item, which takes pointer events away
 * from its content.
 */
export function OfflineBadge({
  className,
  hint,
  offline,
}: Props): ReactElement | null {
  const m = useMessages();

  const online = useOnline();

  if (!(offline ?? !online)) {
    return null;
  }

  return (
    <LongPressTooltip label={hint ?? m?.general.offlineUnavailable}>
      {({ props }) => (
        <span
          {...props}
          className={clsx('text-warning', className)}
          style={{ pointerEvents: 'initial', cursor: 'help' }}
        >
          <BiWifiOff />
        </span>
      )}
    </LongPressTooltip>
  );
}
