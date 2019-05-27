import { connect } from 'react-redux';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap/lib/Button';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import {
  trackingDeleteTrackedDevice,
  trackingModifyTrackedDevice,
} from 'fm3/actions/trackingActions';

function TrackedDevice({ onDelete, onModify, device, language }) {
  const dateFormat = new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleModify = useCallback(() => {
    onModify(device.id);
  }, [device.id, onModify]);

  const handleDelete = useCallback(() => {
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
          title="modify"
        >
          <FontAwesomeIcon icon="edit" />
        </Button>{' '}
        <Button
          bsStyle="danger"
          bsSize="small"
          type="button"
          onClick={handleDelete}
          title="delete"
        >
          <FontAwesomeIcon icon="close" />
        </Button>
      </td>
    </tr>
  );
}

TrackedDevice.propTypes = {
  onDelete: PropTypes.func.isRequired,
  onModify: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired,
  device: PropTypes.shape({}).isRequired,
};

export default connect(
  state => ({
    language: state.l10n.language,
  }),
  dispatch => ({
    onModify(id) {
      dispatch(trackingModifyTrackedDevice(id));
    },
    onDelete(id) {
      dispatch(trackingDeleteTrackedDevice(id));
    },
  }),
)(TrackedDevice);
