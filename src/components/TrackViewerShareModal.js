import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';

import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Alert from 'react-bootstrap/lib/Alert';

import injectL10n from 'fm3/l10nInjector';

import { setActiveModal } from 'fm3/actions/mainActions';

import 'fm3/styles/trackViewer.scss';

function TrackViewerShareModal({ onClose, trackUID, t }) {
  const shareURL = trackUID ? `${window.location.origin}/?track-uid=${trackUID}` : '';

  return (
    <Modal show onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{t('trackViewer.shareModal.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{t('trackViewer.shareModal.description')}</p>
        <Alert>
          <a href={shareURL}>{shareURL}</a>
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}>
          <Glyphicon glyph="remove" /> {t('general.close')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

TrackViewerShareModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  trackUID: PropTypes.string,
  t: PropTypes.func.isRequired,
};

export default compose(
  injectL10n(),
  connect(
    state => ({
      trackUID: state.trackViewer.trackUID,
    }),
    dispatch => ({
      onClose() {
        dispatch(setActiveModal(null));
      },
    }),
  ),
)(TrackViewerShareModal);
