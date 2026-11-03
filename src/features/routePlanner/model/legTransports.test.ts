import type { TransportType } from '@shared/transportTypeDefs.js';
import { describe, expect, it } from 'vitest';
import type { RoutePoint } from './actions.js';
import {
  applyTransport,
  legTransports,
  sectionCount,
  type TransportScope,
} from './legTransports.js';

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

describe('applyTransport', () => {
  // Legs car, car, hiking, hiking; the next leg is hiking.
  const route = [point('car'), point('car'), point(), point(), point()];

  const apply = (scope: TransportScope, points = route) => {
    const result = applyTransport(points, 'hiking', 'foot', scope);

    return [
      legTransports(result.points, result.transportType),
      result.transportType,
    ];
  };

  it('changes every leg and the next one for the whole route', () => {
    expect(apply({ type: 'route' })).toEqual([
      ['foot', 'foot', 'foot', 'foot'],
      'foot',
    ]);
  });

  it('changes the trailing section and the next leg', () => {
    expect(apply({ type: 'last-section' })).toEqual([
      ['car', 'car', 'foot', 'foot'],
      'foot',
    ]);
  });

  it('changes only the next leg when the last leg was set apart', () => {
    expect(
      apply({ type: 'last-section' }, [point(), point('manual'), point()]),
    ).toEqual([['hiking', 'manual'], 'foot']);
  });

  it('keeps the drawn legs for the next leg', () => {
    expect(apply({ type: 'next' })).toEqual([
      ['car', 'car', 'hiking', 'hiking'],
      'foot',
    ]);
  });

  it('changes one leg without touching the next one', () => {
    expect(apply({ type: 'leg', leg: 3 })).toEqual([
      ['car', 'car', 'hiking', 'foot'],
      'hiking',
    ]);
  });

  it('changes a section, carrying the next leg when it ends the route', () => {
    expect(apply({ type: 'section', leg: 0 })).toEqual([
      ['foot', 'foot', 'hiking', 'hiking'],
      'hiking',
    ]);

    expect(apply({ type: 'section', leg: 2 })).toEqual([
      ['car', 'car', 'foot', 'foot'],
      'foot',
    ]);
  });

  it('changes every leg sharing the transport', () => {
    expect(
      apply({ type: 'same-transport', leg: 0 }, [
        point('car'),
        point(),
        point('car'),
        point(),
      ]),
    ).toEqual([['foot', 'hiking', 'foot'], 'hiking']);
  });

  it('stores a transport only where a leg differs from the next one', () => {
    expect(
      applyTransport(route, 'hiking', 'car', { type: 'next' }).points.map(
        (p) => p.transport,
      ),
    ).toEqual([undefined, undefined, 'hiking', 'hiking', undefined]);
  });
});

describe('sectionCount', () => {
  it('counts separate runs of a transport', () => {
    expect(sectionCount(['car', 'car', 'foot', 'car'], 'car')).toBe(2);

    expect(sectionCount(['car', 'car', 'foot', 'car'], 'foot')).toBe(1);
  });
});
