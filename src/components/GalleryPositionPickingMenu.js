import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Panel from 'react-bootstrap/lib/Panel';

import { gallerySetItemForPositionPicking, galleryConfirmPickedPosition } from 'fm3/actions/galleryActions';

import Button from 'react-bootstrap/lib/Button';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

function GalleryPositionPickingMenu({ pickingPosition, onPositionConfirm, onPositionCancel }) {
  if (!pickingPosition) {
    return null;
  }

  return (
    <Panel className="fm-toolbar">
      <span>Zvoľte pozíciu fotografie</span>
      {' '}
      <Button onClick={onPositionConfirm}>
        <FontAwesomeIcon icon="check" />
        <span className="hidden-xs"> Zvoliť</span>
      </Button>
      {' '}
      <Button onClick={onPositionCancel}>
        <FontAwesomeIcon icon="times" />
        <span className="hidden-xs"> Zrušiť</span>
      </Button>
    </Panel>
  );
}

GalleryPositionPickingMenu.propTypes = {
  pickingPosition: PropTypes.bool,
  onPositionConfirm: PropTypes.func.isRequired,
  onPositionCancel: PropTypes.func.isRequired,
};

export default connect(
  state => ({
    pickingPosition: state.gallery.pickingPositionForId !== null,
  }),
  dispatch => ({
    onPositionConfirm() {
      dispatch(galleryConfirmPickedPosition());
    },
    onPositionCancel() {
      dispatch(gallerySetItemForPositionPicking(null));
    },
  }),
)(GalleryPositionPickingMenu);
