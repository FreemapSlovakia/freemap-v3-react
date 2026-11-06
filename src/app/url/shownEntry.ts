// The history entry the app's state matches, kept so a Back or Forward the
// user refuses can be undone: the browser has moved by the time it asks.

const current = () => ({
  href: window.location.href,
  state: history.state as unknown,
});

let shown = current();

let held = false;

export function noteShownEntry(): void {
  // Frozen while the user is asked: writes then land on the entry left.
  if (!held) {
    shown = current();
  }
}

/** Keeps the entry shown as it is until released, whatever is written. */
export function holdShownEntry(hold: boolean): void {
  held = hold;
}

/** Whether the browser is on another entry than the one the app shows. */
export function awayFromShownEntry(): boolean {
  return window.location.href !== shown.href;
}

/**
 * Back on the entry shown, as a new entry: going back with `history.go` needs
 * every entry numbered, which those the browser makes itself are not.
 */
export function restoreShownEntry(): void {
  history.pushState(shown.state, '', shown.href);
}

// Every writer, not only `urlProcessor`: snapshot keys and the session stash
// replace the entry's state too.
for (const method of ['pushState', 'replaceState'] as const) {
  const write = history[method].bind(history);

  history[method] = (...args: Parameters<History['pushState']>) => {
    write(...args);

    noteShownEntry();
  };
}
