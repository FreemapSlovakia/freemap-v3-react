import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Panel from 'react-bootstrap/lib/Panel';

import {
  gallerySetItemForPositionPicking,
  galleryConfirmPickedPosition,
} from 'fm3/actions/galleryActions';

import Button from 'react-bootstrap/lib/Button';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';
import injectL10n from 'fm3/l10nInjector';

function GalleryPositionPickingMenu({
  pickingPosition,
  onPositionConfirm,
  onPositionCancel,
  t,
}) {
  if (!pickingPosition) {
    return null;
  }

  return (
    <Panel className="fm-toolbar">
      {t('gallery.locationPicking.title')}{' '}
      <Button onClick={onPositionConfirm}>
        <FontAwesomeIcon icon="check" />
        <span className="hidden-xs"> {t('general.ok')}</span>
      </Button>{' '}
      <Button onClick={onPositionCancel}>
        <FontAwesomeIcon icon="times" />
        <span className="hidden-xs"> {t('general.cancel')}</span>
      </Button>
    </Panel>
  );
}

GalleryPositionPickingMenu.propTypes = {
  pickingPosition: PropTypes.bool,
  onPositionConfirm: PropTypes.func.isRequired,
  onPositionCancel: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default compose(
  injectL10n(),
  connect(
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
  ),
)(GalleryPositionPickingMenu);
