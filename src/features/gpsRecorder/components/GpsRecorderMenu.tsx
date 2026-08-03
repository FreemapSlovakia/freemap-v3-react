import { setActiveModal } from '@app/store/actions.js';
import { isToolOpen } from '@app/store/selectors.js';
import { useDataMergeMode } from '@features/dataViewer/hooks/useDataMergeMode.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useConfirm } from '@shared/components/ConfirmProvider.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { ToolMenu } from '@shared/components/ToolMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useCallback, useEffect } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { FaCircle, FaCog, FaPause, FaStop, FaTrash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useRecorderNotices } from '../hooks/useRecorderNotices.js';
import {
  gpsRecorderClear,
  gpsRecorderPause,
  gpsRecorderStart,
  gpsRecorderStop,
  gpsRecorderSync,
} from '../model/actions.js';
import { selectRecorderSegments } from '../model/selectors.js';
import { useGpsRecorderMessages } from '../translations/useGpsRecorderMessages.js';
import classes from './GpsRecorderMenu.module.css';
import { GpsRecorderReadout } from './GpsRecorderReadout.js';

export default function GpsRecorderMenu(): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const grm = useGpsRecorderMessages();

  const confirm = useConfirm();

  const askMergeMode = useDataMergeMode();

  useRecorderNotices();

  const status = useAppSelector((state) => state.gpsRecorder.status);

  const connection = useAppSelector((state) => state.gpsRecorder.connection);

  const pending = useAppSelector((state) => state.gpsRecorder.pending);

  // What finishing would actually produce: the hand-over drops segments too short
  // to be a line, so counting raw fixes would offer a Finish that takes nothing.
  const saveable = useAppSelector((state) =>
    selectRecorderSegments(state).some((segment) => segment.length >= 2),
  );

  const recording = status?.recording ?? false;

  // A recording keeps this toolbar on the screen after its tool is closed, so
  // the tool being open is what tells the full set of controls from the strip
  // that only says a recording is running.
  const open = useAppSelector((state) => isToolOpen(state, 'gps-recorder'));

  // The spinner covers any wait, but only a command the user gave blocks the
  // transport: the background poll passes through `connecting` every few
  // seconds, and disabling Record for it would fight the user on exactly the
  // recorder that isn't answering.
  //
  // `reconnecting` is a wait like the others, and the one worth showing most: the
  // figures beside the button have stopped advancing, and without the spinner
  // nothing on the toolbar says the app is working on getting them back.
  const busy =
    pending ||
    connection === 'connecting' ||
    connection === 'syncing' ||
    connection === 'reconnecting';

  // Connecting on open rather than behind a button: a recording begun on an
  // earlier page load, or a stream the browser gave up on, would otherwise leave
  // the panel blank until something was pressed. The Local Network Access prompt
  // still needs a gesture, so the panel offers one when this fails.
  //
  // Keyed on the panel being open rather than on this component mounting, which a
  // recording does on its own: opening the tool is the gesture a user makes when
  // the live view has gone quiet.
  //
  // Opening the tool is all this does. The connection itself belongs to
  // `attachRecorderFollow`, which keeps it for as long as there is a recording to
  // follow — closing this toolbar says nothing about whether the phone is still
  // recording.
  //
  // There is no polling either: the stream pushes a status whenever the recorder's
  // state changes, returning to the foreground catches up on what a frozen tab
  // missed, and a stream the browser gave up on schedules its own retry.
  useEffect(() => {
    if (open) {
      dispatch(gpsRecorderSync());
    }
  }, [open, dispatch]);

  // Asked only while the recorder is still running: that tap ends a ride that
  // cannot be resumed — the recorder's track is taken and deleted, so a start
  // afterwards begins a new one. Finishing an already stopped recording only
  // collects what is sitting there, and the merge question below covers the rest.
  const handleStop = useCallback(async () => {
    if (
      recording &&
      !(await confirm({
        title: grm?.stopModal.title,
        message: grm?.stopModal.message({ tool: m?.tools.dataViewer }),
        confirmLabel: grm?.stopModal.confirm,
      }))
    ) {
      return;
    }

    const mode = await askMergeMode();

    if (mode !== 'cancel') {
      dispatch(gpsRecorderStop(mode));
    }
  }, [recording, confirm, m, grm, askMergeMode, dispatch]);

  const handleClear = useCallback(async () => {
    if (
      await confirm({
        title: grm?.deleteModal.title,
        message: grm?.deleteModal.message,
        confirmLabel: grm?.deleteModal.confirm,
        confirmStyle: 'danger',
      })
    ) {
      dispatch(gpsRecorderClear());
    }
  }, [confirm, dispatch, grm]);

  return (
    // The strip keeps the readout — distance and time are what the glance is for
    // — and nothing that acts on the recording: reaching Pause or Finish is what
    // expanding is for.
    <ToolMenu
      tool="gps-recorder"
      stripChildren={<GpsRecorderReadout />}
      collapsible
      iconClassName={recording ? classes.recording : undefined}
    >
      {/* Record and Pause are one button, because they are one thing: the
              recorder keeps its track across a `POST /stop`, so stopping it is a
              pause and the next start continues the same ride. */}
      <Button
        className="ms-1"
        variant="primary"
        disabled={pending}
        // Must stay a direct gesture handler: this tap is what allows the
        // Local Network Access prompt and the launch intent.
        onClick={() =>
          dispatch(recording ? gpsRecorderPause() : gpsRecorderStart())
        }
      >
        {busy ? (
          <Spinner animation="border" size="sm" />
        ) : recording ? (
          <FaPause />
        ) : (
          <FaCircle />
        )}{' '}
        {recording ? grm?.pause : grm?.record}
      </Button>

      {/* Ending the ride: the track leaves the recorder for the app. Offered
              whenever there is something to take, recording or not — there is no
              separate save, because taking the track *is* saving it. */}
      {saveable && (
        <LongPressTooltip label={grm?.stop}>
          {({ props }) => (
            <Button
              className="ms-1"
              variant="secondary"
              disabled={pending}
              onClick={handleStop}
              {...props}
            >
              <FaStop />
            </Button>
          )}
        </LongPressTooltip>
      )}

      {/* Beside Finish, because they are the two ends of the same decision:
              take the ride or throw it away. Hidden rather than disabled — the
              recorder refuses to delete mid-recording, and a permanently greyed
              button says nothing about why. */}
      {!recording && (status?.count ?? 0) > 0 && (
        <LongPressTooltip label={grm?.delete}>
          {({ props }) => (
            <Button
              className="ms-1"
              variant="danger"
              onClick={handleClear}
              {...props}
            >
              <FaTrash />
            </Button>
          )}
        </LongPressTooltip>
      )}

      <LongPressTooltip label={grm?.settings}>
        {({ props }) => (
          <Button
            className="ms-1"
            variant="secondary"
            onClick={() =>
              dispatch(setActiveModal({ type: 'gps-recorder-settings' }))
            }
            {...props}
          >
            <FaCog />
          </Button>
        )}
      </LongPressTooltip>
    </ToolMenu>
  );
}
