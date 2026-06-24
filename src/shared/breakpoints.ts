import { useSyncExternalStore } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export function getMinWidthForBreakpoint(breakpoint: Breakpoint): number {
  switch (breakpoint) {
    case 'xs':
      return 0;
    case 'sm':
      return 576;
    case 'md':
      return 768;
    case 'lg':
      return 992;
    case 'xl':
      return 1200;
    case 'xxl':
      return 1400;
  }
}

export type BreakpointMatches = Record<Exclude<Breakpoint, 'xs'>, boolean>;

const UP: Exclude<Breakpoint, 'xs'>[] = ['sm', 'md', 'lg', 'xl', 'xxl'];

// One shared MediaQueryList per breakpoint, so any number of components observe
// the breakpoints through a single set of listeners rather than each creating
// its own. Lazily created and ref-counted by `subscribe`.
const mqls = new Map<Breakpoint, MediaQueryList>();

function mqlFor(bp: Exclude<Breakpoint, 'xs'>): MediaQueryList | null {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return null;
  }

  let mql = mqls.get(bp);

  if (!mql) {
    mql = window.matchMedia(`(min-width: ${getMinWidthForBreakpoint(bp)}px)`);

    mqls.set(bp, mql);
  }

  return mql;
}

const listeners = new Set<() => void>();

// Cached so `useSyncExternalStore` sees a stable reference between changes.
let snapshot: BreakpointMatches | null = null;

function compute(): BreakpointMatches {
  return {
    sm: mqlFor('sm')?.matches ?? false,
    md: mqlFor('md')?.matches ?? false,
    lg: mqlFor('lg')?.matches ?? false,
    xl: mqlFor('xl')?.matches ?? false,
    xxl: mqlFor('xxl')?.matches ?? false,
  };
}

function onChange() {
  snapshot = compute();

  for (const listener of listeners) {
    listener();
  }
}

function subscribe(callback: () => void): () => void {
  if (listeners.size === 0) {
    for (const bp of UP) {
      mqlFor(bp)?.addEventListener('change', onChange);
    }

    snapshot = compute();
  }

  listeners.add(callback);

  return () => {
    listeners.delete(callback);

    if (listeners.size === 0) {
      for (const bp of UP) {
        mqlFor(bp)?.removeEventListener('change', onChange);
      }

      snapshot = null;
    }
  };
}

const SERVER_SNAPSHOT: BreakpointMatches = {
  sm: false,
  md: false,
  lg: false,
  xl: false,
  xxl: false,
};

function getSnapshot(): BreakpointMatches {
  return (snapshot ??= compute());
}

function getServerSnapshot(): BreakpointMatches {
  return SERVER_SNAPSHOT;
}

/**
 * Reactive `min-width` matches for every breakpoint above `xs`, sharing one set
 * of `matchMedia` listeners across all callers.
 */
export function useBreakpointMatches(): BreakpointMatches {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
