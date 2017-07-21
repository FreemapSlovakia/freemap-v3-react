import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { setTool, setActiveModal } from 'fm3/actions/mainActions';
import { galleryPickItemPosition } from 'fm3/actions/galleryActions';

import Navbar from 'react-bootstrap/lib/Navbar';
import Button from 'react-bootstrap/lib/Button';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

function GalleryMenu({ onUpload, onCancel, pickingPosition, onPositionConfirm, onPositionCancel }) {
  return (
    pickingPosition ?
      <Navbar.Form>
        <Button onClick={onPositionConfirm}><FontAwesomeIcon icon="check" /> Zvoliť</Button>
        {' '}
        <Button onClick={onPositionCancel}><FontAwesomeIcon icon="times" /> Zrušiť</Button>
      </Navbar.Form>
      :
      <Navbar.Form>
        <Button onClick={onUpload}><FontAwesomeIcon icon="upload" /> Nahrať</Button>
        {' '}
        <Button onClick={onCancel}><Glyphicon glyph="remove" /> Zavrieť</Button>
      </Navbar.Form>
  );
}

GalleryMenu.propTypes = {
  pickingPosition: PropTypes.bool,
  onPositionConfirm: PropTypes.func.isRequired,
  onPositionCancel: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
};

export default connect(
  state => ({
    pickingPosition: state.gallery.pickingPositionForId !== null,
  }),
  dispatch => ({
    onUpload() {
      dispatch(setActiveModal('gallery-upload'));
    },
    onCancel() {
      dispatch(setTool(null));
    },
    onPositionConfirm() {
      // TODO
    },
    onPositionCancel() {
      dispatch(galleryPickItemPosition(null));
    },
  }),
)(GalleryMenu);
