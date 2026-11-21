import clsx from 'clsx';
import type { CSSProperties } from 'react';
import { gustScale, type Hazard } from '../model/hazard.js';
import classes from './hazard.module.css';

export function hazardClass(hazard: Hazard | null): string | undefined {
  return hazard ? classes[hazard] : undefined;
}

const AMBER_HUE = 40;

/**
 * A gust's colour, fading from grey into amber and on to red as it grows,
 * rather than jumping at a threshold; bold once it is dangerous.
 */
export function gustLook(gust: number | null): {
  className: string;
  style?: CSSProperties;
} {
  const scale = gustScale(gust);

  if (!scale) {
    return { className: 'text-muted' };
  }

  return {
    className: clsx(classes.gust, scale.dangerous && 'fw-semibold'),
    style: {
      '--hue': `${AMBER_HUE * (1 - scale.red)}`,
      '--sat': `${Math.round(scale.colour * 85)}%`,
    } as CSSProperties,
  };
}
