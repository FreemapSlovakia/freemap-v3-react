import { captureException, captureMessage, init } from '@sentry/browser';

// A separate entry loaded before `main`, so an error that keeps `main` from even
// parsing is still reported. Bundled, not from a CDN, which blockers list.
const dsn = process.env['SENTRY_DSN'];

if (dsn && typeof Object.hasOwn !== 'undefined') {
  init({
    dsn,
    // Proxied by nginx to Sentry, which filter lists block by URL.
    tunnel: '/api/fm-report',
    tracesSampleRate: 0,
    ignoreErrors: [
      // deliberate request cancellations (e.g. a new search supersedes a pending one)
      /AbortError/,
      // injected crypto-wallet / browser-extension JSON-RPC providers
      /Internal JSON-RPC error/,
      /promise rejection with keys: code, message/,
      // Background Sync API quirks across browsers
      /Attempted to register a sync event/,
      // JS bridges injected by third-party in-app browsers (iOS WKWebView
      // and Android WebView), which break when their host view goes away
      /window\.webkit\.messageHandlers/,
      /Java object is gone/,
      // ubiquitous browser noise
      /ResizeObserver loop/,
      'Non-Error promise rejection captured',
    ],
    denyUrls: [
      /^chrome-extension:\/\//,
      /^moz-extension:\/\//,
      /^safari-web-extension:\/\//,
    ],
  });

  // Only what the app calls; exposing the namespace defeats tree-shaking.
  window.Sentry = { captureException, captureMessage };
}
