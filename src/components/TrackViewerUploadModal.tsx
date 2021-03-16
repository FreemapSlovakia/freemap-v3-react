import { elevationChartClose } from 'fm3/actions/elevationChartActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import {
  trackViewerSetData,
  trackViewerSetTrackUID,
} from 'fm3/actions/trackViewerActions';
import { useGpxDropHandler } from 'fm3/hooks/gpxDropHandlerHook';
import { useMessages } from 'fm3/l10nInjector';
import 'fm3/styles/trackViewer.scss';
import { ReactElement, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useDropzone } from 'react-dropzone';
import { FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

type Props = { show: boolean };

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
    accept: '.gpx',
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
