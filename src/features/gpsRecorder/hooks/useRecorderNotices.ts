import { toastsAdd, toastsRemove } from '@features/toasts/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { Leaves } from '@shared/types/common.js';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { gpsRecorderSync } from '../model/actions.js';
import {
  RECORDER_DOWNLOAD_URL,
  RECORDER_INTENT_URL,
  type RecorderFailure,
} from '../protocol.js';
import type { GpsRecorderMessages } from '../translations/GpsRecorderMessages.js';
import { loadGpsRecorderMessages } from '../translations/loadGpsRecorderMessages.js';
import { useGpsRecorderMessages } from '../translations/useGpsRecorderMessages.js';

const ERROR_KEYS: Record<
  RecorderFailure | 'unknown',
  Leaves<GpsRecorderMessages>
> = {
  unreachable: 'errors.unreachable',
  'lna-denied': 'errors.lnaDenied',
  'setup-needed': 'errors.setupNeeded',
  'needs-foreground': 'errors.needsForeground',
  recording: 'errors.recording',
  'not-persisted': 'errors.notPersisted',
  'not-stored': 'errors.notStored',
  incomplete: 'errors.incomplete',
  outdated: 'errors.outdated',
  http: 'errors.http',
  protocol: 'errors.protocol',
  unknown: 'errors.unknown',
};

/**
 * Raises the tool's failure and setup notices as toasts, which is where this app
 * says everything else of the kind — and, on a phone, the only place that doesn't
 * push the map and its controls down the screen.
 *
 * The technical detail behind a failure is deliberately not shown: it is kept in
 * `gpsRecorder.error` for the devtools, where it belongs, rather than printed
 * over the map.
 */
export function useRecorderNotices(): void {
  const dispatch = useDispatch();

  const m = useGpsRecorderMessages();

  const failure = useAppSelector((state) => state.gpsRecorder.error?.failure);

  const status = useAppSelector((state) => state.gpsRecorder.status);

  useEffect(() => {
    if (!failure || !m) {
      return;
    }

    // Every cause that *can* be resolved offers the one thing that resolves it:
    // install or update the recorder, open it — because a start its own activity
    // makes is one Android allows, and because that is where permissions are
    // granted — or simply try again, which is also what re-prompts for Local
    // Network Access. `not-persisted` is the exception: nothing the tool can offer
    // changes the browser's mind about keeping its storage, and a button that
    // cannot help is worse than none.
    const action =
      failure === 'unreachable'
        ? { name: m.install, href: RECORDER_DOWNLOAD_URL }
        : failure === 'outdated'
          ? { name: m.update, href: RECORDER_DOWNLOAD_URL }
          : failure === 'setup-needed' || failure === 'needs-foreground'
            ? { name: m.setup.open, href: RECORDER_INTENT_URL }
            : failure === 'not-persisted' || failure === 'not-stored'
              ? null
              : { name: m.connect, action: gpsRecorderSync() };

    dispatch(
      toastsAdd({
        id: 'gpsRecorder.failure',
        style: 'danger',
        messageKey: ERROR_KEYS[failure],
        messageLoader: loadGpsRecorderMessages,
        actions: action ? [{ ...action, variant: 'primary' }] : [],
        // Gone the moment the recorder answers again, without the user having to
        // dismiss a warning about something that has already fixed itself.
        statePredicate: (state) => state.gpsRecorder.error === null,
      }),
    );
  }, [dispatch, failure, m]);

  // Both toasts go with the tool. Their actions reconnect to the recorder, and a
  // toast that outlived the panel would open a stream with nothing left to close
  // it — which `stream.ts`'s revive timer would then keep alive indefinitely.
  useEffect(
    () => () => {
      dispatch(toastsRemove('gpsRecorder.failure'));

      dispatch(toastsRemove('gpsRecorder.setup'));
    },
    [dispatch],
  );

  // Only the recommended-but-missing steps: a hard gate is a failure and travels
  // as one. Keyed on the set of outstanding items, so resolving one re-states
  // what is left and resolving the last one says nothing at all.
  const issues = status && !status.setupComplete ? status : null;

  const signature = !issues
    ? null
    : [
        issues.permissions.fine,
        issues.permissions.background,
        issues.permissions.notifications,
        issues.batteryExempt,
        issues.oem?.needed && !issues.oem.acknowledged ? issues.oem.vendor : '',
      ].join('|');

  // `issues` is the status object, which changes on every poll; the signature is
  // what says whether anything the user can act on has changed.
  // biome-ignore lint/correctness/useExhaustiveDependencies: signature is the stable proxy for issues
  useEffect(() => {
    if (!issues || !m || !signature) {
      return;
    }

    const items: string[] = [];

    if (!issues.permissions.fine) {
      items.push(m.setup.permissionFine);
    }

    if (!issues.permissions.background) {
      items.push(m.setup.permissionBackground);
    }

    if (!issues.permissions.notifications) {
      items.push(m.setup.permissionNotifications);
    }

    if (!issues.batteryExempt) {
      items.push(m.setup.battery);
    }

    if (issues.oem?.needed && !issues.oem.acknowledged && issues.oem.vendor) {
      items.push(m.setup.oem({ vendor: issues.oem.vendor }));
    }

    if (items.length === 0) {
      return;
    }

    dispatch(
      toastsAdd({
        id: 'gpsRecorder.setup',
        style: 'warning',
        messageKey: 'setup.summary',
        messageParams: { items },
        messageLoader: loadGpsRecorderMessages,
        actions: [
          { name: m.setup.open, href: RECORDER_INTENT_URL, variant: 'primary' },
        ],
        statePredicate: (state) =>
          state.gpsRecorder.status?.setupComplete === true,
      }),
    );
  }, [dispatch, m, signature]);
}
