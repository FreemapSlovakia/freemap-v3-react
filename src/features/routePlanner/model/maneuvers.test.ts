import { describe, expect, it } from 'vitest';
import type { Step } from './actions.js';
import { maneuverOf } from './maneuvers.js';

const step = (
  type: Step['maneuver']['type'],
  modifier?: Step['maneuver']['modifier'],
  connector?: true,
) => ({ maneuver: { type, modifier }, connector });

describe('maneuverOf', () => {
  it('turns by the modifier', () => {
    expect(maneuverOf(step('turn', 'left'))).toBe('left');
    expect(maneuverOf(step('end of road', 'sharp right'))).toBe('sharpRight');
    expect(maneuverOf(step('turn', 'straight'))).toBe('straight');
    expect(maneuverOf(step('new name', 'straight'))).toBe('continue');
    expect(maneuverOf(step('continue'))).toBe('continue');
  });

  it('names forks, ramps and roundabouts', () => {
    expect(maneuverOf(step('fork', 'slight left'))).toBe('keepLeft');
    expect(maneuverOf(step('fork', 'right'))).toBe('keepRight');
    expect(maneuverOf(step('off ramp', 'right'))).toBe('rampOff');
    expect(maneuverOf(step('rotary'))).toBe('roundabout');
    expect(maneuverOf(step('exit roundabout'))).toBe('exitRoundabout');
  });

  it('leaves out arrivals, notices and joints', () => {
    expect(maneuverOf(step('arrive'))).toBeUndefined();
    expect(maneuverOf(step('notification'))).toBeUndefined();
    expect(maneuverOf(step('depart', undefined, true))).toBeUndefined();
  });
});
