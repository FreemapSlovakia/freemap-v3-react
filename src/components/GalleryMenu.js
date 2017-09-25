import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { gallerySetItemForPositionPicking, galleryConfirmPickedPosition, galleryShowFilter, galleryShowUploadModal, galleryList } from 'fm3/actions/galleryActions';

import Panel from 'react-bootstrap/lib/Panel';
import Button from 'react-bootstrap/lib/Button';
import Form from 'react-bootstrap/lib/Form';
import FormControl, { Static } from 'react-bootstrap/lib/FormControl';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

function GalleryMenu({ onUpload, pickingPosition, onPositionConfirm, onPositionCancel, onFilterShow, filterIsActive, onOrderChange }) {
  return (
    pickingPosition ?
      <Panel>
        <Static>Zvoľte pozíciu fotografie</Static>
        {' '}
        <Button onClick={onPositionConfirm}><FontAwesomeIcon icon="check" /> Zvoliť</Button>
        {' '}
        <Button onClick={onPositionCancel}><FontAwesomeIcon icon="times" /> Zrušiť</Button>
      </Panel>
      :
      <Panel>
        <Form inline>
          <Button onClick={onFilterShow} active={filterIsActive}><FontAwesomeIcon icon="filter" /> Filter</Button>
          {' '}
          <FormControl componentClass="select" value="" onChange={onOrderChange}>
            <option value="" disabled>Fotky podľa…</option>
            <option value="+createdAt">▲ dátumu nahratia</option>
            <option value="-createdAt">▼ dátumu nahratia</option>
            <option value="+takenAt">▲ dátumu odfotenia</option>
            <option value="-takenAt">▼ dátumu odfotenia</option>
            <option value="+rating">▲ hodnotenia</option>
            <option value="-rating">▼ hodnotenia</option>
          </FormControl>
          {' '}
          <Button onClick={onUpload}><FontAwesomeIcon icon="upload" /> Nahrať</Button>
        </Form>
      </Panel>
  );
}

GalleryMenu.propTypes = {
  pickingPosition: PropTypes.bool,
  onPositionConfirm: PropTypes.func.isRequired,
  onPositionCancel: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
  onFilterShow: PropTypes.func.isRequired,
  onOrderChange: PropTypes.func.isRequired,
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
    onPositionConfirm() {
      dispatch(galleryConfirmPickedPosition());
    },
    onPositionCancel() {
      dispatch(gallerySetItemForPositionPicking(null));
    },
    onFilterShow() {
      dispatch(galleryShowFilter());
    },
    onOrderChange(e) {
      dispatch(galleryList(e.target.value));
    },
  }),
)(GalleryMenu);
