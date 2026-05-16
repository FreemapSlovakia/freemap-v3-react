import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { ActionIcon } from '@mantine/core';
import { MantineLongPressTooltip } from '@shared/components/MantineLongPressTooltip.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { type ReactElement, useCallback } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaEdit, FaKey, FaTimes } from 'react-icons/fa';
import { SiTraccar } from 'react-icons/si';
import QRCode from 'react-qr-code';
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
        color: 'yellow',
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
            color: 'red',
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
      <td>
        <div className="d-flex gap-1 justify-content-between">
          <div>{device.token}</div>

          <OverlayTrigger
            trigger="click"
            rootClose
            overlay={
              <Tooltip>
                <div className="bg-white p-3">
                  <QRCode
                    size={120}
                    value={
                      'https://traccar.freemap.sk?accuracy=high&interval=10&id=' +
                      encodeURIComponent(device.token)
                    }
                  />
                </div>
              </Tooltip>
            }
          >
            <ActionIcon variant="filled" color="gray" size="input-sm">
              <SiTraccar />
            </ActionIcon>
          </OverlayTrigger>
        </div>
      </td>
      <td>{device.maxCount}</td>
      <td>
        {typeof device.maxAge === 'number' &&
          `${device.maxAge / 60} ${m?.general.minutes}`}
      </td>
      <td>{dateFormat.format(device.createdAt)}</td>
      <td>
        <MantineLongPressTooltip label={m?.general.modify}>
          {({ props }) => (
            <ActionIcon
              variant="filled"
              color="gray"
              size="input-sm"
              type="button"
              onClick={handleModify}
              {...props}
            >
              <FaEdit />
            </ActionIcon>
          )}
        </MantineLongPressTooltip>

        <MantineLongPressTooltip label={m?.tracking.devices.watchTokens}>
          {({ props }) => (
            <ActionIcon
              variant="filled"
              color="gray"
              size="input-sm"
              type="button"
              onClick={handleShowAccessTokens}
              className="ms-1"
              {...props}
            >
              <FaKey />
            </ActionIcon>
          )}
        </MantineLongPressTooltip>

        <MantineLongPressTooltip label={m?.general.delete}>
          {({ props }) => (
            <ActionIcon
              variant="filled"
              color="red"
              size="input-sm"
              type="button"
              onClick={handleDelete}
              className="ms-1"
              {...props}
            >
              <FaTimes />
            </ActionIcon>
          )}
        </MantineLongPressTooltip>
      </td>
    </tr>
  );
}
