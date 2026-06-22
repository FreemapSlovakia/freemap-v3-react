import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaMountain, FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  trackViewerResolveElevationPrompt,
  trackViewerSetElevationPrompt,
} from '../model/actions.js';
import { useTrackViewerMessages } from '../translations/useTrackViewerMessages.js';

export default function TrackViewerElevationPromptModal(): ReactElement | null {
  const m = useMessages();

  const tvm = useTrackViewerMessages();

  const dispatch = useDispatch();

  const show = useAppSelector(
    (state) => state.trackViewer.elevationPrompt !== null,
  );

  if (!show) {
    return null;
  }

  const close = () => dispatch(trackViewerSetElevationPrompt(null));

  return (
    <Modal show onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaMountain /> {tvm?.elevationFill.title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>{tvm?.elevationFill.message}</Modal.Body>

      <Modal.Footer>
        <Button
          variant="primary"
          onClick={() =>
            dispatch(trackViewerResolveElevationPrompt({ mode: 'all' }))
          }
        >
          {tvm?.elevationFill.overrideAll}
        </Button>

        <Button
          variant="secondary"
          onClick={() =>
            dispatch(trackViewerResolveElevationPrompt({ mode: 'missing' }))
          }
        >
          {tvm?.elevationFill.fillMissing}
        </Button>

        <Button variant="dark" onClick={close}>
          <FaTimes /> {m?.general.cancel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
