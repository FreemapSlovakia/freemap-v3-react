import { describe, expect, it } from 'vitest';
import {
  type ResolvedToast,
  toastsAdd,
  toastsRemove,
  toastsRestartTimeout,
  toastsSetPinned,
  toastsStopTimeout,
} from './actions.js';
import { toastsReducer } from './reducer.js';

/** Pure reducer tests for the toasts slice (keyed by toast id). */

const initial = { toasts: {} };

// toastsAdd is a prepared creator that fills defaults; an explicit id keeps the
// test deterministic.
const add = (id: string, extra?: Partial<ResolvedToast>) =>
  toastsAdd({ id, ...extra } as never);

describe('toastsReducer', () => {
  it('add stores the resolved toast under its id', () => {
    const next = toastsReducer(initial, add('a'));

    expect(next.toasts['a'].id).toBe('a');
  });

  it('re-adding an existing id moves it to the end (reorder)', () => {
    let state = toastsReducer(initial, add('a'));
    state = toastsReducer(state, add('b'));

    // Re-add 'a' → it should now be last in insertion order.
    state = toastsReducer(state, add('a'));

    expect(Object.keys(state.toasts)).toEqual(['b', 'a']);
  });

  it('remove deletes the toast by id', () => {
    let state = toastsReducer(initial, add('a'));
    state = toastsReducer(state, add('b'));

    state = toastsReducer(state, toastsRemove('a'));

    expect(Object.keys(state.toasts)).toEqual(['b']);
  });

  it('stopTimeout clears timeoutSince', () => {
    let state = toastsReducer(initial, add('a', { timeoutSince: 1000 }));

    state = toastsReducer(state, toastsStopTimeout('a'));

    expect(state.toasts['a'].timeoutSince).toBeUndefined();
  });

  it('setPinned flags the toast', () => {
    let state = toastsReducer(initial, add('a'));

    state = toastsReducer(state, toastsSetPinned({ id: 'a', pinned: true }));

    expect(state.toasts['a'].pinned).toBe(true);
  });

  it('re-adding keeps a killed countdown killed', () => {
    let state = toastsReducer(initial, add('a', { timeout: 5000 }));

    state = toastsReducer(state, toastsSetPinned({ id: 'a', pinned: true }));
    state = toastsReducer(state, add('a', { timeout: 5000 }));

    expect(state.toasts['a'].pinned).toBe(true);
    expect(state.toasts['a'].timeoutSince).toBeUndefined();
  });

  it('re-adding without a timeout keeps the countdown killed', () => {
    let state = toastsReducer(initial, add('a', { timeout: 5000 }));

    state = toastsReducer(state, toastsSetPinned({ id: 'a', pinned: true }));
    state = toastsReducer(state, add('a'));

    expect(state.toasts['a'].pinned).toBe(true);
  });

  it('timeout actions tolerate a toast that is already gone', () => {
    const state = toastsReducer(initial, add('a'));

    expect(() =>
      toastsReducer(state, toastsSetPinned({ id: 'b', pinned: true })),
    ).not.toThrow();

    expect(() => toastsReducer(state, toastsStopTimeout('b'))).not.toThrow();

    expect(() =>
      toastsReducer(state, toastsRestartTimeout({ id: 'b', timeoutSince: 1 })),
    ).not.toThrow();
  });

  it('restartTimeout sets timeoutSince', () => {
    let state = toastsReducer(initial, add('a'));

    state = toastsReducer(
      state,
      toastsRestartTimeout({ id: 'a', timeoutSince: 5000 }),
    );

    expect(state.toasts['a'].timeoutSince).toBe(5000);
  });
});
