import { describe, expect, it } from 'vitest';
import { toposcopeInitialState } from './model/reducer.js';
import { parseToposcope, serializeToposcope } from './toposcopeUrl.js';

const { pickingCenter: _, ...defaults } = toposcopeInitialState;

describe('serializeToposcope', () => {
  it('writes nothing for an untouched dial', () => {
    expect(serializeToposcope(toposcopeInitialState)).toBe('');
  });

  it('writes only what differs from the defaults', () => {
    const s = serializeToposcope({
      ...toposcopeInitialState,
      scale: 150,
      preventUpturnedText: false,
    });

    expect(s).toBe('S150\x1eU0');
  });

  it('writes a line template that was changed, and one that was emptied', () => {
    const s = serializeToposcope({
      ...toposcopeInitialState,
      line1: '{label} ({azimuth})',
      line2: '',
    });

    expect(s).toBe('A{label} ({azimuth})\x1eB');
  });

  it('writes an inscription cleared of its default', () => {
    const s = serializeToposcope({
      ...toposcopeInitialState,
      inscriptions: ['Kráľova hoľa', '', '', ''],
    });

    expect(s).toBe('0Kráľova hoľa\x1e1\x1e3');
  });
});

describe('parseToposcope', () => {
  it('reads back everything a round trip wrote', () => {
    const state = {
      ...toposcopeInitialState,
      inscriptions: ['a', 'b', '', 'd'],
      innerCircleRadius: 40,
      scale: 250,
      preventUpturnedText: false,
      line1: '{elevation}',
      line2: '',
    };

    const { pickingCenter: _pc, ...expected } = state;

    expect(parseToposcope(serializeToposcope(state))).toEqual(expected);
  });

  it('falls back to the defaults for an absent or empty param', () => {
    expect(parseToposcope('')).toEqual(defaults);
  });

  it('ignores a scale out of range or not a number', () => {
    expect(parseToposcope('S9999\x1eR-1').scale).toBe(defaults.scale);
    expect(parseToposcope('Sx').scale).toBe(defaults.scale);
  });

  it('ignores a code it does not know', () => {
    expect(parseToposcope('Z1\x1eS150').scale).toBe(150);
  });
});
