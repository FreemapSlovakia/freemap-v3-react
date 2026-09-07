import { beforeEach, describe, expect, it, vi } from 'vitest';
import { restoreStashedUrl, stashUrl } from './sessionStash.js';

/**
 * The gate on the restore. Getting it wrong is worse than not restoring at all:
 * it would overwrite a URL the user actually asked for — a shared link, a
 * `geo:` launch, the tab the browser just restored by itself.
 */

/** Puts the window in an app window (`display-mode: standalone`) or a tab. */
function setOwnWindow(own: boolean): void {
  window.matchMedia = vi.fn(
    (query: string) =>
      ({
        matches: own && query === '(display-mode: standalone)',
      }) as MediaQueryList,
  );
}

function setPlatform(userAgent: string): void {
  Object.defineProperty(window.navigator, 'userAgent', {
    value: userAgent,
    configurable: true,
  });
}

function goTo(url: string, state: unknown = null): void {
  history.replaceState(state, '', url);
}

beforeEach(() => {
  localStorage.clear();

  setOwnWindow(true);

  setPlatform('Mozilla/5.0 (Linux; Android 14) Chrome/140 Mobile');

  goTo('/#map=10/48.1/17.1&id=abc', { sq: 'tools=draw-lines', tr: true });
});

describe('session stash', () => {
  it('puts the URL and its history state back', () => {
    stashUrl();

    goTo('/');

    restoreStashedUrl();

    expect(location.hash).toBe('#map=10/48.1/17.1&id=abc');

    expect(history.state).toEqual({ sq: 'tools=draw-lines', tr: true });
  });

  it('leaves a browser tab alone', () => {
    stashUrl();

    goTo('/');

    setOwnWindow(false);

    restoreStashedUrl();

    expect(location.hash).toBe('');
  });

  it('leaves a desktop app window alone', () => {
    // Its file-handler launches also arrive at a bare `start_url`, and would be
    // taken for a relaunch.
    stashUrl();

    goTo('/');

    setPlatform('Mozilla/5.0 (X11; Linux x86_64) Chrome/140');

    restoreStashedUrl();

    expect(location.hash).toBe('');
  });

  it('forgets a session that ended on a bare URL', () => {
    stashUrl();

    goTo('/');

    stashUrl();

    restoreStashedUrl();

    expect(location.hash).toBe('');
  });

  it('leaves a URL that says where to go alone', () => {
    stashUrl();

    // The browser restored the tab itself, or the user followed a link.
    goTo('/#map=8/49/20');

    restoreStashedUrl();

    expect(location.hash).toBe('#map=8/49/20');

    // A `geo:` link, share target or file-handler launch.
    goTo('/?geo=geo:48.1,17.1');

    restoreStashedUrl();

    expect(location.hash).toBe('');
  });

  it('gives up on a stale stash', () => {
    stashUrl();

    vi.setSystemTime(Date.now() + 13 * 60 * 60 * 1000);

    goTo('/');

    restoreStashedUrl();

    expect(location.hash).toBe('');

    vi.useRealTimers();
  });

  it('survives a stash that no longer parses', () => {
    localStorage.setItem('fm.lastUrl', '{ not json');

    goTo('/');

    expect(() => restoreStashedUrl()).not.toThrow();

    expect(location.hash).toBe('');
  });
});
