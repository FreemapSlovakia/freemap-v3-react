import type { Step } from './actions.js';

const MANEUVERS = [
  'depart',
  'continue',
  'straight',
  'left',
  'right',
  'slightLeft',
  'slightRight',
  'sharpLeft',
  'sharpRight',
  'uturn',
  'keepLeft',
  'keepRight',
  'merge',
  'rampOn',
  'rampOff',
  'roundabout',
  'exitRoundabout',
] as const;

export type Maneuver = (typeof MANEUVERS)[number];

const BY_MODIFIER: Record<
  NonNullable<Step['maneuver']['modifier']>,
  Maneuver
> = {
  uturn: 'uturn',
  'sharp right': 'sharpRight',
  'slight right': 'slightRight',
  right: 'right',
  'sharp left': 'sharpLeft',
  'slight left': 'slightLeft',
  left: 'left',
  straight: 'straight',
};

/** Whether the maneuver leans left, for the icons drawn in either hand. */
export function leansLeft(step: Pick<Step, 'maneuver'>): boolean {
  return step.maneuver.modifier?.includes('left') ?? false;
}

/**
 * What the itinerary says a step asks for; undefined for one it leaves out:
 * an arrival (the waypoint's row says it), a notice, a joint between legs.
 */
export function maneuverOf(
  step: Pick<Step, 'maneuver' | 'connector'>,
): Maneuver | undefined {
  const { type, modifier } = step.maneuver;

  if (step.connector || type === 'arrive' || type === 'notification') {
    return undefined;
  }

  switch (type) {
    case 'depart':
      return 'depart';

    case 'roundabout':
    case 'rotary':
    case 'roundabout turn':
      return 'roundabout';

    case 'exit roundabout':
    case 'exit rotary':
      return 'exitRoundabout';

    case 'fork':
      return modifier === undefined || modifier === 'straight'
        ? 'continue'
        : leansLeft(step)
          ? 'keepLeft'
          : 'keepRight';

    case 'merge':
      return 'merge';

    case 'on ramp':
      return 'rampOn';

    case 'off ramp':
      return 'rampOff';

    default:
      return modifier === undefined ||
        (modifier === 'straight' && type !== 'turn')
        ? 'continue'
        : BY_MODIFIER[modifier];
  }
}
