import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { StatusIcon } from '@shared/components/StatusIcon.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement, ReactNode } from 'react';
import { Badge } from 'react-bootstrap';
import { FaCloudUploadAlt, FaExclamationCircle, FaSync } from 'react-icons/fa';
import { BLOCKED_MESSAGE_KEYS } from '../model/actions.js';
import { useMyMapsMessages } from '../translations/useMyMapsMessages.js';

type Props = {
  mapId: string;
  /**
   * `icon` for a toolbar, where there is no room for a label and the tooltip
   * carries it; `badge` for a list, where the state reads at a glance.
   */
  as?: 'badge' | 'icon';
  className?: string;
};

/**
 * Where a map's saved changes stand with the server: waiting to be sent, being
 * sent, or refused. Shown wherever a map is named, so the map list and the
 * active-map toolbar can't drift apart on what they report.
 *
 * Renders nothing once there is nothing outstanding — which is the ordinary
 * case, and is why there is no state for "all sent": that is what every map
 * looks like, whether or not it ever had a save waiting.
 */
export function MapSyncStatus({
  mapId,
  as = 'badge',
  className,
}: Props): ReactElement | null {
  const mm = useMyMapsMessages();

  const entry = useAppSelector((state) =>
    state.myMaps.outbox.find((entry) => entry.mapId === mapId),
  );

  const syncing = useAppSelector((state) =>
    state.myMaps.syncingIds.includes(mapId),
  );

  if (!entry) {
    return null;
  }

  // One description of the state, worn either way: the icon and the colour are
  // the badge's own, and the label is its text or, in a toolbar, what a screen
  // reader reads in place of the icon.
  const state: {
    icon: ReactNode;
    color: string;
    label: string | undefined;
    tooltip: ReactNode;
  } = entry.blocked
    ? {
        // Not the triangle: that one is the unsaved-changes marker, and both are
        // up at once while a refused save waits to be settled.
        icon: <FaExclamationCircle />,
        color: 'danger',
        label:
          entry.blocked === 'conflict'
            ? mm?.outboxConflictBadge
            : mm?.outboxBlockedBadge,
        tooltip: mm?.[BLOCKED_MESSAGE_KEYS[entry.blocked]]({
          name: entry.name,
        }),
      }
    : syncing
      ? {
          icon: <FaSync />,
          color: 'info',
          label: mm?.syncing,
          tooltip: mm?.syncing,
        }
      : {
          icon: <FaCloudUploadAlt />,
          color: 'warning',
          label: mm?.unsent,
          tooltip: mm?.unsentTooltip,
        };

  if (as === 'icon') {
    return (
      <StatusIcon
        icon={state.icon}
        color={state.color}
        label={state.label}
        tooltip={state.tooltip}
        className={className}
      />
    );
  }

  return (
    <LongPressTooltip label={state.tooltip}>
      {({ props }) => (
        <span className={className} {...props}>
          <Badge
            bg={state.color}
            text={state.color === 'danger' ? undefined : 'dark'}
          >
            {state.icon} {state.label}
          </Badge>
        </span>
      )}
    </LongPressTooltip>
  );
}
