import { useMessages } from '@features/l10n/l10nInjector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import type { ReactElement } from 'react';
import { Alert } from 'react-bootstrap';
import { BiWifiOff } from 'react-icons/bi';

/**
 * Heads a dialog that can do nothing without a connection, telling the user why
 * its controls are dead; renders nothing while online.
 */
export function OfflineAlert({
  className,
}: {
  className?: string;
}): ReactElement | null {
  const m = useMessages();

  const online = useOnline();

  if (online) {
    return null;
  }

  return (
    <Alert variant="warning" className={className}>
      <BiWifiOff /> {m?.general.offlineNotice}
    </Alert>
  );
}
