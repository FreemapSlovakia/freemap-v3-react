import { poiSpec } from '@shared/drawingIcons.js';
import { describe, expect, it } from 'vitest';
import {
  garminSymToIconSpec,
  iconSpecToGarminSym,
} from './garminSymMapping.js';

describe('Gas Station', () => {
  it('imports as fuel although charging stations export as it', () => {
    expect(iconSpecToGarminSym(poiSpec('charging_station_bicycle'))).toBe(
      'Gas Station',
    );

    expect(garminSymToIconSpec('Gas Station')).toBe(poiSpec('fuel'));
  });
});
