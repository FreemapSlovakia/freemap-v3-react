import { describe, expect, it } from 'vitest';
import { drawingLineLabel, drawingPointLabel } from './labelValues.js';

const coords = { lat: 49.013621, lon: 20.169882 };

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

  it('does not let a property shadow a computed value', () => {
    expect(
      drawingPointLabel({
        coords,
        label: '{location}',
        props: { location: 'underground' },
      }),
    ).toBe('N 49° 0\' 49"\nE 20° 10\' 12"');
  });

  it('leaves a key it cannot answer as written', () => {
    expect(drawingPointLabel({ coords, label: '{nmae}' })).toBe('{nmae}');
  });

  it('reads an absent label as empty', () => {
    expect(drawingPointLabel({ coords })).toBe('');
  });
});

describe('drawingLineLabel', () => {
  it('draws a property the label names', () => {
    expect(drawingLineLabel({ label: '{name}', props: { name: 'Hron' } })).toBe(
      'Hron',
    );
  });

  it('has no position to draw, a line being more than one place', () => {
    expect(drawingLineLabel({ label: '{location}' })).toBe('{location}');
  });
});
