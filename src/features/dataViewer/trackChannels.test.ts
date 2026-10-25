import { describe, expect, it } from 'vitest';
import {
  channelSummaries,
  hasChannel,
  withChannelKeys,
} from './trackChannels.js';
import type { TrackLine } from './trackSelection.js';

const track = (coordinateProperties: Record<string, unknown>): TrackLine => ({
  type: 'Feature',
  properties: { name: 'Ride', coordinateProperties },
  geometry: {
    type: 'MultiLineString',
    coordinates: [
      [
        [0, 0],
        [1, 0],
      ],
      [[2, 0]],
    ],
  },
});

const keyed = (line: TrackLine, keys: string[]) =>
  withChannelKeys(line, line.properties ?? {}, keys);

describe('channelSummaries', () => {
  it('counts the points each channel has a value at', () => {
    expect(channelSummaries(track({ heart: [[100, null], [null]] }))).toEqual([
      { key: 'heart', filled: 1, total: 3 },
    ]);
  });
});

describe('withChannelKeys', () => {
  it('adds a channel empty at every point, laid out per segment', () => {
    expect(keyed(track({}), ['cads'])).toMatchObject({
      coordinateProperties: { cads: [[null, null], [null]] },
    });
  });

  it('keeps a listed channel as it is', () => {
    expect(
      keyed(track({ heart: [[1, 2], [3]] }), ['heart', 'cads'])[
        'coordinateProperties'
      ],
    ).toEqual({ heart: [[1, 2], [3]], cads: [[null, null], [null]] });
  });

  it('drops an unlisted one, and the table with the last', () => {
    const out = keyed(track({ heart: [[1, 2], [3]] }), []);

    expect(out).not.toHaveProperty('coordinateProperties');

    expect(out).toMatchObject({ name: 'Ride' });
  });

  it('drops times spelled at the root too', () => {
    const line: TrackLine = {
      ...track({}),
      properties: { coordTimes: [['a', 'b'], ['c']] },
    };

    expect(keyed(line, [])).not.toHaveProperty('coordTimes');
  });

  it('leaves a misaligned array alone', () => {
    const line = track({ notes: ['too', 'short'] });

    expect(hasChannel(line, 'notes')).toBe(true);

    expect(keyed(line, [])).toMatchObject({
      coordinateProperties: { notes: ['too', 'short'] },
    });
  });
});
