import { connect } from 'react-redux';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap/lib/Button';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import {
  trackingModifyDevice,
  trackingDeleteDevice,
  trackingShowAccessTokens,
  trackingView,
} from 'fm3/actions/trackingActions';
import { setActiveModal } from 'fm3/actions/mainActions';

function Device({
  onDelete,
  onModify,
  device,
  language,
  onShowAccessTokens,
  onView,
}) {
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

  const handleShowAccessTokens = useCallback(() => {
    onShowAccessTokens(device.id);
  }, [device.id, onShowAccessTokens]);

  const handleView = useCallback(() => {
    onView(device.id);
  }, [device.id, onView]);

  return (
    <tr>
      <td>{device.name}</td>
      <td>
        {device.token}
        <OverlayTrigger
          trigger={['hover', 'focus']}
          placement="right"
          overlay={
            <Tooltip id={device.token}>
              {process.env.API_URL}/tracking/track/{device.token}
            </Tooltip>
          }
        >
          <FontAwesomeIcon icon="question-circle-o" />
        </OverlayTrigger>
      </td>
      <td>{device.maxCount}</td>
      <td>{device.maxAge}</td>
      <td>{dateFormat.format(device.createdAt)}</td>
      <td>
        <Button
          bsSize="small"
          type="button"
          onClick={handleModify}
          title="edit"
        >
          <FontAwesomeIcon icon="edit" />
        </Button>{' '}
        <Button
          bsSize="small"
          type="button"
          bsStyle="primary"
          onClick={handleShowAccessTokens}
          title="watch tokens"
        >
          <FontAwesomeIcon icon="key" />
        </Button>{' '}
        <Button
          bsSize="small"
          type="button"
          onClick={handleView}
          title="watch privately"
        >
          <FontAwesomeIcon icon="eye" />
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

Device.propTypes = {
  onDelete: PropTypes.func.isRequired,
  onModify: PropTypes.func.isRequired,
  onShowAccessTokens: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
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
    onView(id) {
      dispatch(trackingView(id));
      dispatch(setActiveModal(null));
    },
  }),
)(Device);
