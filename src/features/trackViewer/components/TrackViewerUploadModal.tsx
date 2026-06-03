import { setActiveModal } from '@app/store/actions.js';
import { elevationChartClose } from '@features/elevationChart/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import clsx from 'clsx';
import { type ReactElement, useCallback } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useTextFileDropHandler } from '../hooks/useTextFileDropHandler.js';
import {
  trackViewerSetData,
  trackViewerSetTrackUID,
} from '../model/actions.js';
import { parseGeojsonFile } from '../parseGeojsonFile.js';

type Props = { show: boolean };

export default function TrackViewerUploadModal({ show }: Props): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

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

  const handleUpload = useCallback(
    (text: string, file: File) => {
      const name = file.name.toLowerCase();

      if (name.endsWith('.geojson') || name.endsWith('.json')) {
        const trackGeojson = parseGeojsonFile(text);

        if (!trackGeojson) {
          handleLoadError(m?.trackViewer.invalidFormat ?? 'invalid format');

          return;
        }

        dispatch(trackViewerSetTrackUID(null));

        dispatch(trackViewerSetData({ trackGeojson, focus: true }));
      } else {
        dispatch(trackViewerSetTrackUID(null));

        dispatch(trackViewerSetData({ trackGpx: text, focus: true }));
      }

      dispatch(setActiveModal(null));

      dispatch(elevationChartClose());
    },
    [dispatch, m, handleLoadError],
  );

  const handleDrop = useTextFileDropHandler(handleUpload, handleLoadError, m);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    // TODO add KML/KMZ once a parser is wired up
    accept: {
      'application/gpx+xml': ['.gpx'],
      'application/geo+json': ['.geojson'],
      'application/json': ['.json', '.geojson'],
      'application/octet-stream': ['.gpx', '.geojson', '.json'],
    },
    multiple: false,
  });

  // {activeModal === 'file-import' && // TODO move to separate component
  return (
    <Modal show={show} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>{m?.trackViewer.uploadModal.title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div
          {...getRootProps()}
          className={clsx('dropzone', isDragActive && ' dropzone-dropping')}
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
