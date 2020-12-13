import { trackingActions } from 'fm3/actions/trackingActions';
import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { useMessages } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';
import { TrackedDevice as TrackedDeviceType } from 'fm3/types/trackingTypes';
import { ReactElement, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import { useDispatch, useSelector } from 'react-redux';

type Props = {
  device: TrackedDeviceType;
};

export function TrackedDevice({ device }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const language = useSelector((state: RootState) => state.l10n.language);

  const dateFormat = new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleModify = useCallback(() => {
    dispatch(trackingActions.modifyTrackedDevice(device.id));
  }, [device.id, dispatch]);

  const handleDelete = useCallback(() => {
    dispatch(trackingActions.deleteTrackedDevice(device.id));
  }, [device.id, dispatch]);

  return (
    <tr>
      <td>
        <div
          style={{
            display: 'inline-block',
            backgroundColor: device.color || '#7239a8',
            width: `${device.width}px`,
            height: '15px',
            marginRight: `${14 - (device.width || 4)}px`,
          }}
        />
        {device.id}
      </td>
      <td>{device.label}</td>
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
          <FontAwesomeIcon icon="edit" />
        </Button>{' '}
        <Button
          variant="danger"
          size="sm"
          type="button"
          onClick={handleDelete}
          title={m?.general.delete}
        >
          <FontAwesomeIcon icon="close" />
        </Button>
      </td>
    </tr>
  );
}
