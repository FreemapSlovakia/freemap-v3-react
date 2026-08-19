import { describe, expect, it } from 'vitest';
import { drawingLineLabel, drawingPointLabel } from './labelValues.js';
import type { DrawnLine } from './model/actions/drawingLineActions.js';

const coords = { lat: 49.013621, lon: 20.169882 };

const at = (lat: number, lon: number, id: number) => ({ lat, lon, id });

/** Several kilometres of due-east line at the equator, to check units by. */
const line = {
  type: 'line' as const,
  points: [at(0, 0, 0), at(0, 0.05, 1)],
};

/** Roughly a hundred metres square, so its area lands in the m² band. */
const square = {
  type: 'polygon' as const,
  id: 1,
  points: [
    at(0, 0, 0),
    at(0, 0.00089932, 1),
    at(0.00090437, 0.00089932, 2),
    at(0.00090437, 0, 3),
  ],
};

describe('drawingPointLabel', () => {
  it('draws a property the label names', () => {
    expect(
      drawingPointLabel({ coords, label: '{name}', props: { name: 'Sitno' } }),
    ).toBe('Sitno');
  });

  it('draws the position, which is computed rather than stored', () => {
    expect(drawingPointLabel({ coords, label: '{location}' })).toBe(
      'N 49° 0\' 49"\nE 20° 10\' 12"',
    );
  });

  it('leaves a key it cannot answer as written', () => {
    expect(drawingPointLabel({ coords, label: '{nmae}' })).toBe('{nmae}');
  });

  it('reads an absent label as empty', () => {
    expect(drawingPointLabel({ coords })).toBe('');
  });

  it('has no length to give, a point being one place', () => {
    expect(drawingPointLabel({ coords, label: '{length}' })).toBe('{length}');
  });
});

describe('drawingLineLabel', () => {
  it('draws a property the label names', () => {
    expect(
      drawingLineLabel({ ...line, label: '{name}', props: { name: 'Hron' } }),
    ).toBe('Hron');
  });

  it('measures its length, in the unit asked for', () => {
    expect(drawingLineLabel({ ...line, label: '{length_km}' })).toMatch(
      /^5[.,]5\d*\u00a0km$/,
    );

    expect(drawingLineLabel({ ...line, label: '{length_m}' })).toMatch(
      /\d\u00a0m$/,
    );
  });

  it('picks the unit itself when none is asked for', () => {
    expect(drawingLineLabel({ ...line, label: '{length}' })).toMatch(/km$/);
  });

  it('gives an azimuth only where there is one direction', () => {
    expect(drawingLineLabel({ ...line, label: '{azimuth}' })).toBe('90°');

    const bent = { ...line, points: [...line.points, at(1, 1, 2)] };

    expect(drawingLineLabel({ ...bent, label: '{azimuth}' })).toBe('{azimuth}');
  });

  it('has no position to draw, a line being more than one place', () => {
    expect(drawingLineLabel({ ...line, label: '{location}' })).toBe(
      '{location}',
    );
  });
});

describe('a polygon', () => {
  it('measures its area', () => {
    expect(drawingLineLabel({ ...square, label: '{area_m2}' })).toMatch(
      /\u00a0m²$/,
    );

    expect(drawingLineLabel({ ...square, label: '{area_ha}' })).toMatch(
      /\u00a0ha$/,
    );
  });

  it('calls the way round it both length and perimeter', () => {
    const asLength = drawingLineLabel({ ...square, label: '{length_m}' });

    expect(drawingLineLabel({ ...square, label: '{perimeter_m}' })).toBe(
      asLength,
    );
  });

  it('takes its holes off the area, as the readout does', () => {
    const hole: DrawnLine = {
      type: 'polygon',
      id: 2,
      holeOfId: 1,
      points: [
        at(0.0002, 0.0002, 0),
        at(0.0002, 0.0006, 1),
        at(0.0006, 0.0006, 2),
        at(0.0006, 0.0002, 3),
      ],
    } as DrawnLine;

    const whole = drawingLineLabel({ ...square, label: '{area_m2}' });

    const holed = drawingLineLabel({ ...square, label: '{area_m2}' }, [
      square as DrawnLine,
      hole,
    ]);

    expect(holed).not.toBe(whole);

    expect(parseFloat(holed.replace(/[^\d.]/g, ''))).toBeLessThan(
      parseFloat(whole.replace(/[^\d.]/g, '')),
    );
  });

  it('has no azimuth, having no single direction', () => {
    expect(drawingLineLabel({ ...square, label: '{azimuth}' })).toBe(
      '{azimuth}',
    );
  });
});
