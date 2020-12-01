import { useDispatch, useSelector } from 'react-redux';
import React, { ReactElement } from 'react';

import Button from 'react-bootstrap/lib/Button';

import { FontAwesomeIcon } from 'fm3/components/FontAwesomeIcon';
import { trackingActions } from 'fm3/actions/trackingActions';
import { TrackedDevice as TrackedDeviceType } from 'fm3/types/trackingTypes';
import { useTranslator } from 'fm3/l10nInjector';
import { RootState } from 'fm3/storeCreator';

type Props = {
  device: TrackedDeviceType;
};

export function TrackedDevice({ device }: Props): ReactElement {
  const t = useTranslator();

  const dispatch = useDispatch();

  const language = useSelector((state: RootState) => state.l10n.language);

  const dateFormat = new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleModify = React.useCallback(() => {
    dispatch(trackingActions.modifyTrackedDevice(device.id));
  }, [device.id, dispatch]);

  const handleDelete = React.useCallback(() => {
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
          ? `${device.maxAge / 60} ${t('general.minutes')}`
          : ''}
      </td>
      <td>{device.maxCount}</td>
      <td>{device.splitDistance}</td>
      <td>{device.splitDuration}</td>
      <td>
        <Button
          bsSize="small"
          type="button"
          onClick={handleModify}
          title={t('general.modify')}
        >
          <FontAwesomeIcon icon="edit" />
        </Button>{' '}
        <Button
          bsStyle="danger"
          bsSize="small"
          type="button"
          onClick={handleDelete}
          title={t('general.delete')}
        >
          <FontAwesomeIcon icon="close" />
        </Button>
      </td>
    </tr>
  );
}
