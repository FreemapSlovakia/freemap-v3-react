import { useMessages } from '@features/l10n/l10nInjector.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import { useOnline } from '@shared/hooks/useOnline.js';
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
 * nothing while online.
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
    <GlyphMarker
      hint={hint ?? m?.general.offlineUnavailable}
      className={className}
    >
      <BiWifiOff />
    </GlyphMarker>
  );
}
