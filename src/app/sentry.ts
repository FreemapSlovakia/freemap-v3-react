import { captureException, captureMessage, init } from '@sentry/browser';
import { denyUrls, ignoreErrors } from './sentryFilters.js';

// A separate entry loaded before `main`, so an error that keeps `main` from even
// parsing is still reported. Bundled, not from a CDN, which blockers list.
const dsn = process.env['SENTRY_DSN'];

if (dsn && typeof Object.hasOwn !== 'undefined') {
  init({
    dsn,
    // Proxied by nginx to Sentry, which filter lists block by URL.
    tunnel: '/api/fm-report',
    tracesSampleRate: 0,
    ignoreErrors,
    denyUrls,
  });

  // Only what the app calls; exposing the namespace defeats tree-shaking.
  window.Sentry = { captureException, captureMessage };
}
