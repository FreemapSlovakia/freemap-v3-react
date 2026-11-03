import { featureLabel } from '@shared/featureProperties.js';
import type { Feature, Geometry, Position } from 'geojson';
import { describe, expect, it } from 'vitest';

const labelled = (
  geometry: Geometry,
  label?: string,
  props?: Record<string, string>,
): string =>
  featureLabel({
    geometry,
    properties: {
      ...(label !== undefined && { 'freemap:label': label }),
      ...(props && { 'freemap:props': props }),
    },
  } satisfies Pick<Feature, 'geometry' | 'properties'>) ?? '';

const point: Geometry = { type: 'Point', coordinates: [20.169882, 49.013621] };

/** Several kilometres of due-east line at the equator, to check units by. */
const line: Geometry = {
  type: 'LineString',
  coordinates: [
    [0, 0],
    [0.05, 0],
  ],
};

const ring = (positions: Position[]) => [...positions, positions[0]!];

/** Roughly a hundred metres square, so its area lands in the m² band. */
const outer = ring([
  [0, 0],
  [0.00089932, 0],
  [0.00089932, 0.00090437],
  [0, 0.00090437],
]);

const square: Geometry = { type: 'Polygon', coordinates: [outer] };

describe('a point label', () => {
  it('draws a property the label names', () => {
    expect(labelled(point, '{p:name}', { name: 'Sitno' })).toBe('Sitno');
  });

  it('draws the position, which is computed rather than stored', () => {
    expect(labelled(point, '{location}')).toBe('N 49° 0\' 49"\nE 20° 10\' 12"');
  });

  it('leaves a key it cannot answer as written', () => {
    expect(labelled(point, '{nmae}')).toBe('{nmae}');
  });

  it('needs the prefix for a property, so a bare name is never one', () => {
    // What keeps a computed key added later from changing what an already
    // shared label means.
    expect(labelled(point, '{name}', { name: 'Sitno' })).toBe('{name}');
  });

  it('reaches a property whose name is also a computed one', () => {
    expect(labelled(point, '{p:location}', { location: 'underground' })).toBe(
      'underground',
    );
  });

  it('reaches a property whose name carries a colon', () => {
    expect(labelled(point, '{p:name:sk}', { 'name:sk': 'Sitno' })).toBe(
      'Sitno',
    );
  });

  it('reads an absent label as empty', () => {
    expect(labelled(point)).toBe('');
  });

  it('has no length to give, a point being one place', () => {
    expect(labelled(point, '{length}')).toBe('{length}');
  });
});

describe('a line label', () => {
  it('draws a property the label names', () => {
    expect(labelled(line, '{p:name}', { name: 'Hron' })).toBe('Hron');
  });

  it('measures its length, in the unit asked for', () => {
    expect(labelled(line, '{length_km}')).toMatch(/^5[.,]5\d* km$/);

    expect(labelled(line, '{length_m}')).toMatch(/\d m$/);
  });

  it('picks the unit itself when none is asked for', () => {
    expect(labelled(line, '{length}')).toMatch(/km$/);
  });

  it('gives an azimuth only where there is one direction', () => {
    expect(labelled(line, '{azimuth}')).toBe('90°');

    const bent: Geometry = {
      type: 'LineString',
      coordinates: [
        [0, 0],
        [0.05, 0],
        [1, 1],
      ],
    };

    expect(labelled(bent, '{azimuth}')).toBe('{azimuth}');
  });

  it('has no position to draw, a line being more than one place', () => {
    expect(labelled(line, '{location}')).toBe('{location}');
  });
});

describe('a polygon label', () => {
  it('measures its area', () => {
    expect(labelled(square, '{area_m2}')).toMatch(/ m²$/);

    expect(labelled(square, '{area_ha}')).toMatch(/ ha$/);
  });

  it('calls the way round it both length and perimeter', () => {
    expect(labelled(square, '{perimeter_m}')).toBe(
      labelled(square, '{length_m}'),
    );
  });

  it('takes its holes off the area, as the readout does', () => {
    const holed: Geometry = {
      type: 'Polygon',
      coordinates: [
        outer,
        ring([
          [0.0002, 0.0002],
          [0.0006, 0.0002],
          [0.0006, 0.0006],
          [0.0002, 0.0006],
        ]),
      ],
    };

    const whole = labelled(square, '{area_m2}');

    const less = labelled(holed, '{area_m2}');

    expect(less).not.toBe(whole);

    expect(parseFloat(less.replace(/[^\d.]/g, ''))).toBeLessThan(
      parseFloat(whole.replace(/[^\d.]/g, '')),
    );
  });

  it('offers every unit the readout does, acres included', () => {
    expect(labelled(square, '{area_ac}')).toMatch(/ ac$/);

    expect(labelled(square, '{area_mi2}')).toMatch(/ mi²$/);

    expect(labelled(square, '{perimeter_nmi}')).toMatch(/ nmi$/);
  });

  it('has no azimuth, having no single direction', () => {
    expect(labelled(square, '{azimuth}')).toBe('{azimuth}');
  });
});
