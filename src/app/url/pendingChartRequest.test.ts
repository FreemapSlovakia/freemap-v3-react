import type { ElevationChartTarget } from '@features/elevationChart/model/target.js';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  hasChartRequest,
  holdChartRequest,
  takeChartRequest,
} from './pendingChartRequest.js';

/**
 * When a held `elevation-chart=` expires. Held too briefly it never restores a
 * saved map's drawing — the line it names has no id until the map arrives. Held
 * too long it lies in wait and opens a profile on a line the user draws minutes
 * later, unasked. Both have shipped, hence these.
 */

const line: ElevationChartTarget = { type: 'drawing', lineId: 4 };

const never = () => null;

const always = () => line;

beforeEach(() => {
  // Module state; each case starts from nothing held.
  holdChartRequest(null, false);
});

describe('pending elevation-chart request', () => {
  it('holds nothing when no map is on its way', () => {
    // Everything else the URL describes is already in the store, so a value
    // that doesn't resolve now never will.
    holdChartRequest('drawing/0', false);

    expect(hasChartRequest()).toBe(false);
  });

  it('holds the request while a map is still to arrive', () => {
    holdChartRequest('drawing/0', true);

    expect(hasChartRequest()).toBe(true);
  });

  it('honours a request once, then forgets it', () => {
    holdChartRequest('drawing/0', true);

    expect(takeChartRequest(always, true)).toEqual(line);

    expect(hasChartRequest()).toBe(false);

    expect(takeChartRequest(always, true)).toBeNull();
  });

  it('keeps waiting while the map that would honour it is still coming', () => {
    holdChartRequest('drawing/0', true);

    expect(takeChartRequest(never, true)).toBeNull();

    expect(hasChartRequest()).toBe(true);
  });

  it('gives up once no map is coming, so it cannot seize a later line', () => {
    holdChartRequest('drawing/0', true);

    // The load ended without delivering — failed, disconnected, superseded.
    expect(takeChartRequest(never, false)).toBeNull();

    expect(hasChartRequest()).toBe(false);

    // The line drawn by hand a minute later must not be adopted.
    expect(takeChartRequest(always, false)).toBeNull();
  });

  it('drops a stale hold when a new URL supersedes it', () => {
    holdChartRequest('drawing/0', true);

    holdChartRequest(null, true);

    expect(hasChartRequest()).toBe(false);
  });

  it('does nothing when nothing is held', () => {
    expect(takeChartRequest(always, true)).toBeNull();
  });
});
