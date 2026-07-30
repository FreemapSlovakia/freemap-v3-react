import { setActiveModal } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useTrackMergeMode } from '@features/trackViewer/hooks/useTrackMergeMode.js';
import { useConfirm } from '@shared/components/ConfirmProvider.js';
import {
  Action,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import { ToolMenu } from '@shared/components/ToolMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useCallback, useEffect } from 'react';
import { Button, ButtonGroup, Spinner } from 'react-bootstrap';
import {
  FaCircle,
  FaCog,
  FaPause,
  FaPlay,
  FaSave,
  FaStop,
  FaTrash,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  gpsRecorderClear,
  gpsRecorderDisconnect,
  gpsRecorderPause,
  gpsRecorderSave,
  gpsRecorderStart,
  gpsRecorderStop,
  gpsRecorderSync,
} from '../model/actions.js';
import { selectRecorderSegments } from '../model/selectors.js';
import { isRecorderStatusPushed } from '../stream.js';
import { useGpsRecorderMessages } from '../translations/useGpsRecorderMessages.js';
import { GpsRecorderNotices } from './GpsRecorderNotices.js';
import { GpsRecorderReadout } from './GpsRecorderReadout.js';

/**
 * How often the recorder is re-read while the tool is open, on a recorder whose
 * stream does not carry its state. `/status` is a loopback call answered from
 * memory, and the sync only fetches a track page when the recorder says it holds
 * fixes above our cursor — so this is cheap enough to run throughout, and it is
 * what keeps the panel honest when nothing else brings the news.
 */
const POLL_INTERVAL_MS = 15_000;

export default function GpsRecorderMenu(): ReactElement {
  const dispatch = useDispatch();

  const m = useGpsRecorderMessages();

  const gm = useMessages();

  const confirm = useConfirm();

  const askMergeMode = useTrackMergeMode();

  const status = useAppSelector((state) => state.gpsRecorder.status);

  const connection = useAppSelector((state) => state.gpsRecorder.connection);

  const paused = useAppSelector((state) => state.gpsRecorder.paused);

  const pending = useAppSelector((state) => state.gpsRecorder.pending);

  // What saving would actually produce: the handler drops segments too short
  // to be a line, so counting raw fixes would offer a Save that does nothing.
  const saveable = useAppSelector((state) =>
    selectRecorderSegments(state).some((segment) => segment.length >= 2),
  );

  const keepScreenAwake = useAppSelector(
    (state) => state.gpsRecorderSettings.keepScreenAwake,
  );

  const recording = status?.recording ?? false;

  // `recording` stays true across a pause on the recorder's side, so the three
  // transport states are `!recording`, `recording && paused` and this one.
  const running = recording && !paused;

  // The spinner covers any wait, but only a command the user gave blocks the
  // transport: the background poll passes through `connecting` every few
  // seconds, and disabling Record for it would fight the user on exactly the
  // recorder that isn't answering.
  const busy =
    pending || connection === 'connecting' || connection === 'syncing';

  // Connecting on open rather than behind a button: a recording begun on an
  // earlier page load, or a stream the browser gave up on, would otherwise
  // leave the panel blank until something was pressed. The Local Network Access
  // prompt still needs a gesture, so the panel offers one when this fails.
  useEffect(() => {
    dispatch(gpsRecorderSync());

    const timer = setInterval(() => {
      // A frozen background page runs neither the timer nor the stream; the
      // catch-up on returning is what fills the gap. A stream that pushes its
      // own status needs no poll at all — it says when something changed, at
      // the moment it changed — so this stands down to a no-op there.
      if (document.visibilityState === 'visible' && !isRecorderStatusPushed()) {
        dispatch(gpsRecorderSync());
      }
    }, POLL_INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        dispatch(gpsRecorderSync());
      }
    };

    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(timer);

      document.removeEventListener('visibilitychange', onVisible);

      dispatch(gpsRecorderDisconnect());
    };
  }, [dispatch]);

  // Held only while there is something to watch, so closing the tool or
  // stopping the recording gives the screen back to the platform's own timeout.
  useEffect(() => {
    if (!keepScreenAwake || !running || !('wakeLock' in navigator)) {
      return;
    }

    let sentinel: WakeLockSentinel | null = null;

    let released = false;

    navigator.wakeLock
      .request('screen')
      .then((s) => {
        if (released) {
          void s.release();
        } else {
          sentinel = s;
        }
      })
      // Denied (or the tab lost visibility mid-request); the recording is
      // unaffected, so there is nothing to report.
      .catch(() => undefined);

    return () => {
      released = true;

      void sentinel?.release();
    };
  }, [keepScreenAwake, running]);

  const handleSave = useCallback(async () => {
    const mode = await askMergeMode();

    if (mode !== 'cancel') {
      dispatch(gpsRecorderSave(mode));
    }
  }, [askMergeMode, dispatch]);

  const handleClear = useCallback(async () => {
    if (
      await confirm({
        title: m?.deleteModal.title,
        message: m?.deleteModal.message,
        confirmLabel: m?.deleteModal.confirm,
        confirmStyle: 'danger',
      })
    ) {
      dispatch(gpsRecorderClear());
    }
  }, [confirm, dispatch, m]);

  return (
    <>
      <ToolMenu tool="gps-recorder">
        <ButtonGroup className="ms-1">
          <Button
            variant="primary"
            disabled={pending}
            // Must stay a direct gesture handler: this tap is what allows the
            // Local Network Access prompt and the launch intent.
            onClick={() =>
              dispatch(running ? gpsRecorderStop() : gpsRecorderStart())
            }
          >
            {busy ? (
              <Spinner animation="border" size="sm" />
            ) : running ? (
              <FaStop />
            ) : paused ? (
              <FaPlay />
            ) : (
              <FaCircle />
            )}{' '}
            {running ? m?.stop : paused ? m?.resume : m?.record}
          </Button>

          {running && (
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() => dispatch(gpsRecorderPause())}
            >
              <FaPause /> {m?.pause}
            </Button>
          )}

          {paused && (
            <Button
              variant="secondary"
              disabled={pending}
              onClick={() => dispatch(gpsRecorderStop())}
            >
              <FaStop /> {m?.stop}
            </Button>
          )}
        </ButtonGroup>

        {/* `md` so the toggle is the same height as the transport buttons — the
            `sm` default suits the list rows this is otherwise used in. */}
        <ResponsiveActions
          className="ms-1"
          size="md"
          toggleLabel={gm?.general.actions}
        >
          <Action
            label={m?.save}
            icon={<FaSave />}
            showFrom="never"
            disabled={!saveable}
            onClick={handleSave}
          />

          <Action
            label={m?.delete}
            icon={<FaTrash />}
            variant="danger"
            showFrom="never"
            // The recorder refuses to delete mid-recording, so don't offer it.
            disabled={!status || status.count === 0 || recording}
            onClick={handleClear}
          />

          <Action
            label={m?.settings}
            icon={<FaCog />}
            showFrom="never"
            onClick={() =>
              dispatch(setActiveModal({ type: 'gps-recorder-settings' }))
            }
          />
        </ResponsiveActions>

        <GpsRecorderReadout />
      </ToolMenu>

      <GpsRecorderNotices />
    </>
  );
}
