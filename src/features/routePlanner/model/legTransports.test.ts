import type { TransportType } from '@shared/transportTypeDefs.js';
import { describe, expect, it } from 'vitest';
import type { RoutePoint } from './actions.js';
import { legTransports } from './legTransports.js';

const point = (transport?: TransportType): RoutePoint =>
  ({ lat: 48, lon: 17, ...(transport ? { transport } : {}) }) as RoutePoint;

describe('legTransports', () => {
  it('names one transport per leg, not per point', () => {
    expect(legTransports([point(), point(), point()], 'hiking')) //
      .toEqual(['hiking', 'hiking']);
  });

  it('takes each leg from the point it starts at', () => {
    expect(
      legTransports([point('car'), point('foot-osrm'), point()], 'hiking'),
    ).toEqual(['car', 'foot-osrm']);
  });

  it('ignores the last point, which starts no leg', () => {
    expect(legTransports([point(), point('car')], 'hiking')) //
      .toEqual(['hiking']);
  });

  it('has no legs below two points', () => {
    expect(legTransports([point()], 'hiking')).toEqual([]);

    expect(legTransports([], 'hiking')).toEqual([]);
  });
});
