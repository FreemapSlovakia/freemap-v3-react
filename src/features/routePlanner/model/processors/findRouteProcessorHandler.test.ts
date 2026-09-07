import { describe, expect, it } from 'vitest';
import { splitByPushing } from './findRouteProcessorHandler.js';

describe('splitByPushing', () => {
  // A dismount runs a point or two where an instruction runs tens, so the whole
  // instruction is never inside one — which is why the pushed stretch has to
  // become a step of its own to be drawn dotted.
  it('cuts an instruction around the stretch that must be walked', () => {
    expect(splitByPushing(4, 7, [[5, 6]])).toEqual([
      { from: 4, to: 5, pushing: false },
      { from: 5, to: 6, pushing: true },
      { from: 6, to: 7, pushing: false },
    ]);
  });

  it('leaves an instruction that needs no dismount whole', () => {
    expect(splitByPushing(9, 64, [[5, 6]])).toEqual([
      { from: 9, to: 64, pushing: false },
    ]);
  });

  it('marks an instruction that is entirely pushed', () => {
    expect(splitByPushing(10, 20, [[8, 25]])).toEqual([
      { from: 10, to: 20, pushing: true },
    ]);
  });

  it('handles a dismount reaching past one end', () => {
    expect(splitByPushing(10, 20, [[5, 15]])).toEqual([
      { from: 10, to: 15, pushing: true },
      { from: 15, to: 20, pushing: false },
    ]);
  });

  it('yields one run when there is nothing to push', () => {
    expect(splitByPushing(0, 12, [])).toEqual([
      { from: 0, to: 12, pushing: false },
    ]);
  });

  // `FINISH` and `REACHED_VIA` arrive as `[n, n]`. Cutting an empty interval
  // yields no step at all, which the leg joining reads as a missing connector.
  it('still yields a step for a zero-length interval', () => {
    expect(splitByPushing(394, 394, [])).toEqual([
      { from: 394, to: 394, pushing: false },
    ]);

    expect(splitByPushing(5, 5, [[4, 8]])).toEqual([
      { from: 5, to: 5, pushing: true },
    ]);
  });
});
