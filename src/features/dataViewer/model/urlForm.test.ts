import { parseFeatureParams } from '@app/url/locationChangeHandler.js';
import { serializeQuery } from '@app/url/mapContentParts.js';
import type { Feature, FeatureCollection } from 'geojson';
import { describe, expect, it } from 'vitest';
import { fromWire, lineToFeature, pointToFeature } from '../drawingWire.js';
import { withLineKind } from '../featureEditing.js';
import { withChannelKeys } from '../trackChannels.js';
import type { TrackLine } from '../trackSelection.js';
import { setVertexValues } from '../vertexEditing.js';
import {
  parseVertexField,
  toLocalInput,
  vertexFields,
} from '../vertexValues.js';
import {
  completeCollection,
  featuresInLink,
  URL_FEATURES_BUDGET,
  urlWire,
} from './urlForm.js';

const fc = (...features: Feature[]): FeatureCollection => ({
  type: 'FeatureCollection',
  features,
});

describe('featuresInLink', () => {
  const small = fc(pointToFeature({ coords: { lat: 48, lon: 17 } }));

  it('holds while they fit and nothing else names them', () => {
    expect(
      featuresInLink({ trackGeojson: small, trackUID: null, gpxUrl: null }),
    ).toBe(true);

    expect(
      featuresInLink({ trackGeojson: small, trackUID: 'x', gpxUrl: null }),
    ).toBe(false);
  });
});

describe('completeCollection', () => {
  it('leaves out a line still being drawn, and is the same object otherwise', () => {
    const point = pointToFeature({ coords: { lat: 48, lon: 17 } });

    const whole = fc(point);

    expect(completeCollection(whole)).toBe(whole);

    expect(
      completeCollection(
        fc(point, {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: [[17, 48]] },
        }),
      ).features,
    ).toEqual([point]);
  });
});

describe('urlWire', () => {
  it('writes what was drawn as params, in order', () => {
    const params = urlWire(
      fc(
        lineToFeature({
          type: 'line',
          points: [
            { lat: 48, lon: 17, id: 0 },
            { lat: 48.1, lon: 17.1, id: 1 },
          ],
        }),
        pointToFeature({ coords: { lat: 48, lon: 17 }, label: 'A' }),
      ),
    );

    expect(params?.map(([key]) => key)).toEqual(['line', 'point']);
  });

  it('leaves a line still being drawn out', () => {
    expect(
      urlWire(
        fc({
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: [[17, 48]] },
        }),
      ),
    ).toEqual([]);
  });

  it('takes a short recording, values and segments and all', () => {
    const recording: Feature = {
      type: 'Feature',
      properties: {
        name: 'Ride',
        _gpxType: 'trk',
        'fm:kind': 'track',
        coordinateProperties: {
          times: [
            ['2026-10-23T08:00:00Z', '2026-10-23T08:00:01Z'],
            ['2026-10-23T09:00:00.500Z', null],
          ],
          heart: [
            [120, null],
            [131, 132],
          ],
        },
      },
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [
            [17.1, 48.1, 300.5],
            [17.2, 48.2, 301],
          ],
          [
            [17.3, 48.3],
            [17.4, 48.4, 290],
          ],
        ],
      },
    };

    const params = urlWire(fc(recording));

    expect(params).toHaveLength(1);

    const [back] = fromWire(
      parseFeatureParams(new URLSearchParams(serializeQuery(params ?? []))),
    );

    expect(back?.geometry).toEqual(recording.geometry);

    expect(back?.properties?.['coordinateProperties']).toEqual(
      recording.properties?.['coordinateProperties'],
    );

    expect(back?.properties).toMatchObject({
      name: 'Ride',
      _gpxType: 'trk',
      'fm:kind': 'track',
    });
  });

  it('keeps a drawn line given a kind, a time and a heart rate by hand', () => {
    const drawn = lineToFeature({
      type: 'line',
      points: [
        { lat: 48, lon: 17, id: 0 },
        { lat: 48.1, lon: 17.1, id: 1 },
      ],
    });

    // As the line's Properties save it: a kind and two channels, empty.
    const kinded = {
      ...drawn,
      properties: withChannelKeys(
        drawn as TrackLine,
        withLineKind(drawn.properties, 'track') ?? {},
        ['times', 'heart'],
      ),
    };

    // And as Point data saves one point's time and heart rate.
    const timeField = vertexFields(kinded, 0, 1).fields.find(
      ({ key }) => key === 'times',
    )!;

    const time = parseVertexField(
      timeField,
      toLocalInput('2026-10-23T08:00:00Z'),
      {},
    );

    const edited = setVertexValues(kinded, 0, 1, [17.1, 48.1], {
      times: 'value' in time ? time.value : undefined,
      heart: 140,
    });

    const params = urlWire(fc(edited));

    expect(params).toHaveLength(1);

    const [back] = fromWire(
      parseFeatureParams(new URLSearchParams(serializeQuery(params ?? []))),
    );

    expect(back?.properties).toMatchObject({
      'fm:kind': 'track',
      coordinateProperties: {
        times: [null, '2026-10-23T08:00:00Z'],
        heart: [null, 140],
      },
    });
  });

  it('reads back a point elevation written in exponent form', () => {
    const params = urlWire(
      fc(pointToFeature({ coords: { lat: 48, lon: 17 }, ele: 1e-7 })),
    );

    const [back] = fromWire(
      parseFeatureParams(new URLSearchParams(serializeQuery(params ?? []))),
    );

    expect(back?.geometry).toEqual({
      type: 'Point',
      coordinates: [17, 48, 1e-7],
    });
  });

  describe('carries what an import says, by meaning', () => {
    const roundTrip = (feature: Feature) => {
      const params = urlWire(fc(feature));

      expect(params).toBeDefined();

      return fromWire(
        parseFeatureParams(new URLSearchParams(serializeQuery(params ?? []))),
      )[0]!;
    };

    const track = (properties: Record<string, unknown>): Feature => ({
      type: 'Feature',
      properties,
      geometry: {
        type: 'LineString',
        coordinates: [
          [17, 48],
          [17.1, 48.1],
        ],
      },
    });

    it('times with milliseconds or an offset, as the same instants', () => {
      const back = roundTrip(
        track({
          coordinateProperties: {
            times: [
              '2026-01-01T02:00:00.250+02:00',
              '2026-01-01T00:00:01.000Z',
            ],
          },
        }),
      );

      expect(back.properties?.['coordinateProperties']).toEqual({
        times: ['2026-01-01T00:00:00.250Z', '2026-01-01T00:00:01Z'],
      });
    });

    it('numbers and booleans, with their type', () => {
      expect(
        roundTrip(track({ number: 3, flag: true })).properties,
      ).toMatchObject({ number: 3, flag: true });
    });

    it('nulls, beside text, numbers and booleans', () => {
      const properties = {
        name: 'Hut',
        note: 'ok',
        beds: 12,
        open: false,
        x: null,
      };

      expect(
        roundTrip({
          type: 'Feature',
          properties,
          geometry: { type: 'Point', coordinates: [17, 48] },
        }).properties,
      ).toEqual(properties);

      expect(roundTrip(track(properties)).properties).toMatchObject(properties);
    });

    it('but nothing that would split its field', () => {
      for (const properties of [
        { name: 'a\x1fb' },
        { note: 'a\x1eb' },
        { 'a\x1fb': 1 },
        JSON.parse('{"__proto__": "x"}'),
        { stroke: 'red\x1eLHacked' },
        {
          'fm:kind': 'track',
          coordinateProperties: { 'he\x1fart': [1, 2] },
        },
      ]) {
        expect(urlWire(fc(track(properties)))).toBeUndefined();
      }
    });

    it('but no typed value under a key the editor owns', () => {
      const [back] = fromWire(
        parseFeatureParams(
          new URLSearchParams(
            serializeQuery([
              [
                'line',
                '48/17,48.1/17.1\x1eQcoordinateProperties\x1f{"times":"x"}\x1f__proto__\x1f{"a":1}\x1fok\x1f1',
              ],
            ]),
          ),
        ),
      );

      expect(back?.properties).not.toHaveProperty('coordinateProperties');

      expect(Object.hasOwn(back?.properties ?? {}, '__proto__')).toBe(false);

      expect(back?.properties).toMatchObject({ ok: 1 });
    });

    it('objects and arrays, separators inside them included', () => {
      const properties = {
        tags: ['a', 'b\x1ec'],
        meta: { depth: { m: 3 }, note: 'x\x1fy' },
      };

      expect(roundTrip(track(properties)).properties).toMatchObject(properties);
    });

    it('a style given in simplestyle alone', () => {
      expect(
        roundTrip(track({ stroke: '#ff0000', 'stroke-width': 5 })).properties,
      ).toMatchObject({ stroke: '#ff0000', 'stroke-width': 5 });
    });

    it('a waypoint’s Garmin symbol that maps to an icon and back', () => {
      const back = roundTrip({
        type: 'Feature',
        properties: { name: 'Top', sym: 'Summit' },
        geometry: { type: 'Point', coordinates: [17, 48] },
      });

      expect(back.properties).toMatchObject({ sym: 'Summit' });
    });

    it('a title beside the name, and a marker size', () => {
      expect(
        roundTrip(track({ name: 'Ride', title: 'Ride' })).properties,
      ).toMatchObject({ name: 'Ride', title: 'Ride' });

      expect(
        roundTrip({
          type: 'Feature',
          properties: { title: 'Hut', name: 'Hut', 'marker-size': 'large' },
          geometry: { type: 'Point', coordinates: [17, 48] },
        }).properties,
      ).toMatchObject({ title: 'Hut', 'marker-size': 'large' });
    });

    it('a symbol no icon says, verbatim', () => {
      const properties = {
        name: 'Top',
        sym: 'Flag, Blue',
        icon: 'https://example.com/pin.png',
      };

      const back = roundTrip({
        type: 'Feature',
        properties,
        geometry: { type: 'Point', coordinates: [17, 48] },
      });

      expect(back.properties).toMatchObject(properties);
    });
  });

  it('refuses a channel holding text', () => {
    expect(
      urlWire(
        fc({
          type: 'Feature',
          properties: { coordinateProperties: { notes: ['a', 'b'] } },
          geometry: {
            type: 'LineString',
            coordinates: [
              [17, 48],
              [17.1, 48],
            ],
          },
        }),
      ),
    ).toBeUndefined();
  });

  it('refuses a track too long to fit without encoding it', () => {
    const coordinates = Array.from(
      { length: URL_FEATURES_BUDGET / 4 + 1 },
      (_, i) => [17 + i / 1e5, 48],
    );

    expect(
      urlWire(
        fc({
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates },
        }),
      ),
    ).toBeUndefined();
  });

  it('refuses more than the budget', () => {
    const points = Array.from(
      { length: Math.ceil(URL_FEATURES_BUDGET / 20) },
      (_, id) => ({ lat: 48 + id / 1e4, lon: 17, id }),
    );

    expect(
      urlWire(fc(lineToFeature({ type: 'line', points }))),
    ).toBeUndefined();
  });
});
