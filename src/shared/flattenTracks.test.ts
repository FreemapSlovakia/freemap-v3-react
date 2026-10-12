import {
  PATH_DETAILS_PROP,
  readPathDetails,
} from '@shared/colorizers/colorize.js';
import { cumulativeDistances } from '@shared/geoutils.js';
import type {
  Feature,
  FeatureCollection,
  LineString,
  MultiLineString,
} from 'geojson';
import { describe, expect, it } from 'vitest';
import { flattenTracks } from './flattenTracks.js';

const spans = (value: string) => [{ start: 0, end: 10, value }];

const recording: Feature<MultiLineString> = {
  type: 'Feature',
  properties: {
    name: 'Ráno do hôr',
    [PATH_DETAILS_PROP]: [
      { surface: spans('asphalt') },
      { surface: spans('gravel') },
      { surface: spans('path') },
    ],
  },
  geometry: {
    type: 'MultiLineString',
    coordinates: [
      [
        [0, 0],
        [0.001, 0],
      ],
      [
        [0.01, 0],
        [0.011, 0],
      ],
      [
        [0.02, 0],
        [0.021, 0],
      ],
    ],
  },
};

const collection: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    recording,
    {
      type: 'Feature',
      properties: null,
      geometry: { type: 'Point', coordinates: [0, 0] },
    },
  ],
};

describe('flattenTracks', () => {
  // What `@turf/flatten` alone gets wrong: every part of a multi-segment track
  // ends up carrying the spans meant for all of them.
  it('gives each part only the spans of that part', () => {
    const parts = flattenTracks(recording);

    expect(parts).toHaveLength(3);

    expect(parts.map((part) => part.properties?.[PATH_DETAILS_PROP])).toEqual([
      [{ surface: spans('asphalt') }],
      [{ surface: spans('gravel') }],
      [{ surface: spans('path') }],
    ]);
  });

  it('keeps the rest of the properties on every part', () => {
    expect(
      flattenTracks(recording).map((part) => part.properties?.['name']),
    ).toEqual(['Ráno do hôr', 'Ráno do hôr', 'Ráno do hôr']);
  });

  it('splits a collection feature by feature', () => {
    const parts = flattenTracks(collection);

    expect(parts).toHaveLength(4);

    expect(parts[3]!.geometry.type).toBe('Point');

    // Nothing to narrow, so the part is left as `flatten` handed it over.
    expect(parts[3]!.properties).toEqual({});
  });

  it('leaves a single line holding its own spans alone', () => {
    const line: Feature<LineString> = {
      type: 'Feature',
      properties: { [PATH_DETAILS_PROP]: [{ surface: spans('gravel') }] },
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [0.001, 0],
        ],
      },
    };

    expect(flattenTracks(line)).toEqual([line]);
  });

  const surfaceOf = (part: Feature) =>
    readPathDetails(part as Feature<LineString>, 'surface');

  it('keeps parts with their feature past one with no geometry', () => {
    const parts = flattenTracks({
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: {}, geometry: null as never },
        recording,
      ],
    });

    expect(
      parts
        .filter((part) => part.properties?.['name'])
        .map((part) => surfaceOf(part)?.[0]?.value),
    ).toEqual(['asphalt', 'gravel', 'path']);
  });

  it('cuts spans saved as one object along the whole line into parts', () => {
    const [length0, length1] = recording.geometry.coordinates.map(
      (c) => cumulativeDistances(c).at(-1)!,
    );

    const parts = flattenTracks({
      ...recording,
      properties: {
        [PATH_DETAILS_PROP]: {
          surface: [
            { start: 0, end: length0!, value: 'asphalt' },
            { start: length0!, end: length0! + length1!, value: 'gravel' },
          ],
        },
      },
    });

    const second = surfaceOf(parts[1]!)!;

    expect(second).toHaveLength(1);
    expect(second[0]!.value).toBe('gravel');
    expect(second[0]!.start).toBeCloseTo(0, 6);
  });

  // A part the track says nothing about carries no spans, which a colorizer
  // reads as unknown rather than as the neighbour's answer.
  it('leaves a part with no spans of its own empty', () => {
    const part = flattenTracks({
      ...recording,
      properties: { ...recording.properties, [PATH_DETAILS_PROP]: [{}] },
    })[1]!;

    expect(part.properties?.[PATH_DETAILS_PROP]).toEqual([{}]);
  });
});
