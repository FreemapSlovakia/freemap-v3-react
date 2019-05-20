import { connect } from 'react-redux';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap/lib/Button';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { trackingModifyDevice, trackingDeleteDevice, trackingShowAccessTokens } from 'fm3/actions/trackingActions';

function Device({ onDelete, onModify, device, language, onShowAccessTokens }) {
  const dateFormat = new Intl.DateTimeFormat(language, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const handleModify = useCallback(() => {
    onModify(device.id);
  }, [device.id, onModify]);

  const handleDelete = useCallback(() => {
    onDelete(device.id);
  }, [device.id, onDelete]);

  const handleShowAccessTokens = useCallback(() => {
    onShowAccessTokens(device.id);
  }, [device.id, onShowAccessTokens]);

  return (
    <tr>
      <td>{device.name}</td>
      <td>{device.token}</td>
      <td>{device.maxCount}</td>
      <td>{device.maxAge}</td>
      <td>{dateFormat.format(device.createdAt)}</td>
      <td>
        <Button bsSize="small" type="button" onClick={handleModify}>
          <FontAwesomeIcon icon="edit" />
        </Button>
        {' '}
        <Button bsSize="small" type="button" onClick={handleShowAccessTokens}>
          <FontAwesomeIcon icon="key" />
        </Button>
        {' '}
        <Button bsStyle="danger" bsSize="small" type="button" onClick={handleDelete}>
          <FontAwesomeIcon icon="close" />
        </Button>
      </td>
    </tr>
  );
}

Device.propTypes = {
  onDelete: PropTypes.func.isRequired,
  onModify: PropTypes.func.isRequired,
  onShowAccessTokens: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired,
  device: PropTypes.shape({}).isRequired,
};

export default connect(
  state => ({
    language: state.l10n.language,
  }),
  dispatch => ({
    onModify(id) {
      dispatch(trackingModifyDevice(id));
    },
    onDelete(id) {
      dispatch(trackingDeleteDevice(id));
    },
    onShowAccessTokens(id) {
      dispatch(trackingShowAccessTokens(id));
    },
  }),
)(Device);
