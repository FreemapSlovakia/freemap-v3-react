import { toastsAdd } from '@features/toasts/model/actions.js';
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
  incomplete: 'errors.incomplete',
  outdated: 'errors.outdated',
  http: 'errors.http',
  protocol: 'errors.protocol',
  unknown: 'errors.unknown',
};

/**
 * Raises the tool's failure and setup notices as toasts, which is where this app
 * says everything else of the kind. They were panels below the toolbar, which on
 * a phone pushed the map and its controls down the screen to say something the
 * user often already knew.
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

    // Every cause offers the one thing that can resolve it: install or update
    // the recorder, open it — because a start its own activity makes is one
    // Android allows, and because that is where permissions are granted — or
    // simply try again, which is also what re-prompts for Local Network Access.
    const action =
      failure === 'unreachable'
        ? { name: m.install, href: RECORDER_DOWNLOAD_URL }
        : failure === 'outdated'
          ? { name: m.update, href: RECORDER_DOWNLOAD_URL }
          : failure === 'setup-needed' || failure === 'needs-foreground'
            ? { name: m.setup.open, href: RECORDER_INTENT_URL }
            : { name: m.connect, action: gpsRecorderSync() };

    dispatch(
      toastsAdd({
        id: 'gpsRecorder.failure',
        style: 'danger',
        messageKey: ERROR_KEYS[failure],
        messageLoader: loadGpsRecorderMessages,
        actions: [{ ...action, variant: 'primary' }],
        // Gone the moment the recorder answers again, without the user having to
        // dismiss a warning about something that has already fixed itself.
        statePredicate: (state) => state.gpsRecorder.error === null,
      }),
    );
  }, [dispatch, failure, m]);

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
