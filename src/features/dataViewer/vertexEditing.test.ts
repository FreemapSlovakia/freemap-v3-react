import type { Feature, Polygon } from 'geojson';
import { describe, expect, it } from 'vitest';
import {
  completed,
  deleteVertex,
  editableParts,
  insertVertex,
  moveVertex,
  reverseFeature,
  setVertexValues,
} from './vertexEditing.js';

const track = (): Feature => ({
  type: 'Feature',
  properties: {
    coordinateProperties: {
      times: ['t0', 't1', 't2'],
      heart: [100, 110, 120],
    },
  },
  geometry: {
    type: 'LineString',
    coordinates: [
      [17, 48, 200],
      [17.01, 48, 210],
      [17.02, 48, 220],
    ],
  },
});

const channel = (feature: Feature, key: string) =>
  (feature.properties!['coordinateProperties'] as Record<string, unknown>)[key];

const square: Polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [0, 0],
    ],
  ],
};

describe('editableParts', () => {
  it('lists a ring open', () => {
    expect(editableParts(square)).toEqual([
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ],
    ]);
  });

  it('has no parts for a multi-polygon', () => {
    expect(
      editableParts({
        type: 'MultiPolygon',
        coordinates: [square.coordinates],
      }),
    ).toBeUndefined();
  });
});

describe('moving a vertex', () => {
  it('keeps its channels, but not the elevation of where it stood', () => {
    const moved = moveVertex(track(), 0, 1, [17.015, 48.001]);

    expect(moved.geometry).toMatchObject({
      coordinates: [
        [17, 48, 200],
        [17.015, 48.001],
        [17.02, 48, 220],
      ],
    });

    expect(channel(moved, 'heart')).toEqual([100, 110, 120]);
  });

  it('closes a ring again', () => {
    const feature: Feature = {
      type: 'Feature',
      properties: {},
      geometry: square,
    };

    const moved = moveVertex(feature, 0, 0, [-1, -1]);

    expect((moved.geometry as Polygon).coordinates[0]).toEqual([
      [-1, -1],
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, -1],
    ]);
  });
});

describe('setting a vertex values', () => {
  it('writes the position and the named channels only', () => {
    const edited = setVertexValues(track(), 0, 1, [17.011, 48.001], {
      heart: 115,
    });

    expect(edited.geometry).toMatchObject({
      coordinates: [
        [17, 48, 200],
        [17.011, 48.001],
        [17.02, 48, 220],
      ],
    });

    expect(channel(edited, 'heart')).toEqual([100, 115, 120]);

    expect(channel(edited, 'times')).toEqual(['t0', 't1', 't2']);
  });

  it('creates no channel the line lacks', () => {
    const edited = setVertexValues(track(), 0, 2, [17.02, 48, 220], {
      powers: 250,
    });

    expect(channel(edited, 'powers')).toBeUndefined();
  });

  it('writes a segment of a multi-segment track', () => {
    const feature: Feature = {
      type: 'Feature',
      properties: {
        coordinateProperties: {
          heart: [
            [1, 2],
            [3, 4],
          ],
        },
      },
      geometry: {
        type: 'MultiLineString',
        coordinates: [
          [
            [0, 0],
            [1, 0],
          ],
          [
            [2, 0],
            [3, 0],
          ],
        ],
      },
    };

    const edited = setVertexValues(feature, 1, 0, [2, 0], { heart: null });

    expect(channel(edited, 'heart')).toEqual([
      [1, 2],
      [null, 4],
    ]);
  });
});

describe('inserting a vertex', () => {
  it('gives it no recorded data', () => {
    const inserted = insertVertex(track(), 0, 1, [17.005, 48]);

    expect(channel(inserted, 'times')).toEqual(['t0', null, 't1', 't2']);

    expect(channel(inserted, 'heart')).toEqual([100, null, 110, 120]);
  });
});

describe('deleting a vertex', () => {
  it('takes its channel entries along', () => {
    const deleted = deleteVertex(track(), 0, 1);

    expect(channel(deleted, 'times')).toEqual(['t0', 't2']);
  });
});

describe('reversing', () => {
  it('turns the channels round with the line', () => {
    const reversed = reverseFeature(track());

    expect(channel(reversed, 'heart')).toEqual([120, 110, 100]);

    expect(reversed.geometry).toMatchObject({
      coordinates: [
        [17.02, 48, 220],
        [17.01, 48, 210],
        [17, 48, 200],
      ],
    });
  });
});

describe('completed', () => {
  it('drops a hole still short of a ring', () => {
    const feature: Feature = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [
          square.coordinates[0]!,
          [
            [0.2, 0.2],
            [0.2, 0.2],
          ],
        ],
      },
    };

    expect((completed(feature)!.geometry as Polygon).coordinates).toHaveLength(
      1,
    );
  });

  it('drops a line of one vertex', () => {
    expect(
      completed({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: [[0, 0]] },
      }),
    ).toBeUndefined();
  });
});
