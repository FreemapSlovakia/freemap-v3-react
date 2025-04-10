import { ReactElement, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { FaEdit, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { trackingActions } from '../../actions/trackingActions.js';
import { useDateTimeFormat } from '../../hooks/useDateTimeFormat.js';
import { useMessages } from '../../l10nInjector.js';
import { TrackedDevice as TrackedDeviceType } from '../../types/trackingTypes.js';

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
    dispatch(trackingActions.modifyTrackedDevice(device.token));
  }, [device.token, dispatch]);

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
        <Button
          size="sm"
          type="button"
          onClick={handleModify}
          title={m?.general.modify}
        >
          <FaEdit />
        </Button>{' '}
        <Button
          variant="danger"
          size="sm"
          type="button"
          onClick={handleDelete}
          title={m?.general.delete}
        >
          <FaTimes />
        </Button>
      </td>
    </tr>
  );
}
