import React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { useDropzone } from 'react-dropzone';

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
import { useGpxDropHandler } from 'fm3/hooks/gpxDropHandlerHook';

type Props = ReturnType<typeof mapDispatchToProps> & {
  t: Translator;
};

const TrackViewerUploadModalInt: React.FC<Props> = ({
  onUpload,
  onLoadError,
  onClose,
  t,
}) => {
  const handleGpxDrop = useGpxDropHandler(onUpload, onLoadError);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleGpxDrop,
    accept: '.gpx',
    multiple: false,
  });

  // {activeModal === 'upload-track' && // TODO move to separate component
  return (
    <Modal show onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{t('trackViewer.uploadModal.title')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div
          {...getRootProps()}
          className={`dropzone${isDragActive ? ' dropzone-dropping' : ''}`}
        >
          <input {...getInputProps()} />
          {t('trackViewer.uploadModal.drop')}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose}>
          <Glyphicon glyph="remove" /> {t('general.cancel')} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

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

export const TrackViewerUploadModal = connect(
  null,
  mapDispatchToProps,
)(withTranslator(TrackViewerUploadModalInt));
