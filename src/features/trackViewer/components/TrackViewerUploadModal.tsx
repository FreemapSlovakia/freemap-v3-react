import { useDocumentTitle } from '@app/hooks/useDocumentTitle.js';
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
import {
  type TextFileDropError,
  useTextFileDropHandler,
} from '../hooks/useTextFileDropHandler.js';
import {
  trackViewerSetData,
  trackViewerSetTrackUID,
} from '../model/actions.js';
import { parseTrackFile } from '../parseTrackFile.js';
import { loadTrackViewerMessages } from '../translations/loadTrackViewerMessages.js';
import { useTrackViewerMessages } from '../translations/useTrackViewerMessages.js';

// Picker filter shown to the user; the actual validation lives in the dropzone
// `accept` prop (matched by these same extensions).
const TRACK_FILE_EXTENSIONS = '.gpx,.kml,.tcx,.geojson,.json';

type Props = { show: boolean };

export default function TrackViewerUploadModal({ show }: Props): ReactElement {
  const m = useMessages();

  const tvm = useTrackViewerMessages();

  useDocumentTitle(show ? tvm?.uploadModal.title : undefined);

  const dispatch = useDispatch();

  const close = useCallback(() => {
    dispatch(setActiveModal(null));
  }, [dispatch]);

  const handleLoadError = useCallback(
    (messageKey: TextFileDropError) => {
      dispatch(
        toastsAdd({
          id: 'trackViewer.loadError',
          messageKey,
          messageLoader: loadTrackViewerMessages,
          style: 'danger',
          timeout: 5000,
        }),
      );
    },
    [dispatch],
  );

  const handleUpload = useCallback(
    (text: string, file: File) => {
      const parsed = parseTrackFile(text, file.name);

      if (parsed.kind === 'error') {
        handleLoadError('invalidFormat');

        return;
      }

      dispatch(trackViewerSetTrackUID(null));

      dispatch(
        parsed.kind === 'gpx'
          ? trackViewerSetData({ trackGpx: parsed.text, focus: true })
          : trackViewerSetData({ trackGeojson: parsed.geojson, focus: true }),
      );

      dispatch(setActiveModal(null));

      dispatch(elevationChartClose());
    },
    [dispatch, handleLoadError],
  );

  const handleDrop = useTextFileDropHandler(handleUpload, handleLoadError);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    // Validates dropped/picked files (matched by the extensions below). The
    // file-picker's type labels come from the input's `accept` *attribute*,
    // which we override to extensions only (see the <input>) — browsers render
    // a clean `*.ext` per entry instead of the raw MIME string they show for
    // types they recognize (e.g. KML, GeoJSON).
    accept: {
      'application/gpx+xml': ['.gpx'],
      'application/vnd.google-earth.kml+xml': ['.kml'],
      'application/vnd.garmin.tcx+xml': ['.tcx'],
      'application/geo+json': ['.geojson'],
      'application/json': ['.json'],
    },
    multiple: false,
  });

  // {activeModal === 'file-import' && // TODO move to separate component
  return (
    <Modal show={show} onHide={close} scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{tvm?.uploadModal.title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div
          {...getRootProps()}
          className={clsx('dropzone', isDragActive && ' dropzone-dropping')}
        >
          {/* Extensions only, so the OS picker shows clean `*.ext` entries
              rather than raw MIME labels; validation still uses the prop. */}
          <input {...getInputProps({ accept: TRACK_FILE_EXTENSIONS })} />

          {tvm?.uploadModal.drop}
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
