import { ToolMenu } from '@shared/components/ToolMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FaCircle, FaPlug, FaStop } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
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

  const status = useAppSelector((state) => state.gpsRecorder.status);

  const connection = useAppSelector((state) => state.gpsRecorder.connection);

  const error = useAppSelector((state) => state.gpsRecorder.error);

  const heldPoints = useAppSelector((state) => state.gpsRecorder.points.length);

  const recording = status?.recording ?? false;

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

      <span className="align-self-center ms-2 text-nowrap">
        {recording ? 'recording' : status ? 'stopped' : 'unknown'} ·{' '}
        {connection} · {heldPoints}/{status?.pointCount ?? '?'} pts
      </span>

      {error && (
        <span className="align-self-center ms-2 text-danger">{error}</span>
      )}
    </ToolMenu>
  );
}
