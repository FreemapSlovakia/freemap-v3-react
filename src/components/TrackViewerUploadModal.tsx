import React from 'react';
import { connect } from 'react-redux';
import { compose, Dispatch } from 'redux';
import Dropzone from 'react-dropzone';

import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

import { withTranslator, Translator } from 'fm3/l10nInjector';

import { setActiveModal } from 'fm3/actions/mainActions';
import {
  trackViewerSetData,
  trackViewerSetTrackUID,
} from 'fm3/actions/trackViewerActions';
import { elevationChartClose } from 'fm3/actions/elevationChartActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

import 'fm3/styles/trackViewer.scss';
import { RootAction } from 'fm3/actions';

type Props = ReturnType<typeof mapDispatchToProps> & {
  t: Translator;
};

class TrackViewerUploadModal extends React.Component<Props> {
  handleFileDrop = (acceptedFiles: File[], rejectedFiles: File[]) => {
    const { onUpload, onLoadError } = this.props;

    if (acceptedFiles.length) {
      const reader = new FileReader();
      reader.readAsText(acceptedFiles[0], 'UTF-8');
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUpload(reader.result);
        } else {
          onLoadError(`Nepodarilo sa načítať súbor.`); // TODO translate
        }
      };

      reader.onerror = () => {
        onLoadError(`Nepodarilo sa načítať súbor.`); // TODO translate
        reader.abort();
      };
    }

    if (rejectedFiles.length) {
      onLoadError(
        'Nesprávny formát súboru: Nahraný súbor musí mať príponu .gpx', // TODO translate
      );
    }
  };

  render() {
    const { onClose, t } = this.props;

    // {activeModal === 'upload-track' && // TODO move to separate component
    return (
      <Modal show onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>{t('trackViewer.uploadModal.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Dropzone
            onDrop={this.handleFileDrop}
            multiple={false}
            accept=".gpx"
            // className="dropzone"
            // disablePreview
          >
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps()} className="dropzone">
                <input {...getInputProps()} />
                {t('trackViewer.uploadModal.drop')}
              </div>
            )}
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

const mapDispatchToProps = (dispatch: Dispatch<RootAction>) => ({
  onClose() {
    dispatch(setActiveModal(null));
  },
  onUpload(trackGpx: string) {
    dispatch(trackViewerSetTrackUID(null));
    dispatch(trackViewerSetData({ trackGpx }));
    dispatch(setActiveModal(null));
    dispatch(elevationChartClose());
  },
  onLoadError(message: string) {
    dispatch(
      toastsAdd({
        collapseKey: 'trackViewer.loadError',
        message,
        style: 'danger',
        timeout: 5000,
      }),
    );
  },
});

export default compose(
  withTranslator,
  connect(
    null,
    mapDispatchToProps,
  ),
)(TrackViewerUploadModal);
