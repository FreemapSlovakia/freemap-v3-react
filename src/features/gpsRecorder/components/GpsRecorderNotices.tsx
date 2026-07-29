import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement, ReactNode } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { FaDownload, FaExternalLinkAlt, FaPlug } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { gpsRecorderSync } from '../model/actions.js';
import { RECORDER_DOWNLOAD_URL, RECORDER_INTENT_URL } from '../protocol.js';
import { useGpsRecorderMessages } from '../translations/useGpsRecorderMessages.js';

/**
 * What the user can do about a failure, by cause. Only three of them have an
 * action: an unreachable recorder is installed, a setup-incomplete one is
 * opened, and everything else is retried by reconnecting — including
 * `lna-denied`, whose permission prompt needs a fresh gesture to come back.
 */
function FailureAction(): ReactElement | null {
  const m = useGpsRecorderMessages();

  const dispatch = useDispatch();

  const failure = useAppSelector((state) => state.gpsRecorder.error?.failure);

  switch (failure) {
    case 'unreachable':
      return (
        <Button variant="primary" size="sm" href={RECORDER_DOWNLOAD_URL}>
          <FaDownload /> {m?.install}
        </Button>
      );

    case 'outdated':
      return (
        <Button variant="primary" size="sm" href={RECORDER_DOWNLOAD_URL}>
          <FaDownload /> {m?.update}
        </Button>
      );

    case 'setup-needed':
      return (
        <Button variant="primary" size="sm" href={RECORDER_INTENT_URL}>
          <FaExternalLinkAlt /> {m?.setup.open}
        </Button>
      );

    case undefined:
      return null;

    default:
      // Must stay a direct gesture handler: this tap is what allows the Local
      // Network Access prompt to appear at all.
      return (
        <Button
          variant="primary"
          size="sm"
          onClick={() => dispatch(gpsRecorderSync())}
        >
          <FaPlug /> {m?.connect}
        </Button>
      );
  }
}

function errorText(
  m: ReturnType<typeof useGpsRecorderMessages>,
  failure: string,
): ReactNode {
  switch (failure) {
    case 'unreachable':
      return m?.errors.unreachable;
    case 'lna-denied':
      return m?.errors.lnaDenied;
    case 'setup-needed':
      return m?.errors.setupNeeded;
    case 'recording':
      return m?.errors.recording;
    case 'outdated':
      return m?.errors.outdated;
    case 'unsupported':
      return m?.errors.unsupported;
    case 'http':
      return m?.errors.http;
    case 'protocol':
      return m?.errors.protocol;
    default:
      return m?.errors.unknown;
  }
}

/**
 * The failure and setup panels. Kept beside the toolbar rather than in a toast:
 * both describe a state that persists until acted on, and the setup one decides
 * whether a multi-hour recording survives at all — so it stays visible while
 * `setupComplete` is false, and disappears entirely once it isn't.
 */
export function GpsRecorderNotices(): ReactElement | null {
  const m = useGpsRecorderMessages();

  const error = useAppSelector((state) => state.gpsRecorder.error);

  const status = useAppSelector((state) => state.gpsRecorder.status);

  const setupIssues: ReactNode[] = [];

  if (status && !status.setupComplete) {
    if (!status.permissions.fine) {
      setupIssues.push(m?.setup.permissionFine);
    }

    if (!status.permissions.background) {
      setupIssues.push(m?.setup.permissionBackground);
    }

    if (!status.permissions.notifications) {
      setupIssues.push(m?.setup.permissionNotifications);
    }

    if (!status.batteryExempt) {
      setupIssues.push(m?.setup.battery);
    }

    if (status.oem?.needed && !status.oem.acknowledged && status.oem.vendor) {
      setupIssues.push(m?.setup.oem({ vendor: status.oem.vendor }));
    }
  }

  if (!error && setupIssues.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 d-flex flex-column gap-2">
      {error && (
        <Alert variant="danger" className="mb-0 py-2">
          <div>{errorText(m, error.failure)}</div>

          <div className="mt-2 d-flex align-items-center gap-2">
            <FailureAction />

            <code className="small text-body-secondary">{error.detail}</code>
          </div>
        </Alert>
      )}

      {setupIssues.length > 0 && (
        <Alert variant="warning" className="mb-0 py-2">
          <div className="fw-bold">{m?.setup.title}</div>

          <ul className="mb-2 ps-4">
            {setupIssues.map((issue, i) => (
              <li key={i}>{issue}</li>
            ))}
          </ul>

          <Button variant="primary" size="sm" href={RECORDER_INTENT_URL}>
            <FaExternalLinkAlt /> {m?.setup.open}
          </Button>
        </Alert>
      )}
    </div>
  );
}
