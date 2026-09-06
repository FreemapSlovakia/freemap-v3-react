import type { Feature, Geometry } from 'geojson';
import { describe, expect, it } from 'vitest';
import {
  conversionSeed,
  featuresOf,
  geometryKind,
  toChoices,
  type Value,
} from './convertDialog.js';

const feature = (
  geometry: Geometry,
  properties: Record<string, unknown> = {},
): Feature => ({ type: 'Feature', geometry, properties });

const point = (properties: Record<string, unknown> = {}) =>
  feature({ type: 'Point', coordinates: [0, 0] }, properties);

const line = (properties: Record<string, unknown> = {}) =>
  feature(
    {
      type: 'LineString',
      coordinates: [
        [0, 0],
        [1, 1],
      ],
    },
    properties,
  );

describe('what the dialog opens on', () => {
  it('offers each feature’s own properties, and its name as the label', () => {
    const seed = conversionSeed([point({ name: 'Spring', natural: 'spring' })]);

    expect(seed.props).toEqual([{ name: 'Spring', natural: 'spring' }]);

    expect(seed.label).toBe('{p:name}');

    // Foreign data leaves the ticking to the dialog, which takes the name.
    expect(seed.keys).toBeUndefined();
  });

  // Reading a file of ours back is meant to be lossless.
  it('ticks the whole table a file of ours carries', () => {
    const seed = conversionSeed([
      point({
        name: 'Hut',
        'freemap:label': '{p:name} {p:ele}',
        'freemap:props': { name: 'Hut', ele: '1234' },
      }),
      point({ name: 'Foreign' }),
    ]);

    expect(seed.label).toBe('{p:name} {p:ele}');

    expect(seed.keys?.toSorted()).toEqual(['ele', 'name']);
  });

  it('says what shape is being converted, and mixed where they differ', () => {
    expect(conversionSeed([point(), point()]).kind).toBe('point');

    expect(conversionSeed([line()]).kind).toBe('line');

    expect(conversionSeed([point(), line()]).kind).toBe('mixed');
  });

  // The seed has to be what the conversion would do unasked, or accepting the
  // dialog unchanged draws something else.
  it('offers a plain line’s name only where lines are labelled', () => {
    expect(conversionSeed([line({ name: 'High Street' })]).label).toBe('');

    expect(conversionSeed([line({ name: 'High Street' })], true).label) //
      .toBe('{p:name}');
  });
});

describe('reading the answer', () => {
  const value: Value = {
    keys: ['name'],
    label: '{p:name}',
    seed: '{p:name}',
    resolveLabel: false,
    position: 0,
    suggested: 0,
    geometry: 'point',
    mode: 'append',
    probe: null,
  };

  const answer = (over: Partial<Value> = {}) =>
    toChoices({ result: 'confirm', value: { ...value, ...over } });

  it('answers nothing when cancelled', () => {
    expect(toChoices({ result: 'cancel', value })).toBeNull();
  });

  // One field cannot say "keep each of these its own", so a field left as it
  // opened says it instead.
  it('leaves an untouched field unanswered', () => {
    expect(answer()?.carry.label).toBeUndefined();
  });

  it('takes a cleared field as no label at all', () => {
    expect(answer({ label: '' })?.carry.label).toBe('');
  });

  it('takes what was typed, and carries the properties it names', () => {
    const choices = answer({ label: '{p:name} ({p:ele})', keys: [] });

    expect(choices?.carry.label).toBe('{p:name} ({p:ele})');

    // Unanswered, a `{p:ele}` would draw as nothing.
    expect(choices?.carry.keys.toSorted()).toEqual(['ele', 'name']);
  });

  it('needs none of them once the label is resolved', () => {
    const choices = answer({
      label: '{p:name} ({p:ele})',
      keys: [],
      resolveLabel: true,
    });

    expect(choices?.carry.keys).toEqual([]);

    expect(choices?.carry.resolveLabel).toBe(true);
  });

  it('reads the tolerance off the slider', () => {
    expect(answer({ position: 0 })?.tolerance).toBe(0);

    expect(answer({ position: 1 })?.tolerance).toBeGreaterThan(0);
  });
});

describe('reading features out of what was picked', () => {
  it('takes a collection’s features, or the one feature', () => {
    expect(featuresOf(null)).toEqual([]);

    expect(featuresOf(point())).toHaveLength(1);

    expect(
      featuresOf({ type: 'FeatureCollection', features: [point(), line()] }),
    ).toHaveLength(2);
  });

  it('classes a geometry collection as mixed', () => {
    expect(
      geometryKind(feature({ type: 'GeometryCollection', geometries: [] })),
    ).toBe('mixed');
  });
});
