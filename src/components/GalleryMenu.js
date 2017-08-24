import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { setTool } from 'fm3/actions/mainActions';
import { gallerySetItemForPositionPicking, galleryConfirmPickedPosition, galleryShowFilter, galleryShowUploadModal } from 'fm3/actions/galleryActions';

import Navbar from 'react-bootstrap/lib/Navbar';
import Button from 'react-bootstrap/lib/Button';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import { Static } from 'react-bootstrap/lib/FormControl';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

function GalleryMenu({ onUpload, onCancel, pickingPosition, onPositionConfirm, onPositionCancel, onFilterShow, filterIsActive }) {
  return (
    pickingPosition ?
      <Navbar.Form>
        <Static>Zvoľte pozíciu fotografie</Static>
        {' '}
        <Button onClick={onPositionConfirm}><FontAwesomeIcon icon="check" /> Zvoliť</Button>
        {' '}
        <Button onClick={onPositionCancel}><FontAwesomeIcon icon="times" /> Zrušiť</Button>
      </Navbar.Form>
      :
      <Navbar.Form>
        <Button onClick={onFilterShow} active={filterIsActive}><FontAwesomeIcon icon="filter" /> Nastaviť filter</Button>
        {' '}
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
  onFilterShow: PropTypes.func.isRequired,
  filterIsActive: PropTypes.bool,
};

export default connect(
  state => ({
    pickingPosition: state.gallery.pickingPositionForId !== null,
    filterIsActive: Object.keys(state.gallery.filter).some(key => state.gallery.filter[key]),
  }),
  dispatch => ({
    onUpload() {
      dispatch(galleryShowUploadModal());
    },
    onCancel() {
      dispatch(setTool(null));
    },
    onPositionConfirm() {
      dispatch(galleryConfirmPickedPosition());
    },
    onPositionCancel() {
      dispatch(gallerySetItemForPositionPicking(null));
    },
    onFilterShow() {
      dispatch(galleryShowFilter());
    },
  }),
)(GalleryMenu);
