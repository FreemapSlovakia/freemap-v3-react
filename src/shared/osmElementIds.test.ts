import { describe, expect, it } from 'vitest';
import { parseOsmElementId } from './osmElementIds.js';

const node = { type: 'osm', elementType: 'node', id: 123 };

describe('parseOsmElementId', () => {
  it('reads the short forms', () => {
    expect(parseOsmElementId('n123')).toEqual(node);

    expect(parseOsmElementId('W4567')).toEqual({
      type: 'osm',
      elementType: 'way',
      id: 4567,
    });

    expect(parseOsmElementId(' r890 ')).toEqual({
      type: 'osm',
      elementType: 'relation',
      id: 890,
    });
  });

  it('reads the spelled-out forms, however they are joined', () => {
    for (const query of ['node/123', 'node 123', 'node123', 'NODE / 123']) {
      expect(parseOsmElementId(query), query).toEqual(node);
    }
  });

  it('reads the element a link names', () => {
    expect(parseOsmElementId('https://www.openstreetmap.org/node/123')).toEqual(
      node,
    );

    expect(
      parseOsmElementId('https://www.openstreetmap.org/way/456/history'),
    ).toEqual({ type: 'osm', elementType: 'way', id: 456 });

    // What the address bar holds while the element is open.
    expect(
      parseOsmElementId(
        'https://www.openstreetmap.org/node/123#map=19/48.14/17.10',
      ),
    ).toEqual(node);
  });

  it('leaves a query that only looks id-shaped to the geocoder', () => {
    for (const query of [
      '',
      'R2', // a road ref, not relation 2
      'D1',
      'N 118', // a route nationale, not node 118
      'n 123',
      'n12',
      'Wien 1234',
      'sever:123',
      '123',
      'node/0',
      'n123 w456',
      'https://www.openstreetmap.org/#map=19/48.1/17.1',
    ]) {
      expect(parseOsmElementId(query), query).toBeNull();
    }
  });
});
