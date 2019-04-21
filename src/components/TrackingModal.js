import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';

import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';

import FontAwesomeIcon from 'fm3/components/FontAwesomeIcon';

import injectL10n from 'fm3/l10nInjector';
import { setActiveModal } from 'fm3/actions/mainActions';

export function TrackingModal({ onModalClose, t }) {
  return (
    <Modal show onHide={onModalClose}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FontAwesomeIcon icon="code" /> {t('more.embedMap')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        TODO
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onModalClose}>
          <Glyphicon glyph="remove" /> {t('general.close')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

TrackingModal.propTypes = {
  onModalClose: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default compose(
  injectL10n(),
  connect(
    null,
    dispatch => ({
      onModalClose() {
        dispatch(setActiveModal(null));
      },
    }),
  ),
)(TrackingModal);
