import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { setTool, setActiveModal } from 'fm3/actions/mainActions';

import Navbar from 'react-bootstrap/lib/Navbar';
import Button from 'react-bootstrap/lib/Button';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

function GalleryMenu({ onUpload, onCancel }) {
  return (
    <Navbar.Form>
      <Button onClick={onUpload}><FontAwesomeIcon icon="upload" /> Nahrať</Button>
      {' '}
      <Button onClick={onCancel}><Glyphicon glyph="remove" /> Zavrieť</Button>
    </Navbar.Form>
  );
}

GalleryMenu.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
};

export default connect(
  () => ({}),
  dispatch => ({
    onUpload() {
      dispatch(setActiveModal('gallery-upload'));
    },
    onCancel() {
      dispatch(setTool(null));
    },
  }),
)(GalleryMenu);
