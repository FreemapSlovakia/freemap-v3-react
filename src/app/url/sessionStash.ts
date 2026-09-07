import storage from 'local-storage-fallback';
import z from 'zod';

/** localStorage key holding the URL the last session ended on. */
const STORAGE_KEY = 'fm.lastUrl';

// A relaunch minutes or hours later is a resume; opening the app the next day
// is a fresh start, and nobody expects yesterday's map back.
const MAX_AGE_MS = 12 * 60 * 60 * 1000;

// Display modes that mean a window of the app's own rather than a browser tab.
// Matched by name because an unknown mode must not match: `(display-mode:
// browser)` negated would call every browser without the feature standalone.
const OWN_WINDOW_MODES = [
  'standalone',
  'minimal-ui',
  'fullscreen',
  'window-controls-overlay',
];

const StashSchema = z.object({
  ts: z.number(),
  hash: z.string(),
  sq: z.string().optional(),
  tr: z.literal(true).optional(),
});

/**
 * An app window on a platform that loses its URL: Android restarts the task
 * from its launch intent, iOS relaunches an evicted home-screen app the same
 * way. `navigator.standalone` is iOS's own answer and needs no display mode.
 *
 * Desktop is deliberately out. It restores its windows itself, and a
 * file-handler launch there arrives at a bare `start_url` too (`file_handlers`
 * is desktop-only) — indistinguishable from a relaunch, so restoring would
 * reopen the last session around the file the user asked to open.
 */
function inMobileAppWindow(): boolean {
  return (
    (window.navigator as { standalone?: boolean }).standalone === true ||
    (/Android/i.test(window.navigator.userAgent) &&
      OWN_WINDOW_MODES.some(
        (mode) => window.matchMedia(`(display-mode: ${mode})`).matches,
      ))
  );
}

/**
 * Records where the session is, for {@link restoreStashedUrl}. Called as the
 * page goes away, once any owed URL rewrite has landed.
 *
 * `history.state` goes with the hash: `sq` holds the content of a My Maps
 * session, and `tr` says the entry holds a stored track — a load carrying no
 * flag evicts the track (see `trackStore`), so restoring one without the other
 * would throw it away.
 */
export function stashUrl(): void {
  if (window.fmEmbedded || window.isRobot) {
    return;
  }

  const hash = window.location.hash.slice(1);

  const { sq, tr } = (history.state as { sq?: string; tr?: true } | null) ?? {};

  try {
    if (hash) {
      storage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ts: Date.now(), hash, sq, tr }),
      );
    } else {
      // Ending on a bare URL — back past the first entry — is where the session
      // ended; leaving the old stash would resurrect a URL already left.
      storage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage full or blocked; the session simply won't come back.
  }
}

/**
 * Puts the stashed URL back when the app was relaunched at its bare
 * `start_url`.
 *
 * Android drops an installed PWA's URL when it reclaims the process: the task
 * is restarted from its launch intent, which carries only `start_url`, so the
 * open map and everything else the hash names is lost. A browser tab is spared
 * — the browser restores those itself.
 *
 * Nothing observable distinguishes a relaunch from a first open, so this infers
 * it from an app window arriving with no URL of its own. Must run before
 * `handleLocationChange` reads the URL.
 */
export function restoreStashedUrl(): void {
  if (
    window.fmEmbedded ||
    window.isRobot ||
    window.location.hash ||
    // A share target or `geo:` link: it says where to go.
    window.location.search ||
    !inMobileAppWindow()
  ) {
    return;
  }

  let stashed;

  try {
    const raw = storage.getItem(STORAGE_KEY);

    if (!raw) {
      return;
    }

    stashed = StashSchema.safeParse(JSON.parse(raw));
  } catch {
    return;
  }

  if (!stashed.success || Date.now() - stashed.data.ts > MAX_AGE_MS) {
    return;
  }

  const { hash, sq, tr } = stashed.data;

  try {
    history.replaceState({ sq, tr }, '', `${window.location.pathname}#${hash}`);
  } catch {
    // A URL `replaceState` refuses (see `index.tsx`); the app then just starts
    // where it was launched.
  }
}
