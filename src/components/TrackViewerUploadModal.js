import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Dropzone from 'react-dropzone';

import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

import injectL10n from 'fm3/l10nInjector';

import { setActiveModal } from 'fm3/actions/mainActions';
import { trackViewerSetData, trackViewerSetTrackUID } from 'fm3/actions/trackViewerActions';
import { elevationChartClose } from 'fm3/actions/elevationChartActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

import 'fm3/styles/trackViewer.scss';

class TrackViewerUploadModal extends React.Component {
  static propTypes = {
    onClose: PropTypes.func.isRequired,
    onLoadError: PropTypes.func.isRequired,
    onUpload: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  }

  handleFileDrop = (acceptedFiles, rejectedFiles) => {
    if (acceptedFiles.length) {
      const reader = new FileReader();
      reader.readAsText(acceptedFiles[0], 'UTF-8');
      reader.onload = (event) => {
        this.props.onUpload(event.target.result);
      };

      reader.onerror = (e) => {
        this.props.onLoadError(`Nepodarilo sa spracovať súbor: ${e && e.message}`);
      };
    }

    if (rejectedFiles.length) {
      this.props.onLoadError('Nesprávny formát súboru: Nahraný súbor musí mať príponu .gpx');
    }
  }

  render() {
    const { onClose, t } = this.props;

    // {activeModal === 'upload-track' && // TODO move to separate component
    return (
      <Modal show onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>{t('trackViewer.uploadModal.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Dropzone onDrop={this.handleFileDrop} multiple={false} accept=".gpx" className="dropzone" disablePreview>
            {t('trackViewer.uploadModal.drop')}
          </Dropzone>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onClose}>
            <Glyphicon glyph="remove" /> {t('general.cancel')}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default compose(
  injectL10n(),
  connect(
    () => ({
    }),
    dispatch => ({
      onClose() {
        dispatch(setActiveModal(null));
      },
      onUpload(trackGpx) {
        dispatch(trackViewerSetTrackUID(null));
        dispatch(trackViewerSetData({ trackGpx }));
        dispatch(setActiveModal(null));
        dispatch(elevationChartClose());
      },
      onLoadError(message) {
        dispatch(toastsAdd({
          collapseKey: 'trackViewer.loadError',
          message,
          style: 'danger',
          timeout: 5000,
        }));
      },
    }),
  ),
)(TrackViewerUploadModal);
