import { setActiveModal } from '@app/store/actions.js';
import { isToolOpen } from '@app/store/selectors.js';
import { useDataMergeMode } from '@features/dataViewer/hooks/useDataMergeMode.js';
import {
  elevationChartClose,
  elevationChartOpen,
} from '@features/elevationChart/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { useConfirm } from '@shared/components/ConfirmProvider.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { ToolMenu } from '@shared/components/ToolMenu.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useCallback, useEffect } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import {
  FaChartArea,
  FaCircle,
  FaCog,
  FaPause,
  FaStop,
  FaTrash,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  gpsRecorderClear,
  gpsRecorderPause,
  gpsRecorderStart,
  gpsRecorderStop,
  gpsRecorderSync,
} from '../model/actions.js';
import {
  selectRecorderHasProfile,
  selectRecorderSegments,
} from '../model/selectors.js';
import { useGpsRecorderMessages } from '../translations/useGpsRecorderMessages.js';
import classes from './GpsRecorderMenu.module.css';
import { GpsRecorderReadout } from './GpsRecorderReadout.js';

export default function GpsRecorderMenu(): ReactElement {
  const dispatch = useDispatch();

  const m = useMessages();

  const grm = useGpsRecorderMessages();

  const confirm = useConfirm();

  const askMergeMode = useDataMergeMode();

  const status = useAppSelector((state) => state.gpsRecorder.status);

  const connection = useAppSelector((state) => state.gpsRecorder.connection);

  const pending = useAppSelector((state) => state.gpsRecorder.pending);

  // What finishing would actually produce: the hand-over drops segments too short
  // to be a line, so counting raw fixes would offer a Finish that takes nothing.
  const saveable = useAppSelector((state) =>
    selectRecorderSegments(state).some((segment) => segment.length >= 2),
  );

  // The profile of the ride so far, redrawn as fixes arrive — offered while the
  // recording is still the recorder's, since afterwards it is the track
  // viewer's chart that shows it.
  const chartable = useAppSelector(selectRecorderHasProfile);

  const chartActive = useAppSelector(
    (state) => state.elevationChart.target?.type === 'gps-recorder',
  );

  const recording = status?.recording ?? false;

  // A recording keeps this toolbar on the screen after its tool is closed, so
  // the tool being open is what tells the full set of controls from the strip
  // that only says a recording is running.
  const open = useAppSelector((state) => isToolOpen(state, 'gps-recorder'));

  // The spinner covers any wait, but only a command the user gave blocks the
  // transport: the connection's own retries pass through `connecting`, and
  // disabling Record for them would fight the user on exactly the recorder
  // that isn't answering.
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
  // the panel blank until something was pressed. The sync is loud, because
  // opening the tool is the gesture a user makes when the live view has gone
  // quiet — and the Local Network Access prompt needs a gesture anyway, so the
  // panel offers one when this fails.
  //
  // Keyed on the panel being open rather than on this component mounting, which a
  // recording does on its own.
  //
  // Only the loud ask lives here. Whether there should be a connection at all is
  // the store's answer, not this component's: `gpsRecorderToolProcessor` tells
  // the connection when the tool opens or closes, so a menu that is unmounted
  // for a map-pick mode cannot swallow the transition.
  //
  // There is no polling either: the stream pushes a status whenever the recorder's
  // state changes, returning to the foreground catches up on what a frozen tab
  // missed, and a connection that failed retries on its own backoff.
  useEffect(() => {
    if (open) {
      dispatch(gpsRecorderSync());
    }
  }, [open, dispatch]);

  // Always asked: the tap empties the recorder either way — its track is taken
  // and deleted, so a start afterwards begins a new one. Running, it also ends a
  // ride that cannot be resumed, which is what the message leads with.
  const handleStop = useCallback(async () => {
    if (
      !(await confirm({
        title: grm?.stopModal.title,
        message: recording
          ? grm?.stopModal.runningMessage({ tool: m?.tools.dataViewer })
          : grm?.stopModal.stoppedMessage({ tool: m?.tools.dataViewer }),
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
    // Collapsing leaves the icon and nothing else: the figures are as much of the
    // map as the buttons are, so putting the controls away puts them away too.
    // The icon then opens them itself, which is the whole of what a strip that
    // only says a recording is running can still be asked.
    <ToolMenu
      tool="gps-recorder"
      collapsible
      iconClassName={recording ? classes.recording : undefined}
      wrapCollapsedIcon={(icon) => <GpsRecorderReadout collapsedIcon={icon} />}
    >
      {/* Record and Pause are one button, because they are one thing: the
              recorder keeps its track across a `POST /stop`, so stopping it is a
              pause and the next start continues the same ride. */}
      <LongPressTooltip
        breakpoint="sm"
        label={recording ? grm?.pause : grm?.record}
      >
        {({ label, labelClassName, props }) => (
          <Button
            className="ms-1"
            variant="primary"
            disabled={pending}
            // Must stay a direct gesture handler: this tap is what allows the
            // Local Network Access prompt and the launch intent.
            onClick={() =>
              dispatch(recording ? gpsRecorderPause() : gpsRecorderStart())
            }
            {...props}
          >
            {busy ? (
              <Spinner animation="border" size="sm" />
            ) : recording ? (
              <FaPause />
            ) : (
              <FaCircle />
            )}
            <span className={labelClassName}> {label}</span>
          </Button>
        )}
      </LongPressTooltip>

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

      <GpsRecorderReadout />

      {chartable && (
        <LongPressTooltip label={m?.general.elevationProfile}>
          {({ props }) => (
            <Button
              className="ms-1"
              variant="secondary"
              active={chartActive}
              onClick={() =>
                dispatch(
                  chartActive
                    ? elevationChartClose()
                    : elevationChartOpen({ type: 'gps-recorder' }),
                )
              }
              {...props}
            >
              <FaChartArea />
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
