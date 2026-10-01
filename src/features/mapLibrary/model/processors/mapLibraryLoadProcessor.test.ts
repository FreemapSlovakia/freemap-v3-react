import { init } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import type { MapBody } from '@shared/mapDefinitions.js';
import { mapIndexById } from '@shared/mapLibrary/mapIndex.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mapLibraryBodiesLoaded, mapLibraryLoadRetry } from '../actions.js';
import { mapLibraryInitialState } from '../reducer.js';
import { mapLibraryLoadProcessor } from './mapLibraryLoadProcessor.js';

const entry = mapIndexById['WKA'] as { load: () => Promise<MapBody> };

const realLoad = entry.load;

afterEach(() => {
  entry.load = realLoad;

  vi.useRealTimers();
});

describe('mapLibraryLoadProcessor', () => {
  it('tries a failed map again and toasts when it is on the map', async () => {
    vi.useFakeTimers();

    // Only WKA is wanted: everything else is uninstalled and off.
    const layersSettings = Object.fromEntries(
      Object.keys(mapIndexById).map((type) => [
        type,
        { installed: type === 'WKA' },
      ]),
    );

    const state = {
      map: { layers: ['WKA'], layersSettings, cachedMaps: [] },
      mapLibrary: mapLibraryInitialState,
    } as unknown as RootState;

    const body = await realLoad();

    entry.load = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(body);

    const dispatched: { type: string; payload?: unknown }[] = [];

    const run = (action: { type: string }) =>
      mapLibraryLoadProcessor.handle!({
        getState: () => state,
        dispatch: (a: { type: string }) => {
          dispatched.push(a);

          return a;
        },
        action,
      } as never);

    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    run(init());

    await vi.runOnlyPendingTimersAsync();

    expect(dispatched.map((a) => a.type)).toContain('TOASTS_ADD');

    expect(dispatched.map((a) => a.type)).toContain(mapLibraryLoadRetry.type);

    run(mapLibraryLoadRetry());

    await vi.runOnlyPendingTimersAsync();

    expect(dispatched.at(-1)).toEqual(mapLibraryBodiesLoaded({ WKA: body }));
  });
});
