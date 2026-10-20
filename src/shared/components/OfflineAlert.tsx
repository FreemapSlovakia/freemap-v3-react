import { Text } from '@features/l10n/Text.js';
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
  const online = useOnline();

  if (online) {
    return null;
  }

  return (
    <Alert variant="warning" className={className}>
      <BiWifiOff /> <Text k="general.offlineNotice" />
    </Alert>
  );
}
