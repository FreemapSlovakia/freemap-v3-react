import { describe, expect, it } from 'vitest';
import {
  featureDataProps,
  mergeFeatureDataProps,
} from './featureProperties.js';

const PROPERTIES = {
  name: 'Dubník',
  ele: 504,
  description: 'a hill',
  'freemap:color': '#ff0000',
  stroke: '#ff0000',
  'fm:kind': 'waypoint',
  coordinateProperties: { times: ['2026-01-01T00:00:00Z'] },
};

describe('featureDataProps', () => {
  it('offers the feature data as text, leaving the label and the style out', () => {
    expect(featureDataProps(PROPERTIES)).toEqual({
      ele: '504',
      description: 'a hill',
    });
  });
});

describe('mergeFeatureDataProps', () => {
  it('keeps the value a row reads the same as, and everything it never showed', () => {
    const merged = mergeFeatureDataProps(PROPERTIES, {
      ele: '504',
      description: 'a big hill',
    });

    expect(merged['ele']).toBe(504);

    expect(merged['description']).toBe('a big hill');

    expect(merged['name']).toBe('Dubník');

    expect(merged['freemap:color']).toBe('#ff0000');

    expect(merged['coordinateProperties']).toBe(
      PROPERTIES.coordinateProperties,
    );
  });

  it('drops a row that is gone', () => {
    expect('description' in mergeFeatureDataProps(PROPERTIES, {})).toBe(false);
  });
});

// What a file of ours brings: the table stated twice, and `freemap:props` is
// the copy the drawing conversion and both exports read.
const OWN = {
  name: 'Dubník 504',
  'freemap:label': '{p:name} {p:ele}',
  'freemap:props': { name: 'Dubník', ele: '504' },
  ele: '504',
};

describe('a table the feature states twice', () => {
  it('is shown, rather than the rows being empty', () => {
    expect(featureDataProps(OWN)).toEqual({ name: 'Dubník', ele: '504' });
  });

  it('is kept in step by an edit, so no reader answers with the old one', () => {
    const merged = mergeFeatureDataProps(OWN, { name: 'Dubník', ele: '505' });

    expect(merged['freemap:props']).toEqual({ name: 'Dubník', ele: '505' });

    expect(merged['ele']).toBe('505');
  });

  it('refuses a row named like something the editor owns', () => {
    const merged = mergeFeatureDataProps(PROPERTIES, {
      coordinateProperties: 'nonsense',
      description: 'a hill',
    });

    expect(merged['coordinateProperties']).toBe(
      PROPERTIES.coordinateProperties,
    );
  });

  it('is not invented for a feature that never had one', () => {
    expect(
      'freemap:props' in mergeFeatureDataProps(PROPERTIES, { a: 'b' }),
    ).toBe(false);
  });
});
