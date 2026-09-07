import type { RootState } from '@app/store/store.js';
import type { Feature, FeatureCollection, MultiLineString } from 'geojson';
import { describe, expect, it } from 'vitest';
import { getExportables } from './garminExport.js';

/**
 * A course is one continuous line. What keeps breaking is the shape the line
 * arrives in: an OSM relation and a multi-segment recording are both a single
 * `MultiLineString` feature, which has to be flattened before its parts can be
 * joined, and a route that closes on itself must stay a line rather than
 * becoming an area.
 */

/** Three pieces of a loop, out of order and one reversed, as a relation gives them. */
const loopParts: MultiLineString['coordinates'] = [
  [
    [0, 0],
    [1, 0],
  ],
  [
    [0, 1],
    [0, 0],
  ],
  [
    [1, 0],
    [1, 1],
    [0, 1],
  ],
];

const multiLineFeature = (
  coordinates: MultiLineString['coordinates'],
): Feature<MultiLineString> => ({
  type: 'Feature',
  properties: { name: 'Route' },
  geometry: { type: 'MultiLineString', coordinates },
});

describe('garmin exportables', () => {
  it('makes a course of a loop relation pinned as a search result', () => {
    const result = getExportables().search?.({
      search: {
        selectedResults: [
          { id: { type: 'osm' }, geojson: multiLineFeature(loopParts) },
        ],
      },
    } as unknown as RootState);

    // Which corner it starts at and which way round it goes are arbitrary for a
    // loop; that it is one closed run through all four corners is the contract.
    expect(result).toHaveProperty('coordinates');

    const { coordinates } = result as { coordinates: number[][] };

    expect(coordinates).toHaveLength(5);
    expect(coordinates[0]).toEqual(coordinates.at(-1));

    expect(new Set(coordinates.map(String))).toEqual(
      new Set(['0,0', '1,0', '1,1', '0,1']),
    );
  });

  it('makes a course of a multi-segment track in the data viewer', () => {
    const trackGeojson: FeatureCollection = {
      type: 'FeatureCollection',
      features: [multiLineFeature(loopParts)],
    };

    const result = getExportables().import?.({
      trackViewer: { trackGeojson },
    } as unknown as RootState);

    expect(result).toHaveProperty('coordinates');
  });

  it('refuses two lines that do not join', () => {
    const result = getExportables().search?.({
      search: {
        selectedResults: [
          {
            id: { type: 'osm' },
            geojson: multiLineFeature([
              [
                [0, 0],
                [1, 0],
              ],
              [
                [5, 5],
                [6, 5],
              ],
            ]),
          },
        ],
      },
    } as unknown as RootState);

    expect(result).toBe('garmin.multipleLineStrings');
  });
});
