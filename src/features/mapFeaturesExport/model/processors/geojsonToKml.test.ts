import { featureCollection } from '@turf/helpers';
import { describe, expect, it } from 'vitest';
import { geojsonToKml } from './geojsonToKml.js';

describe('geojsonToKml', () => {
  it('writes a LineString as a Placemark with an aabbggrr LineStyle', () => {
    const { kml, files } = geojsonToKml(
      featureCollection([
        {
          type: 'Feature',
          properties: { title: 'Trail', stroke: '#ff0000', 'stroke-width': 4 },
          geometry: {
            type: 'LineString',
            coordinates: [
              [17, 48],
              [17.1, 48.1],
            ],
          },
        },
      ]),
    );

    expect(files.size).toBe(0);
    expect(kml).toContain('<name>Trail</name>');
    // #ff0000 fully opaque → KML alpha-blue-green-red.
    expect(kml).toContain('<color>ff0000ff</color>');
    expect(kml).toContain('<width>4</width>');
    expect(kml).toContain('17,48 17.1,48.1');
  });

  it('writes a Polygon ring with a PolyStyle fill', () => {
    const { kml } = geojsonToKml(
      featureCollection([
        {
          type: 'Feature',
          properties: { fill: '#0000ff', 'fill-opacity': 0.5 },
          geometry: {
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
        },
      ]),
    );

    expect(kml).toContain('<outerBoundaryIs><LinearRing>');
    // #0000ff at 50% → alpha 0x80, blue ff, green 00, red 00.
    expect(kml).toContain('<PolyStyle><color>80ff0000</color><fill>1</fill>');
  });

  it('packs point markers into deduplicated KMZ files referenced by href', () => {
    const png = 'data:image/png;base64,AAAAAA==';

    const { kml, files } = geojsonToKml(
      featureCollection([
        {
          type: 'Feature',
          properties: { title: 'A', 'marker-png': png },
          geometry: { type: 'Point', coordinates: [17, 48] },
        },
        {
          type: 'Feature',
          properties: { title: 'B', 'marker-png': png },
          geometry: { type: 'Point', coordinates: [18, 49] },
        },
      ]),
    );

    // Identical PNGs collapse to a single packaged file.
    expect(files.size).toBe(1);
    expect([...files.keys()]).toEqual(['files/marker-0.png']);
    expect(kml).toContain('<href>files/marker-0.png</href>');
    expect(kml).toContain('17,48');
    expect(kml).toContain('18,49');
  });

  it('falls back to a tinted IconStyle when a point has no raster marker', () => {
    const { kml, files } = geojsonToKml(
      featureCollection([
        {
          type: 'Feature',
          properties: { title: 'P', 'marker-color': '#00ff00' },
          geometry: { type: 'Point', coordinates: [0, 0] },
        },
      ]),
    );

    expect(files.size).toBe(0);
    expect(kml).toContain('<IconStyle><color>ff00ff00</color></IconStyle>');
  });

  it('escapes XML metacharacters in names', () => {
    const { kml } = geojsonToKml(
      featureCollection([
        {
          type: 'Feature',
          properties: { title: 'A & B <c>' },
          geometry: { type: 'Point', coordinates: [0, 0] },
        },
      ]),
    );

    expect(kml).toContain('<name>A &amp; B &lt;c&gt;</name>');
  });

  it('shares one <Style> across identically-styled features via styleUrl', () => {
    const line = (coordinates: number[][]) => ({
      type: 'Feature' as const,
      properties: { stroke: '#ff0000', 'stroke-width': 4 },
      geometry: { type: 'LineString' as const, coordinates },
    });

    const { kml } = geojsonToKml(
      featureCollection([
        line([
          [0, 0],
          [1, 1],
        ]),
        line([
          [2, 2],
          [3, 3],
        ]),
      ]),
    );

    // One shared definition, referenced twice.
    expect(kml.match(/<Style id="s0">/g)?.length).toBe(1);
    expect(kml.match(/<styleUrl>#s0<\/styleUrl>/g)?.length).toBe(2);
    expect(kml.match(/<LineStyle>/g)?.length).toBe(1);
  });
});
