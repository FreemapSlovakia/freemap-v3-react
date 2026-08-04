import {
  type ToastAction,
  toastsAdd,
  toastsRemove,
} from '@features/toasts/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { Leaves } from '@shared/types/common.js';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { recorderBackendKind } from '../backend.js';
import { gpsRecorderSync, gpsRecorderUseBrowser } from '../model/actions.js';
import {
  RECORDER_DOWNLOAD_URL,
  RECORDER_INTENT_URL,
  RECORDER_OPEN_INTENT_URL,
  type RecorderFailure,
} from '../protocol.js';
import {
  browserRecordingSupported,
  gpsRecorderPlatformSupported,
} from '../support.js';
import type { GpsRecorderMessages } from '../translations/GpsRecorderMessages.js';
import { loadGpsRecorderMessages } from '../translations/loadGpsRecorderMessages.js';
import { useGpsRecorderMessages } from '../translations/useGpsRecorderMessages.js';

/**
 * Causes that mean something is broken, as opposed to a state the user can do
 * something about. A recorder that isn't running, a permission not granted, a
 * refusal that protected the recording — none of those are errors, and dressing
 * them in red says the app has failed when it has merely reported.
 */
const BROKEN: ReadonlySet<string> = new Set(['http', 'protocol', 'unknown']);

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
  'location-denied': 'errors.locationDenied',
  'location-unavailable': 'errors.locationUnavailable',
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
    // open the recorder — because its process is what serves the API, and because
    // that is where permissions are granted, and because a start its own activity
    // makes is one Android allows — update it, or simply try again, which is also
    // what re-prompts for Local Network Access. `not-persisted` and `not-stored`
    // are the exceptions: nothing the tool can offer changes the browser's mind
    // about its own storage, and a button that cannot help is worse than none.
    //
    // Nothing answering does *not* mean nothing is installed — a recorder that was
    // killed or swiped away answers exactly the same way — so that case leads with
    // opening it and offers the download second. The launch intent carries
    // `browser_fallback_url`, so it lands on the download page anyway if the app
    // really isn't there.
    //
    // Nothing answering is also where the browser fallback is worth offering:
    // the user has just asked to record and got nothing, and this is the one
    // action that records anyway. It comes after opening the app they may
    // already have — it records worse — but before the download, which is a
    // detour for anyone who only wanted this ride.
    const actions: ToastAction[] =
      failure === 'unreachable'
        ? [
            {
              name: m.setup.open,
              href: RECORDER_OPEN_INTENT_URL,
              variant: 'primary',
            },
            ...(browserRecordingSupported
              ? ([
                  {
                    name: m.recordInBrowser,
                    action: gpsRecorderUseBrowser(),
                    variant: 'secondary',
                  },
                ] as const)
              : []),
            {
              name: m.install,
              href: RECORDER_DOWNLOAD_URL,
              variant: 'secondary',
            },
          ]
        : failure === 'outdated'
          ? [
              {
                name: m.update,
                href: RECORDER_DOWNLOAD_URL,
                variant: 'primary',
              },
            ]
          : // These two arise from a start the user asked for, so the `start`
            // authority is right: the recorder resolves what is standing in the
            // way on its own screen and then begins the recording that was
            // wanted, rather than leaving the user to press Record again.
            failure === 'setup-needed' || failure === 'needs-foreground'
            ? [
                {
                  name: m.setup.open,
                  href: RECORDER_INTENT_URL,
                  variant: 'primary',
                },
              ]
            : // Nothing this app can offer changes the browser's mind about its
              // own storage, or about a permission the user refused for this
              // site — and a button that cannot help is worse than none.
              failure === 'not-persisted' ||
                failure === 'not-stored' ||
                failure === 'location-denied' ||
                failure === 'location-unavailable'
              ? []
              : [
                  {
                    name: m.connect,
                    action: gpsRecorderSync(),
                    variant: 'primary',
                  },
                ];

    dispatch(
      toastsAdd({
        id: 'gpsRecorder.failure',
        style: BROKEN.has(failure) ? 'danger' : 'warning',
        messageKey: ERROR_KEYS[failure],
        messageLoader: loadGpsRecorderMessages,
        actions,
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

      dispatch(toastsRemove('gpsRecorder.browser'));
    },
    [dispatch],
  );

  const browserRecording = useAppSelector(
    (state) =>
      recorderBackendKind(state) === 'browser' &&
      (state.gpsRecorder.status?.recording ?? false),
  );

  // Said once as the ride begins, and only then: what browser recording costs is
  // a thing to know before pocketing the phone, not a condition to be nagged
  // about for an hour. It times out like any other advisory, and the readout is
  // what says which engine is running for the rest of the ride.
  //
  // The upsell rides along where there is something to upsell to — a `warning`
  // in this app's vocabulary — and is simply absent where the recorder app
  // cannot be installed at all.
  useEffect(() => {
    if (!browserRecording || !m) {
      return;
    }

    dispatch(
      toastsAdd({
        id: 'gpsRecorder.browser',
        style: 'warning',
        messageKey: 'browserWarning',
        messageLoader: loadGpsRecorderMessages,
        timeout: 10_000,
        actions: gpsRecorderPlatformSupported
          ? [
              {
                name: m.install,
                href: RECORDER_DOWNLOAD_URL,
                variant: 'secondary',
              },
            ]
          : [],
      }),
    );
  }, [dispatch, m, browserRecording]);

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
        // The `open` authority, not `start`: this is the checklist on the
        // recorder's own screen, and the user came to read it. A `start` link
        // would find `canRecord` already true — none of these items block
        // recording — begin a recording nobody asked for, and hand focus back
        // before the screen had been seen at all.
        actions: [
          {
            name: m.setup.open,
            href: RECORDER_OPEN_INTENT_URL,
            variant: 'primary',
          },
        ],
        statePredicate: (state) =>
          state.gpsRecorder.status?.setupComplete === true,
      }),
    );
  }, [dispatch, m, signature]);
}
