import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Alert from 'react-bootstrap/lib/Alert';

import { withTranslator, Translator } from 'fm3/l10nInjector';

import { setActiveModal } from 'fm3/actions/mainActions';

import 'fm3/styles/trackViewer.scss';
import { RootAction } from 'fm3/actions';
import { RootState } from 'fm3/storeCreator';

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> & {
    t: Translator;
  };

const TrackViewerShareModal: React.FC<Props> = ({ onClose, trackUID, t }) => {
  const shareURL = trackUID
    ? `${window.location.origin}/?track-uid=${trackUID}`
    : '';

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
          <Glyphicon glyph="remove" /> {t('general.close')} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const mapStateToProps = (state: RootState) => ({
  trackUID: state.trackViewer.trackUID,
});

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onClose() {
    dispatch(setActiveModal(null));
  },
});
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslator(TrackViewerShareModal));
