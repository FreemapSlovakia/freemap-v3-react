import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { setTool } from 'fm3/actions/mainActions';

import Button from 'react-bootstrap/lib/Button';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

function SelectHomeLocationMenu({ onCancel }) {
  return (
    <Button onClick={onCancel}><Glyphicon glyph="remove" /> Zrušiť</Button>
  );
}

SelectHomeLocationMenu.propTypes = {
  onCancel: PropTypes.func.isRequired,
};

export default connect(
  () => ({}),
  dispatch => ({
    onCancel() {
      dispatch(setTool(null));
    },
  }),
)(SelectHomeLocationMenu);
