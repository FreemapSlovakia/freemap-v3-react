import type { RootState } from '@app/store/store.js';
import { afterEach, describe, expect, it } from 'vitest';
import type { SearchResult } from './actions.js';
import { pickShowsDetailsSelector } from './selectors.js';

const id = { type: 'osm', elementType: 'node', id: 1 } as const;

const nameHit = { id, source: 'nominatim-forward' } as SearchResult;

const state = (shown: SearchResult[], previewId: unknown = null) =>
  ({ search: { selectedResults: shown, previewId } }) as unknown as RootState;

afterEach(() => {
  window.fmEmbedded = false;
});

describe('pickShowsDetailsSelector', () => {
  it('a name hit not kept comes without its details', () => {
    expect(pickShowsDetailsSelector(state([]), nameHit)).toBe(false);

    expect(pickShowsDetailsSelector(state([nameHit], id), nameHit)).toBe(false);
  });

  it('a kept name hit, or any other hit, shows them', () => {
    expect(pickShowsDetailsSelector(state([nameHit]), nameHit)).toBe(true);

    expect(
      pickShowsDetailsSelector(state([]), { ...nameHit, source: 'osm' }),
    ).toBe(true);
  });

  it('everything shows them in an embed', () => {
    window.fmEmbedded = true;

    expect(pickShowsDetailsSelector(state([]), nameHit)).toBe(true);
  });
});
