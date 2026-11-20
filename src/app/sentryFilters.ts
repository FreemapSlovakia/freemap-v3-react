import type { ErrorEvent } from '@sentry/browser';

// Shared by the Sentry init and the error toast: the SDK hands out an event id
// before these filters drop the event, so a toast would show a dead ticket id.
export const ignoreErrors: (string | RegExp)[] = [
  // deliberate request cancellations (e.g. a new search supersedes a pending one)
  /AbortError/,
  // injected crypto-wallet / browser-extension JSON-RPC providers
  /Internal JSON-RPC error/,
  /window\.ethereum/,
  /promise rejection with keys: code, message/,
  // Background Sync API quirks across browsers
  /Attempted to register a sync event/,
  // JS bridges injected by third-party in-app browsers (iOS WKWebView
  // and Android WebView), which break when their host view goes away
  /window\.webkit\.messageHandlers/,
  /Java object is gone/,
  // Firefox for iOS injected scripts
  /__firefox__/,
  // ubiquitous browser noise
  /ResizeObserver loop/,
  'Non-Error promise rejection captured',
];

export const denyUrls: RegExp[] = [
  /^chrome-extension:\/\//,
  /^moz-extension:\/\//,
  /^safari-web-extension:\/\//,
];

// The obscura headless crawler; its errors mostly throw from app code, which
// `denyUrls` can't catch since it checks only the throwing frame.
const BOT_FRAME = /^<obscura:/;

/** Whether any stack frame of the event comes from a known bot runtime. */
export function isBotEvent(event: ErrorEvent): boolean {
  return Boolean(
    event.exception?.values?.some((value) =>
      value.stacktrace?.frames?.some((frame) =>
        BOT_FRAME.test(frame.filename ?? ''),
      ),
    ),
  );
}

function matches(pattern: string | RegExp, text: string) {
  return typeof pattern === 'string'
    ? text.includes(pattern)
    : pattern.test(text);
}

/** Whether Sentry would drop this error, mirroring its message and URL checks. */
export function isIgnoredError(
  error: unknown,
  message?: string,
  filename?: string,
): boolean {
  const texts = [message ?? ''];

  if (error instanceof Error) {
    texts.push(error.message, `${error.name}: ${error.message}`);
  } else if (typeof error === 'string') {
    texts.push(error);
  }

  return (
    texts.some((text) =>
      ignoreErrors.some((pattern) => matches(pattern, text)),
    ) ||
    (filename !== undefined &&
      denyUrls.some((pattern) => pattern.test(filename)))
  );
}
