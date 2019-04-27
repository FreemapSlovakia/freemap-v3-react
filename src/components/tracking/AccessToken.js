import { connect } from 'react-redux';
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap/lib/Button';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import { trackingDeleteAccessToken, trackingModifyAccessToken } from 'fm3/actions/trackingActions';

function AccessToken({ onDelete, onModify, accessToken, language }) {
  const dateFormat = new Intl.DateTimeFormat(language, {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const handleModify = useCallback(() => {
    onModify(accessToken.id);
  }, [accessToken.id, onModify]);

  const handleDelete = useCallback(() => {
    onDelete(accessToken.id);
  }, [accessToken.id, onDelete]);

  return (
    <tr>
      <td>{accessToken.token}</td>
      <td>{dateFormat.format(accessToken.createdAt)}</td>
      <td>{accessToken.timeFrom && dateFormat.format(accessToken.timeFrom)}</td>
      <td>{accessToken.timeTo && dateFormat.format(accessToken.timeTo)}</td>
      <td>{accessToken.listed ? 'listed' : 'hidden'}</td>
      <td>{accessToken.note}</td>
      <td>
        <Button bsSize="small" type="button" onClick={handleModify}>
          <FontAwesomeIcon icon="edit" />
        </Button>
        {' '}
        <Button bsStyle="danger" bsSize="small" type="button" onClick={handleDelete}>
          <FontAwesomeIcon icon="close" />
        </Button>
      </td>
    </tr>
  );
}

AccessToken.propTypes = {
  onDelete: PropTypes.func.isRequired,
  onModify: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired,
  accessToken: PropTypes.shape({}).isRequired,
};

export default connect(
  state => ({
    language: state.l10n.language,
  }),
  dispatch => ({
    onModify(id) {
      dispatch(trackingModifyAccessToken(id));
    },
    onDelete(id) {
      dispatch(trackingDeleteAccessToken(id));
    },
  }),
)(AccessToken);
