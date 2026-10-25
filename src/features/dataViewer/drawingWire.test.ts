import type { Line } from '@features/drawing/model/actions/drawingLineActions.js';
import type { DrawingPoint } from '@features/drawing/model/actions/drawingPointActions.js';
import type { Feature } from 'geojson';
import { describe, expect, it } from 'vitest';
import {
  featureToWire,
  fromWire,
  lineToFeature,
  partitionFeatures,
  pointToFeature,
  sameValue,
  toWire,
} from './drawingWire.js';

const at = (lat: number, lon: number, id: number) => ({ lat, lon, id });

const point: DrawingPoint = {
  coords: { lat: 48.1, lon: 17.1 },
  label: '{p:name}',
  color: '#ff000080',
  markerType: 'ring',
  icon: 'poi:peak',
  props: { name: 'Sitno', ele: '1009' },
};

const polygon: Line = {
  type: 'polygon',
  points: [at(0, 0, 0), at(0, 1, 1), at(1, 1, 2), at(1, 0, 3)],
  label: 'Lake',
  color: '#0000ff',
  fillColor: '#0000ff33',
  width: 3,
  dashArray: [4, 2],
  lineCap: 'butt',
  lineJoin: 'bevel',
};

const hole: Line = {
  type: 'polygon',
  points: [at(0.2, 0.2, 0), at(0.2, 0.4, 1), at(0.4, 0.4, 2)],
  holeOf: 0,
};

describe('the drawing form', () => {
  it('says a drawn point exactly', () => {
    const feature = pointToFeature(point);

    expect(featureToWire(feature)).toEqual({ point });
  });

  it('says a polygon with its hole exactly', () => {
    const [feature] = fromWire([
      { kind: 'line', line: polygon },
      { kind: 'line', line: hole },
    ]);

    expect(feature?.geometry).toMatchObject({ type: 'Polygon' });

    expect(featureToWire(feature!)).toEqual({ lines: [polygon, hole] });
  });

  it('cannot say elevation', () => {
    const feature: Feature = {
      ...lineToFeature({ type: 'line', points: [at(0, 0, 0), at(1, 1, 1)] }),
    };

    feature.geometry = {
      type: 'LineString',
      coordinates: [
        [0, 0, 100],
        [1, 1, 120],
      ],
    };

    expect(featureToWire(feature)).toBeUndefined();
  });

  it('cannot say a value its text table would change', () => {
    const feature = pointToFeature(point);

    feature.properties = { ...feature.properties, sym: 'Flag' };

    expect(featureToWire(feature)).toBeUndefined();
  });
});

describe('toWire and fromWire', () => {
  it('count a hole’s parent among the lines alone', () => {
    const features = [
      pointToFeature(point),
      ...fromWire([
        { kind: 'line', line: polygon },
        { kind: 'line', line: hole },
      ]),
    ];

    const { items, rest } = toWire(features);

    expect(rest).toEqual([]);

    expect(items.map((item) => item.kind)).toEqual(['point', 'line', 'line']);

    expect(items[2]).toMatchObject({ line: { holeOf: 0 } });

    expect(
      fromWire(items).every((feature, i) => sameValue(feature, features[i])),
    ).toBe(true);
  });

  it('leave a line too short to be one', () => {
    expect(
      fromWire([
        { kind: 'line', line: { type: 'line', points: [at(0, 0, 0)] } },
      ]),
    ).toEqual([]);
  });
});

describe('partitionFeatures', () => {
  it('tells drawn shapes from loaded data, by index', () => {
    // A number the table would hand back as text.
    const loaded: Feature = {
      type: 'Feature',
      properties: { ele: 1009 },
      geometry: { type: 'Point', coordinates: [0, 0] },
    };

    const { points, lines, rest } = partitionFeatures([
      loaded,
      pointToFeature(point),
    ]);

    expect(points.map((p) => p.index)).toEqual([1]);

    expect(lines).toEqual([]);

    expect(rest.map((r) => r.index)).toEqual([0]);
  });
});

describe('sameValue', () => {
  it('ignores key order and keys set to undefined', () => {
    expect(sameValue({ a: 1, b: undefined, c: [1] }, { c: [1], a: 1 })).toBe(
      true,
    );

    expect(sameValue({ a: 1 }, { a: 2 })).toBe(false);
  });
});
