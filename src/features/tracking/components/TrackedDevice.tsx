import { useMessages } from '@features/l10n/l10nInjector.js';
import { ActionIcon } from '@mantine/core';
import { MantineLongPressTooltip } from '@shared/components/MantineLongPressTooltip.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { type ReactElement, useCallback } from 'react';
import { FaEdit, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { trackingActions } from '../model/actions.js';
import { TrackedDevice as TrackedDeviceType } from '../model/types.js';

type Props = {
  device: TrackedDeviceType;
};

export function TrackedDevice({ device }: Props): ReactElement {
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
    dispatch(trackingActions.modifyTrackedDevice(device));
  }, [device, dispatch]);

  const handleDelete = useCallback(() => {
    dispatch(trackingActions.deleteTrackedDevice(device.token));
  }, [device.token, dispatch]);

  return (
    <tr>
      <td>{device.token}</td>
      <td>
        <div
          style={{
            display: 'inline-block',
            backgroundColor: device.color || '#7239a8',
            // width: `${device.width ?? 4}px`,
            width: '20px',
            height: '20px',
            marginRight: `${14 - (device.width || 4)}px`,
            verticalAlign: 'bottom',
          }}
        />
        {device.label}
      </td>
      <td>{device.fromTime && dateFormat.format(device.fromTime)}</td>
      <td>
        {typeof device.maxAge === 'number'
          ? `${device.maxAge / 60} ${m?.general.minutes}`
          : ''}
      </td>
      <td>{device.maxCount}</td>
      <td>{device.splitDistance}</td>
      <td>{device.splitDuration}</td>
      <td>
        <MantineLongPressTooltip label={m?.general.modify}>
          {({ props }) => (
            <ActionIcon
              variant="filled"
              size="input-sm"
              type="button"
              onClick={handleModify}
              {...props}
            >
              <FaEdit />
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
