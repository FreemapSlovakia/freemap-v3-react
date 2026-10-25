import type { Feature } from 'geojson';
import { describe, expect, it } from 'vitest';
import {
  parseVertexField,
  toLocalInput,
  type VertexField,
  vertexEdit,
  vertexFields,
} from './vertexValues.js';

const track: Feature = {
  type: 'Feature',
  properties: {
    coordinateProperties: {
      times: [
        '2026-10-23T08:00:00Z',
        '2026-10-23T08:00:10Z',
        '2026-10-23T08:00:20Z',
      ],
      heart: [100, null, 120],
      speeds: [2.5, 3, 3.5],
      notes: ['a', 'b', 'c'],
    },
  },
  geometry: {
    type: 'LineString',
    coordinates: [
      [17, 48, 200],
      [17.01, 48],
      [17.02, 48, 220],
    ],
  },
};

const field = (key: string): VertexField =>
  vertexFields(track, 0, 1).fields.find((f) => f.key === key)!;

const { timeBounds } = vertexFields(track, 0, 1);

describe('vertexFields', () => {
  it('lists the position and every plain channel', () => {
    expect(vertexFields(track, 0, 1).fields.map((f) => f.key)).toEqual([
      'lat',
      'lon',
      'ele',
      'times',
      'heart',
      'speeds',
      'notes',
    ]);
  });

  it('shows a missing value as an empty field and speed in km/h', () => {
    expect(field('ele').text).toBe('');

    expect(field('heart').text).toBe('');

    expect(field('speeds').text).toBe('10.8');
  });
});

describe('parseVertexField', () => {
  it('writes an untouched field back exactly', () => {
    expect(parseVertexField(field('speeds'), '10.8', timeBounds)).toEqual({
      value: 3,
    });
  });

  it('stores a typed speed in m/s', () => {
    expect(parseVertexField(field('speeds'), '36', timeBounds)).toEqual({
      value: 10,
    });
  });

  it('clears a value but not a coordinate', () => {
    expect(parseVertexField(field('heart'), ' ', timeBounds)).toEqual({
      value: null,
    });

    expect(parseVertexField(field('lat'), '', timeBounds)).toEqual({
      error: 'notANumber',
    });
  });

  it('refuses a latitude past the pole', () => {
    expect(parseVertexField(field('lat'), '91', timeBounds)).toEqual({
      error: 'outOfRange',
    });
  });

  it('keeps the time between its neighbours', () => {
    const local = (iso: string) => toLocalInput(iso);

    expect(
      parseVertexField(
        field('times'),
        local('2026-10-23T08:00:15Z'),
        timeBounds,
      ),
    ).toEqual({ value: '2026-10-23T08:00:15Z' });

    expect(
      parseVertexField(
        field('times'),
        local('2026-10-23T08:00:25Z'),
        timeBounds,
      ),
    ).toEqual({ error: 'timeOrder' });
  });
});

describe('vertexEdit', () => {
  it('leaves a position without elevation 2D', () => {
    expect(
      vertexEdit(
        new Map<string, unknown>([
          ['lat', 48],
          ['lon', 17],
          ['ele', null],
          ['heart', 110],
        ]),
      ),
    ).toEqual({ position: [17, 48], values: { heart: 110 } });
  });
});
