import {
  captureException,
  captureMessage,
  init,
  lastEventId,
} from '@sentry/browser';
import { denyUrls, ignoreErrors, isBotEvent } from './sentryFilters.js';

// A separate entry loaded before `main`, so an error that keeps `main` from even
// parsing is still reported. Bundled, not from a CDN, which blockers list.
const dsn = process.env['SENTRY_DSN'];

// Automated browsers (crawlers) only add noise; headless Chrome without a
// configured time zone reports `Etc/Unknown`.
if (
  dsn &&
  typeof Object.hasOwn !== 'undefined' &&
  !navigator.webdriver &&
  Intl.DateTimeFormat().resolvedOptions().timeZone !== 'Etc/Unknown'
) {
  init({
    dsn,
    // Proxied by nginx to Sentry, which filter lists block by URL.
    tunnel: '/api/fm-report',
    tracesSampleRate: 0,
    ignoreErrors,
    denyUrls,
    beforeSend: (event) => (isBotEvent(event) ? null : event),
  });

  // Only what the app calls; exposing the namespace defeats tree-shaking.
  window.Sentry = { captureException, captureMessage, lastEventId };
}
