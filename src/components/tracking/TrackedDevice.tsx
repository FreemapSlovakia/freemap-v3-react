import { connect } from 'react-redux';
import * as React from 'react';

import Button from 'react-bootstrap/lib/Button';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { trackingActions } from 'fm3/actions/trackingActions';
import { ITrackedDevice } from 'fm3/types/trackingTypes';
import injectL10n, { Translator } from 'fm3/l10nInjector';
import { compose } from 'redux';

interface Props {
  onDelete: (id: string | number) => void;
  onModify: (id: string | number) => void;
  language: string;
  device: ITrackedDevice;
  t: Translator;
}

const TrackedDevice: React.FC<Props> = ({
  onDelete,
  onModify,
  device,
  language,
  t,
}) => {
  const dateFormat = new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleModify = React.useCallback(() => {
    onModify(device.id);
  }, [device.id, onModify]);

  const handleDelete = React.useCallback(() => {
    onDelete(device.id);
  }, [device.id, onDelete]);

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
      <td>{device.maxAge}</td>
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
};

export default compose(
  injectL10n(),
  connect(
    (state: any) => ({
      language: state.l10n.language,
    }),
    dispatch => ({
      onModify(id) {
        dispatch(trackingActions.modifyTrackedDevice(id));
      },
      onDelete(id) {
        dispatch(trackingActions.deleteTrackedDevice(id));
      },
    }),
  ),
)(TrackedDevice);
