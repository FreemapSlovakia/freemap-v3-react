import { makeDrawingStyle } from '@features/drawing/model/reducers/drawingSettingsReducer.js';
import type { LineKind } from '@shared/components/FeaturePropertiesModal.js';
import type { Feature } from 'geojson';
import { describe, expect, it } from 'vitest';
import { editedProperties, featureEditValues } from './featureEditing.js';

const line = (properties: Record<string, unknown>): Feature => ({
  type: 'Feature',
  properties,
  geometry: {
    type: 'LineString',
    coordinates: [
      [17, 48],
      [17.1, 48],
    ],
  },
});

const saved = (feature: Feature, lineKind: LineKind) =>
  editedProperties(feature, {
    ...featureEditValues(feature, makeDrawingStyle('#ff0000', 4)),
    lineKind,
  });

describe('a track’s details', () => {
  const style = makeDrawingStyle('#ff0000', 4);

  const recorded = () =>
    line({
      'fm:kind': 'track',
      _gpxType: 'trk',
      desc: 'Morning ride',
      number: 3,
      color: 'red',
      links: [{ href: 'https://example.com', text: 'Ride', type: null }],
    });

  it('shows them as named fields, not as table rows', () => {
    const values = featureEditValues(recorded(), style);

    expect(values.props).toEqual({
      color: 'red',
      links: '[{"href":"https://example.com","text":"Ride","type":null}]',
    });

    expect(values.details).toMatchObject({ desc: 'Morning ride', number: '3' });
  });

  it('writes them back as GPX reads them', () => {
    const feature = recorded();

    const values = featureEditValues(feature, style);

    const properties = editedProperties(feature, {
      ...values,
      details: {
        ...values.details!,
        desc: '',
        number: '4',
      },
    });

    expect(properties).not.toHaveProperty('desc');

    expect(properties).toMatchObject({
      number: 4,
      color: 'red',
      links: [{ href: 'https://example.com', text: 'Ride', type: null }],
    });
  });

  it('leaves them exactly as they were when untouched', () => {
    const feature = recorded();

    expect(
      editedProperties(feature, featureEditValues(feature, style)),
    ).toMatchObject(feature.properties!);
  });

  it('never writes a number that is not one', () => {
    const feature = recorded();

    const values = featureEditValues(feature, style);

    expect(
      editedProperties(feature, {
        ...values,
        type: 'polygon',
        details: { ...values.details!, number: 'abc' },
      }),
    ).toMatchObject({ number: 3 });
  });

  it('keeps a plain line’s as table rows', () => {
    const feature = line({ desc: 'Path', type: 'hiking' });

    const values = featureEditValues(feature, style);

    expect(values.props).toEqual({ desc: 'Path', type: 'hiking' });

    expect(editedProperties(feature, values)).toMatchObject({
      desc: 'Path',
      type: 'hiking',
    });
  });
});

describe('a waypoint’s details', () => {
  const style = makeDrawingStyle('#ff0000', 4);

  const waypoint = (properties: Record<string, unknown>): Feature => ({
    type: 'Feature',
    properties,
    geometry: { type: 'Point', coordinates: [17, 48, 1234] },
  });

  it('shows its GPX fields and elevation as named fields', () => {
    const values = featureEditValues(
      waypoint({ name: 'Top', desc: 'View', time: '2026-01-01T00:00:00Z' }),
      style,
    );

    expect(values.props).toEqual({});

    expect(values.details).toMatchObject({ desc: 'View', ele: '1234' });

    expect(values.details?.time).not.toBe('');
  });

  it('keeps a time the field cannot show', () => {
    for (const time of [1700000000, 'yesterday 10:00']) {
      const feature = waypoint({ time });

      expect(
        editedProperties(feature, featureEditValues(feature, style)),
      ).toMatchObject({ time });
    }
  });

  it('writes an untouched time back exactly, and an edited one as UTC', () => {
    const feature = waypoint({ time: '2026-01-01T02:00:00+02:00' });

    const values = featureEditValues(feature, style);

    expect(editedProperties(feature, values)).toMatchObject({
      time: '2026-01-01T02:00:00+02:00',
    });

    const edited = editedProperties(feature, {
      ...values,
      details: { ...values.details!, time: '2026-06-01T12:00' },
    });

    expect(edited?.['time']).toBe(
      new Date('2026-06-01T12:00').toISOString().replace('.000Z', 'Z'),
    );
  });
});

describe('typed rows', () => {
  const style = makeDrawingStyle('#ff0000', 4);

  it('leave nulls and nested values exactly as they were when untouched', () => {
    const feature = line({ x: null, meta: { a: [1, 2] }, n: 4 });

    const values = featureEditValues(feature, style);

    expect(values.propTypes).toMatchObject({ x: 'null', meta: 'json' });

    expect(editedProperties(feature, values)).toMatchObject(
      feature.properties!,
    );
  });

  it('show a plain line’s links as a JSON row, edited there', () => {
    const feature = line({ links: [{ href: 'https://a.test' }] });

    const values = featureEditValues(feature, style);

    expect(values.props).toEqual({ links: '[{"href":"https://a.test"}]' });

    expect(
      editedProperties(feature, {
        ...values,
        props: { links: '[{"href":"https://b.test"}]' },
      }),
    ).toMatchObject({ links: [{ href: 'https://b.test' }] });
  });

  it('keep a track’s links exactly when untouched', () => {
    const links = [{ href: 'https://example.com', text: ' Ride ' }];

    const feature = line({ 'fm:kind': 'track', _gpxType: 'trk', links });

    const values = featureEditValues(feature, style);

    expect(values.propTypes).toMatchObject({ links: 'json' });

    expect(editedProperties(feature, values)).toMatchObject({ links });
  });
});

describe('a line kind', () => {
  it('is read from the import stamps', () => {
    expect(
      featureEditValues(
        line({ 'fm:kind': 'route', _gpxType: 'rte' }),
        makeDrawingStyle('#ff0000', 4),
      ).lineKind,
    ).toBe('route');
  });

  it('stamps both properties when a drawn line becomes a track', () => {
    expect(saved(line({}), 'track')).toMatchObject({
      'fm:kind': 'track',
      _gpxType: 'trk',
    });
  });

  it('clears both when a route becomes a plain line', () => {
    const properties = saved(
      line({ 'fm:kind': 'route', _gpxType: 'rte' }),
      'line',
    );

    expect(properties).not.toHaveProperty('fm:kind');

    expect(properties).not.toHaveProperty('_gpxType');
  });

  it('gives a line the channels its Properties add', () => {
    const feature = line({});

    expect(
      editedProperties(feature, {
        ...featureEditValues(feature, makeDrawingStyle('#ff0000', 4)),
        channels: ['heart'],
      }),
    ).toMatchObject({ coordinateProperties: { heart: [null, null] } });
  });

  it('leaves the channels alone when their list is unchanged', () => {
    const feature = line({ coordinateProperties: { heart: [1, 2] } });

    expect(saved(feature, 'line')).toMatchObject({
      coordinateProperties: { heart: [1, 2] },
    });
  });

  it('leaves the stamps of an unchanged line alone', () => {
    expect(saved(line({ 'fm:kind': 'feature' }), 'line')).toMatchObject({
      'fm:kind': 'feature',
    });
  });
});
