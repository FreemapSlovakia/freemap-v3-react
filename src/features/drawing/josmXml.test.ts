import { describe, expect, it } from 'vitest';
import { drawnLinesToOsmXml } from './josmXml.js';
import type { DrawnLine } from './model/actions/drawingLineActions.js';

const points = [
  { id: 0, lat: 48.1, lon: 17.1 },
  { id: 1, lat: 48.2, lon: 17.2 },
  { id: 2, lat: 48.3, lon: 17.3 },
];

const line: DrawnLine = { id: 0, type: 'line', points };

const polygon: DrawnLine = { id: 1, type: 'polygon', points };

describe('drawnLinesToOsmXml', () => {
  it('writes a node per point and an open way through them', () => {
    const xml = drawnLinesToOsmXml(line);

    expect(xml).toContain('<node id="-1" lat="48.1" lon="17.1"/>');

    expect(xml).toContain(
      '<way id="-1"><nd ref="-1"/><nd ref="-2"/><nd ref="-3"/></way>',
    );

    expect(xml).not.toContain('<relation');
  });

  it('closes a ring back onto its first node', () => {
    expect(drawnLinesToOsmXml(polygon)).toContain(
      '<way id="-1"><nd ref="-1"/><nd ref="-2"/><nd ref="-3"/><nd ref="-1"/></way>',
    );
  });

  it('leaves a two-point ring open, having no area to close', () => {
    expect(
      drawnLinesToOsmXml({ ...polygon, points: points.slice(0, 2) }),
    ).toContain('<way id="-1"><nd ref="-1"/><nd ref="-2"/></way>');
  });

  it("carries the feature's properties, and a plain label as the name", () => {
    const xml = drawnLinesToOsmXml({
      ...line,
      label: 'Devínska cesta & spol',
      props: { highway: 'path' },
    });

    expect(xml).toContain(
      '<tag k="name" v="Devínska cesta &amp; spol"/><tag k="highway" v="path"/>',
    );
  });

  it('leaves a template label out of the tags', () => {
    expect(drawnLinesToOsmXml({ ...line, label: '{length}' })).not.toContain(
      '<tag',
    );
  });

  it('makes a multipolygon of a ring with holes', () => {
    const xml = drawnLinesToOsmXml(
      { ...polygon, props: { natural: 'water' } },
      [{ ...polygon, id: 2, holeOfId: 1 }],
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

    expect(xml).toContain(
      '<way id="-1"><nd ref="-1"/><nd ref="-2"/><nd ref="-3"/><nd ref="-1"/></way>',
    );
  });
});
