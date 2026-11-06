/** Each says whether leaving now would lose something. */
const reasons = new Set<() => boolean>();

/** Registers a reason to ask before the page goes; returns its removal. */
export function addLeaveReason(reason: () => boolean): () => void {
  reasons.add(reason);

  return () => {
    reasons.delete(reason);
  };
}

// Set across a navigation that hands off to an app or a download: the browser
// fires `beforeunload` for it too, though the page stays. Held for a second,
// as the event need not come in the same task as the navigation.
let handingOff = false;

let handOffTimer: ReturnType<typeof setTimeout> | undefined;

function handOff() {
  handingOff = true;

  clearTimeout(handOffTimer);

  handOffTimer = setTimeout(() => {
    handingOff = false;
  }, 1000);
}

/** `location.href = url` for a URL an app or a download takes, not a page. */
export function navigateWithoutLeaving(url: string): void {
  handOff();

  window.location.href = url;
}

/**
 * Has the browser ask before the page goes while any reason holds. The browser
 * words the prompt; a custom text is ignored.
 */
export function attachLeaveGuard(): void {
  // Links to `geo:`, `intent:`, `mailto:` … open an app, never another page.
  document.addEventListener(
    'click',
    (e) => {
      const a =
        e.target instanceof Element ? e.target.closest('a[href]') : null;

      if (
        a instanceof HTMLAnchorElement &&
        a.protocol !== 'http:' &&
        a.protocol !== 'https:'
      ) {
        handOff();
      }
    },
    true,
  );

  window.addEventListener('beforeunload', (e) => {
    if (!handingOff && reasons.values().some((reason) => reason())) {
      e.preventDefault();

      // Chromium before 119 and older WebViews prompt only on this.
      e.returnValue = '';
    }
  });
}
