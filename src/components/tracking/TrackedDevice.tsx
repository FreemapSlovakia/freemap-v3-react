import { trackingActions } from 'fm3/actions/trackingActions';
import { useMessages } from 'fm3/l10nInjector';
import { TrackedDevice as TrackedDeviceType } from 'fm3/types/trackingTypes';
import { ReactElement, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import { FaEdit, FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

type Props = {
  device: TrackedDeviceType;
};

export function TrackedDevice({ device }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const language = useSelector((state) => state.l10n.language);

  const dateFormat = new Intl.DateTimeFormat(language, {
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
