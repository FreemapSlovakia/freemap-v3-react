import { describe, expect, it } from 'vitest';
import { parseTrackFiles } from './parseTrackFiles.js';

const point = (lon: number, lat: number) =>
  JSON.stringify({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [lon, lat] },
      },
    ],
  });

const file = (content: string, name: string) => new File([content], name);

describe('parseTrackFiles', () => {
  it('merges features from several files in order', async () => {
    const { merged, failed } = await parseTrackFiles([
      file(point(1, 1), 'a.geojson'),
      file(point(2, 2), 'b.geojson'),
    ]);

    expect(failed).toEqual([]);
    expect(merged?.features).toHaveLength(2);
    expect(merged?.features[0]?.geometry).toMatchObject({
      coordinates: [1, 1],
    });
    expect(merged?.features[1]?.geometry).toMatchObject({
      coordinates: [2, 2],
    });
  });

  it('skips files that do not parse and reports them by name', async () => {
    const { merged, failed } = await parseTrackFiles([
      file(point(1, 1), 'good.geojson'),
      file('not geodata at all', 'bad.geojson'),
    ]);

    expect(merged?.features).toHaveLength(1);
    expect(failed).toEqual(['bad.geojson']);
  });

  it('returns no merged collection when nothing parses', async () => {
    const { merged, failed } = await parseTrackFiles([
      file('garbage', 'bad.geojson'),
    ]);

    expect(merged).toBeNull();
    expect(failed).toEqual(['bad.geojson']);
  });
});
