import { describe, expect, it } from 'vitest';
import { fillRayTemplate, type RayValues } from './rayTemplate.js';

const values: RayValues = {
  label: 'Kráľova hoľa',
  elevation: '1946 m',
  elevation_ft: '6385 ft',
  distance: '12,3 km',
  distance_mi: '7.6 mi',
  azimuth: '312°',
  location: 'N 48° 52\' 47"\nE 20° 8\' 6"',
  props: { name: 'Kráľova hoľa', ele: '1946', wikidata: 'Q607770' },
};

describe('fillRayTemplate', () => {
  it('fills the default second line', () => {
    expect(fillRayTemplate('[{elevation} · ]{distance}', values)).toBe(
      '1946 m · 12,3 km',
    );
  });

  it('drops the bracketed part when its value is missing', () => {
    expect(
      fillRayTemplate('[{elevation} · ]{distance}', {
        ...values,
        elevation: undefined,
      }),
    ).toBe('12,3 km');
  });

  it('closes up when the missing value is in the middle', () => {
    expect(
      fillRayTemplate('{label}[ · {elevation}] · {distance}', {
        ...values,
        elevation: undefined,
      }),
    ).toBe('Kráľova hoľa · 12,3 km');
  });

  it('reads any property of the point', () => {
    expect(fillRayTemplate('{p:wikidata}', values)).toBe('Q607770');
  });

  it('expands a property that is not there to nothing', () => {
    expect(fillRayTemplate('{p:website}', values)).toBe('');
  });

  it('leaves a name it does not know as written, as a label does', () => {
    // A template is applied to every ray at once, so a typo swallowed here
    // would be a typo swallowed everywhere.
    expect(fillRayTemplate('{nonsense}', values)).toBe('{nonsense}');

    expect(fillRayTemplate('[{elevatoin} · ]{distance}', values)).toBe(
      '{elevatoin} · 12,3 km',
    );
  });

  it('empties a property the point does not carry', () => {
    // Absent data, not an unknown name — the prefix is understood.
    expect(fillRayTemplate('[{p:website} · ]{distance}', values)).toBe(
      '12,3 km',
    );
  });

  it('leaves a template with no placeholders alone', () => {
    expect(fillRayTemplate('Summit', values)).toBe('Summit');
  });

  it('is empty when everything it names is', () => {
    expect(
      fillRayTemplate('[{elevation}][ · {elevation_ft}]', {
        ...values,
        elevation: undefined,
        elevation_ft: undefined,
      }),
    ).toBe('');
  });
});

describe('a value that carries its own lines', () => {
  it('keeps them, so a multi-line label reads the same on the dial', () => {
    expect(fillRayTemplate('{label}', { ...values, label: 'Foo\nBar' })).toBe(
      'Foo\nBar',
    );
  });

  it('keeps them through a group that survives', () => {
    expect(
      fillRayTemplate('{label}[ · {elevation}]', {
        ...values,
        label: 'Foo\nBar',
        elevation: undefined,
      }),
    ).toBe('Foo\nBar');
  });
});

describe('punctuation inside a value', () => {
  it('leaves a full stop in a name alone', () => {
    expect(fillRayTemplate('{label}', { ...values, label: 'St. Peter' })).toBe(
      'St. Peter',
    );
  });

  it('leaves a comma in a value alone', () => {
    expect(
      fillRayTemplate('{label}', { ...values, label: 'Poprad, Slovakia' }),
    ).toBe('Poprad, Slovakia');
  });

  it('leaves a trailing abbreviation alone', () => {
    expect(
      fillRayTemplate('{elevation} n. m.', { ...values, elevation: '1946' }),
    ).toBe('1946 n. m.');
  });

  it('still closes up the template around an empty value', () => {
    expect(
      fillRayTemplate('{label}[, {elevation}]', {
        ...values,
        label: 'St. Peter',
        elevation: undefined,
      }),
    ).toBe('St. Peter');
  });
});

describe('a key from the prototype chain', () => {
  it('reads as nothing rather than as what every object inherits', () => {
    expect(fillRayTemplate('{p:constructor}', values)).toBe('');
    expect(fillRayTemplate('{p:toString}', values)).toBe('');
  });
});
