import React, { ReactElement, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';

import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

import { useTranslator } from 'fm3/l10nInjector';

import { setActiveModal } from 'fm3/actions/mainActions';
import {
  trackViewerSetData,
  trackViewerSetTrackUID,
} from 'fm3/actions/trackViewerActions';
import { elevationChartClose } from 'fm3/actions/elevationChartActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

import 'fm3/styles/trackViewer.scss';
import { useGpxDropHandler } from 'fm3/hooks/gpxDropHandlerHook';

export function TrackViewerUploadModal(): ReactElement {
  const t = useTranslator();

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const handleUpload = useCallback(
    (trackGpx: string) => {
      dispatch(trackViewerSetTrackUID(null));
      dispatch(trackViewerSetData({ trackGpx, focus: true }));
      dispatch(setActiveModal(null));
      dispatch(elevationChartClose());
    },
    [dispatch],
  );

  const handleLoadError = useCallback(
    (message: string) => {
      dispatch(
        toastsAdd({
          id: 'trackViewer.loadError',
          message,
          style: 'danger',
          timeout: 5000,
        }),
      );
    },
    [dispatch],
  );

  const handleGpxDrop = useGpxDropHandler(handleUpload, handleLoadError, t);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleGpxDrop,
    accept: '.gpx',
    multiple: false,
  });

  // {activeModal === 'upload-track' && // TODO move to separate component
  return (
    <Modal show onHide={close}>
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
        <Button onClick={close}>
          <Glyphicon glyph="remove" /> {t('general.cancel')} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
