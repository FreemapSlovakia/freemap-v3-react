import {
  isUrlUpdatingEnabled,
  setUrlUpdatingEnabled,
} from '@app/url/urlUpdating.js';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useDragCommit } from './useDragCommit.js';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

function mount() {
  const commits: string[] = [];

  let handlers!: ReturnType<typeof useDragCommit<string>>;

  function Probe() {
    handlers = useDragCommit<string>((value) => commits.push(value));

    return null;
  }

  const root = createRoot(document.createElement('div'));

  act(() => root.render(<Probe />));

  return {
    commits,
    handlers: () => handlers,
    rerender: () => act(() => root.render(<Probe />)),
    unmount: () => act(() => root.unmount()),
  };
}

describe('useDragCommit', () => {
  beforeEach(() => setUrlUpdatingEnabled(true));

  afterEach(() => setUrlUpdatingEnabled(true));

  it('suspends history for a drag and commits its last value once more', () => {
    const { commits, handlers } = mount();

    handlers().onDragStart();

    expect(isUrlUpdatingEnabled()).toBe(false);

    handlers().change('a');
    handlers().change('b');
    handlers().onDragEnd();

    expect(isUrlUpdatingEnabled()).toBe(true);
    expect(commits).toEqual(['a', 'b', 'b']);
  });

  it('does not commit an earlier drag again', () => {
    const { commits, handlers } = mount();

    handlers().onDragStart();
    handlers().change('a');
    handlers().onDragEnd();

    handlers().onDragStart();
    handlers().onDragEnd();

    expect(commits).toEqual(['a', 'a']);
  });

  it('leaves the flag alone when it suspended nothing', () => {
    const { handlers } = mount();

    setUrlUpdatingEnabled(false);

    handlers().onDragEnd();

    expect(isUrlUpdatingEnabled()).toBe(false);
  });

  it('puts the flag back as it found it, not on', () => {
    const { commits, handlers } = mount();

    // As a Back/Forward restore leaves it while it runs.
    setUrlUpdatingEnabled(false);

    handlers().onDragStart();
    handlers().change('a');
    handlers().onDragEnd();

    expect(isUrlUpdatingEnabled()).toBe(false);
    expect(commits).toEqual(['a', 'a']);
  });

  it('puts the flag back, committing nothing more, when unmounted mid-drag', () => {
    const { commits, handlers, unmount } = mount();

    handlers().onDragStart();
    handlers().change('a');

    unmount();

    expect(isUrlUpdatingEnabled()).toBe(true);
    expect(commits).toEqual(['a']);
  });

  it('hands out the same handlers on every render', () => {
    const { handlers, rerender } = mount();

    const first = handlers();

    rerender();

    expect(handlers()).toBe(first);
  });
});
