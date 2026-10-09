import type { Feature, Geometry } from 'geojson';
import { describe, expect, it } from 'vitest';
import {
  defaultLabel,
  featureLabel,
  withEditedLabel,
  withRenderedLabel,
} from './featureProperties.js';

const feature = (
  geometry: Geometry | null,
  properties: Record<string, unknown> = {},
): Feature => ({ type: 'Feature', geometry, properties }) as unknown as Feature;

const point = feature({ type: 'Point', coordinates: [0, 0] });

const line = (closed: boolean, properties: Record<string, unknown> = {}) =>
  feature(
    {
      type: 'LineString',
      coordinates: closed
        ? [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 0],
          ]
        : [
            [0, 0],
            [1, 1],
          ],
    },
    properties,
  );

describe('the label a converted feature gets unasked', () => {
  it('references a point’s name rather than copying it', () => {
    expect(defaultLabel({ ...point, properties: { name: 'Spring' } }, false)) //
      .toBe('{p:name}');
  });

  it('takes the label the file carries over the name', () => {
    expect(
      defaultLabel(
        {
          ...point,
          properties: { name: 'Spring', 'freemap:label': '{p:ele}' },
        },
        false,
      ),
    ).toBe('{p:ele}');
  });

  it('gives an unnamed feature none', () => {
    expect(defaultLabel(point, false)).toBeUndefined();

    // A GeoJSON number is not a name the label could reference.
    expect(
      defaultLabel({ ...point, properties: { name: 12 } }, false),
    ).toBeUndefined();
  });

  // A plain line's name is a street name; the loaded-data conversion labels
  // those too, which is what `labelLines` says.
  it('withholds a plain line’s name unless lines are labelled', () => {
    expect(defaultLabel(line(false, { name: 'High Street' }), false)) //
      .toBeUndefined();

    expect(defaultLabel(line(false, { name: 'High Street' }), true)) //
      .toBe('{p:name}');
  });

  it('labels an area, and a closed line only where the file calls it one', () => {
    expect(
      defaultLabel(
        feature(
          {
            type: 'Polygon',
            coordinates: [
              [
                [0, 0],
                [1, 0],
                [1, 1],
                [0, 0],
              ],
            ],
          },
          { name: 'Lake' },
        ),
        false,
      ),
    ).toBe('{p:name}');

    expect(
      defaultLabel(
        line(true, { name: 'Ring', 'freemap:type': 'polygon' }),
        false,
      ),
    ).toBe('{p:name}');

    // Closed but not stated to be an area — the conversion draws it as a line.
    expect(defaultLabel(line(true, { name: 'Ring' }), false)).toBeUndefined();
  });

  it('gives a feature with no geometry none', () => {
    expect(defaultLabel(feature(null, { name: 'Nowhere' }), false)) //
      .toBeUndefined();
  });
});

describe('an imported feature’s label', () => {
  it('renders the template from the feature’s own table', () => {
    expect(
      featureLabel({
        ...point,
        properties: {
          name: 'Dubník',
          'freemap:label': '{p:name}[ ({p:ele} m)]',
          'freemap:props': { name: 'Dubník', ele: '504' },
        },
      }),
    ).toBe('Dubník (504 m)');
  });

  it('reads plain properties where there is no table', () => {
    expect(
      featureLabel({
        ...point,
        properties: { ele: 504, 'freemap:label': 'Kóta {p:ele}' },
      }),
    ).toBe('Kóta 504');
  });

  it('measures what a computed key names', () => {
    expect(
      featureLabel(
        { ...line(false), properties: { 'freemap:label': '{length_km}' } },
        { locale: 'en' },
      ),
    ).toMatch(/^157\skm$/);
  });

  it('falls back to the name', () => {
    expect(featureLabel({ ...point, properties: { name: 'Spring' } })) //
      .toBe('Spring');
  });

  it('gives none where the template renders to nothing', () => {
    expect(
      featureLabel({
        ...point,
        properties: { name: 'Spring', 'freemap:label': '[{p:missing}]' },
      }),
    ).toBeUndefined();
  });

  it('reads `name` as the label, never as a property', () => {
    expect(
      featureLabel({
        ...point,
        properties: { name: 'Dubník 504', 'freemap:label': '[{p:name}]' },
      }),
    ).toBeUndefined();
  });

  it('writes a multi-line label on one line where asked', () => {
    expect(
      featureLabel(
        { ...point, properties: { name: 'a\nb' } },
        { singleLine: true },
      ),
    ).toBe('a b');
  });
});

describe('an edited label', () => {
  it('makes a table on the first template, seeded with the label it replaces', () => {
    expect(
      withEditedLabel(
        { ...point, properties: { name: 'Dubník', title: 'x', ele: '504' } },
        '{p:name} ({p:ele} m)',
        { ele: '504' },
      ),
    ).toEqual({
      ele: '504',
      'freemap:label': '{p:name} ({p:ele} m)',
      'freemap:props': { name: 'Dubník', ele: '504' },
      name: 'Dubník (504 m)',
    });
  });

  it('keeps a name row typed with the first template', () => {
    expect(
      withEditedLabel({ ...point, properties: {} }, '{p:name}!', {
        name: 'Foo',
      }),
    ).toEqual({
      'freemap:label': '{p:name}!',
      'freemap:props': { name: 'Foo' },
      name: 'Foo!',
    });
  });

  it('reads an existing table, not the stale rendering in `name`', () => {
    expect(
      withEditedLabel(
        {
          ...point,
          properties: {
            name: 'Old 1',
            'freemap:label': '{p:name} 1',
            'freemap:props': { name: 'New' },
          },
        },
        '{p:name} 1',
        { name: 'New' },
      ),
    ).toMatchObject({ name: 'New 1', 'freemap:props': { name: 'New' } });
  });

  it('stores plain text as the name alone where there is no table', () => {
    expect(
      withEditedLabel(
        { ...point, properties: { title: 'x', name: 'y' } },
        'Spring',
        {},
      ),
    ).toEqual({ name: 'Spring' });
  });

  it('states plain text as the label too beside a table', () => {
    expect(
      withEditedLabel(
        {
          ...point,
          properties: {
            name: 'Dubník',
            'freemap:label': '{p:name}',
            'freemap:props': { name: 'Dubník' },
          },
        },
        'Summit',
        { name: 'Dubník' },
      ),
    ).toEqual({
      name: 'Summit',
      'freemap:label': 'Summit',
      'freemap:props': { name: 'Dubník' },
    });
  });

  it('clears the label, keeping the table', () => {
    expect(
      withEditedLabel(
        {
          ...point,
          properties: {
            name: 'a',
            title: 'b',
            'freemap:label': '{p:x}',
            'freemap:props': { x: 'a' },
          },
        },
        '',
        { x: 'a' },
      ),
    ).toEqual({ 'freemap:props': { x: 'a' } });
  });
});

describe('a label rendered for export', () => {
  const ours = {
    ...point,
    properties: {
      name: 'Dubník 500',
      'freemap:label': '{p:name} {p:ele}',
      'freemap:props': { name: 'Dubník', ele: '504' },
      ele: '504',
    },
  };

  it('renders into `name` for a reader that takes it from there', () => {
    expect(withRenderedLabel(ours, 'name').properties).toMatchObject({
      name: 'Dubník 504',
    });
  });

  it('renders into `title`, stating the table as plain properties', () => {
    expect(withRenderedLabel(ours, 'title').properties).toMatchObject({
      name: 'Dubník',
      ele: '504',
      title: 'Dubník 504',
    });
  });

  it('drops the stale rendering where the table has no name', () => {
    expect(
      withRenderedLabel(
        {
          ...point,
          properties: { name: 'old', 'freemap:label': '{location}' },
        },
        'title',
      ).properties,
    ).not.toHaveProperty('name');
  });

  it('leaves a feature without a template alone', () => {
    const plain = { ...point, properties: { name: 'Spring' } };

    expect(withRenderedLabel(plain, 'name')).toBe(plain);
  });
});
