import type { Feature, Position } from 'geojson';
import { describe, expect, it } from 'vitest';
import { featureToOsmXml } from './josmXml.js';

const positions: Position[] = [
  [17.1, 48.1],
  [17.2, 48.2],
  [17.3, 48.3],
];

const ring = (ps: Position[]) => [...ps, ps[0]!];

const line = (properties: Feature['properties'] = {}): Feature => ({
  type: 'Feature',
  properties,
  geometry: { type: 'LineString', coordinates: positions },
});

const polygon = (
  rings: Position[][],
  properties: Feature['properties'] = {},
): Feature => ({
  type: 'Feature',
  properties,
  geometry: { type: 'Polygon', coordinates: rings },
});

describe('featureToOsmXml', () => {
  it('writes a node per point and an open way through them', () => {
    const xml = featureToOsmXml(line());

    expect(xml).toContain('<node id="-1" lat="48.1" lon="17.1"/>');

    expect(xml).toContain(
      '<way id="-1"><nd ref="-1"/><nd ref="-2"/><nd ref="-3"/></way>',
    );

    expect(xml).not.toContain('<relation');
  });

  it('closes a ring back onto its first node', () => {
    expect(featureToOsmXml(polygon([ring(positions)]))).toContain(
      '<way id="-1"><nd ref="-1"/><nd ref="-2"/><nd ref="-3"/><nd ref="-1"/></way>',
    );
  });

  it("carries the feature's properties, and a plain label as the name", () => {
    const xml = featureToOsmXml(
      line({ name: 'Devínska cesta & spol', highway: 'path' }),
    );

    expect(xml).toContain(
      '<tag k="name" v="Devínska cesta &amp; spol"/><tag k="highway" v="path"/>',
    );
  });

  it('leaves a template label out of the tags', () => {
    expect(
      featureToOsmXml(line({ 'freemap:label': '{length}', name: '1 km' })),
    ).not.toContain('<tag');
  });

  it('makes a multipolygon of a ring with holes', () => {
    const xml = featureToOsmXml(
      polygon([ring(positions), ring(positions)], { natural: 'water' }),
    );

    // The hole's nodes carry on from the outer ring's, and each ring is a way.
    expect(xml).toContain('<node id="-4" lat="48.1" lon="17.1"/>');

    expect(xml).toContain(
      '<way id="-2"><nd ref="-4"/><nd ref="-5"/><nd ref="-6"/><nd ref="-4"/></way>',
    );

    // The tags stand on the relation, the rings being bare ways under it.
    expect(xml).toContain(
      '<relation id="-1">' +
        '<member type="way" ref="-1" role="outer"/>' +
        '<member type="way" ref="-2" role="inner"/>' +
        '<tag k="natural" v="water"/><tag k="type" v="multipolygon"/>' +
        '</relation>',
    );
  });

  it('writes nothing for a point', () => {
    expect(
      featureToOsmXml({
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [17, 48] },
      }),
    ).toBeUndefined();
  });
});
