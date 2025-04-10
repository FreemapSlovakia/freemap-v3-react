import { ReactElement, useCallback } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { elevationChartClose } from '../actions/elevationChartActions.js';
import { setActiveModal } from '../actions/mainActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import {
  trackViewerSetData,
  trackViewerSetTrackUID,
} from '../actions/trackViewerActions.js';
import { useGpxDropHandler } from '../hooks/useGpxDropHandler.js';
import { useMessages } from '../l10nInjector.js';
import '../styles/trackViewer.scss';

type Props = { show: boolean };

export default TrackViewerUploadModal;

export function TrackViewerUploadModal({ show }: Props): ReactElement {
  const m = useMessages();

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

  const handleGpxDrop = useGpxDropHandler(handleUpload, handleLoadError, m);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleGpxDrop,
    accept: {
      'application/gpx+xml': ['.gpx'],
      'application/octet-stream': ['.gpx'],
    },
    multiple: false,
  });

  // {activeModal === 'upload-track' && // TODO move to separate component
  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>{m?.trackViewer.uploadModal.title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div
          {...getRootProps()}
          className={`dropzone${isDragActive ? ' dropzone-dropping' : ''}`}
        >
          <input {...getInputProps()} />

          {m?.trackViewer.uploadModal.drop}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.cancel} <kbd>Esc</kbd>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
