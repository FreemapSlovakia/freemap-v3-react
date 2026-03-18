import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { type ReactElement, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { FaEdit, FaKey, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { trackingActions } from '../model/actions.js';
import { Device as DeviceType } from '../model/types.js';

type Props = {
  device: DeviceType;
};

export function MyDevice({ device }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const dateFormat = useDateTimeFormat({
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleModify = useCallback(() => {
    dispatch(trackingActions.modifyDevice(device.id));
  }, [device.id, dispatch]);

  const handleDelete = useCallback(() => {
    dispatch(
      toastsAdd({
        id: 'tracking.deleteDevice',
        messageKey: 'tracking.devices.delete',
        style: 'warning',
        cancelType: [
          trackingActions.modifyDevice.type,
          trackingActions.modifyTrackedDevice.type,
          trackingActions.showAccessTokens.type,
          setActiveModal.type,
        ],
        actions: [
          {
            nameKey: 'general.yes',
            action: trackingActions.deleteDevice(device.id),
            style: 'danger',
          },
          { nameKey: 'general.no' },
        ],
      }),
    );
  }, [device.id, dispatch]);

  const handleShowAccessTokens = useCallback(() => {
    dispatch(trackingActions.showAccessTokens(device.id));
  }, [device.id, dispatch]);

  return (
    <tr>
      <td>{device.name}</td>
      <td>{device.token}</td>
      <td>{device.maxCount}</td>
      <td>
        {typeof device.maxAge === 'number' &&
          `${device.maxAge / 60} ${m?.general.minutes}`}
      </td>
      <td>{dateFormat.format(device.createdAt)}</td>
      <td>
        <LongPressTooltip label={m?.general.modify}>
          {({ props }) => (
            <Button
              size="sm"
              type="button"
              variant="secondary"
              onClick={handleModify}
              {...props}
            >
              <FaEdit />
            </Button>
          )}
        </LongPressTooltip>

        <LongPressTooltip label={m?.tracking.devices.watchTokens}>
          {({ props }) => (
            <Button
              size="sm"
              type="button"
              variant="secondary"
              onClick={handleShowAccessTokens}
              className="ms-1"
              {...props}
            >
              <FaKey />
            </Button>
          )}
        </LongPressTooltip>

        <LongPressTooltip label={m?.general.delete}>
          {({ props }) => (
            <Button
              variant="danger"
              size="sm"
              type="button"
              onClick={handleDelete}
              className="ms-1"
              {...props}
            >
              <FaTimes />
            </Button>
          )}
        </LongPressTooltip>
      </td>
    </tr>
  );
}
