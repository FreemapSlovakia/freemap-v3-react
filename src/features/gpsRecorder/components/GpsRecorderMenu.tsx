import { convertToDrawing } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useConfirm } from '@shared/components/ConfirmProvider.js';
import { ToolMenu } from '@shared/components/ToolMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import {
  FaCircle,
  FaPencilRuler,
  FaPlug,
  FaStop,
  FaTrash,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  gpsRecorderClear,
  gpsRecorderStart,
  gpsRecorderStop,
  gpsRecorderSync,
} from '../model/actions.js';

/**
 * Stage-1 panel: enough controls and readout to prove the chain end to end.
 * The strings are intentionally raw English — stage 2 designs and localizes it.
 */
export default function GpsRecorderMenu(): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const confirm = useConfirm();

  const status = useAppSelector((state) => state.gpsRecorder.status);

  const connection = useAppSelector((state) => state.gpsRecorder.connection);

  const error = useAppSelector((state) => state.gpsRecorder.error);

  const heldPoints = useAppSelector((state) => state.gpsRecorder.points.length);

  const recording = status?.recording ?? false;

  const handleConvert = useCallback(() => {
    // The recording is dense, so offer the same simplification the track viewer
    // does. Nothing is lost here — this copies, leaving the recorder's track
    // alone — so there's no loss warning to pair with it.
    const answer = window.prompt(m?.general.simplifyPrompt, '50');

    if (answer === null) {
      return;
    }

    dispatch(
      convertToDrawing({
        type: 'gps-recorder',
        tolerance: Number(answer || '0') / 100000,
      }),
    );
  }, [dispatch, m]);

  const handleClear = useCallback(async () => {
    if (
      await confirm({
        title: 'Delete the recording?',
        message:
          'The recorder deletes its whole track. This cannot be undone, and it is the only copy.',
        confirmLabel: 'Delete',
        confirmStyle: 'danger',
      })
    ) {
      dispatch(gpsRecorderClear());
    }
  }, [confirm, dispatch]);

  return (
    <ToolMenu tool="gps-recorder">
      <Button
        className="ms-1"
        variant="primary"
        disabled={recording}
        // Must stay a direct gesture handler: this tap is what allows the
        // Local Network Access prompt and the launch intent.
        onClick={() => dispatch(gpsRecorderStart())}
      >
        <FaCircle /> Start
      </Button>

      <Button
        className="ms-1"
        variant="secondary"
        disabled={!recording}
        onClick={() => dispatch(gpsRecorderStop())}
      >
        <FaStop /> Stop
      </Button>

      <Button
        className="ms-1"
        variant="secondary"
        onClick={() => dispatch(gpsRecorderSync())}
      >
        <FaPlug /> Reconnect
      </Button>

      <Button
        className="ms-1"
        variant="secondary"
        disabled={heldPoints < 2}
        onClick={handleConvert}
      >
        <FaPencilRuler /> To drawing
      </Button>

      <Button
        className="ms-1"
        variant="danger"
        // The recorder refuses to delete mid-recording, so don't offer it.
        disabled={!status || status.count === 0 || recording}
        onClick={handleClear}
      >
        <FaTrash /> Delete
      </Button>

      <span className="align-self-center ms-2 text-nowrap">
        {recording ? 'recording' : status ? 'stopped' : 'unknown'} ·{' '}
        {connection} · {heldPoints}/{status?.count ?? '?'} pts
        {status && !status.setupComplete && ' · setup incomplete'}
      </span>

      {error && (
        <span className="align-self-center ms-2 text-danger">{error}</span>
      )}
    </ToolMenu>
  );
}
