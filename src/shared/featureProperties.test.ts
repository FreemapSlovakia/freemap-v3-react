import type { Feature, Geometry } from 'geojson';
import { describe, expect, it } from 'vitest';
import { defaultLabel } from './featureProperties.js';

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
