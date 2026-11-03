import { describe, expect, it } from 'vitest';
import { hasMoved, isIndirect, parseAdiff } from './changesetDiff.js';

const ADIFF = `<?xml version="1.0" encoding="utf-8"?>
<osm version="0.6" generator="osmcha">
  <action type="create">
    <node id="1" version="1" lon="17.1" lat="48.1">
      <tag k="amenity" v="bench"/>
    </node>
  </action>
  <action type="modify">
    <old>
      <way id="2" version="3">
        <bounds minlat="48" minlon="17" maxlat="48.1" maxlon="17.1"/>
        <nd ref="10" version="1" lon="17.0" lat="48.0"/>
        <nd ref="11" version="1" lon="17.1" lat="48.1"/>
        <tag k="highway" v="track"/>
        <tag k="tracktype" v="grade3"/>
      </way>
    </old>
    <new>
      <way id="2" version="3">
        <nd ref="10" version="1" lon="17.0" lat="48.0"/>
        <nd ref="11" version="2" lon="17.2" lat="48.1"/>
        <tag k="highway" v="track"/>
        <tag k="tracktype" v="grade3"/>
      </way>
    </new>
  </action>
  <action type="delete">
    <old>
      <node id="3" version="1" lon="17.3" lat="48.3"/>
    </old>
    <new>
      <node id="3" version="2" visible="false" lon="17.3" lat="48.3"/>
    </new>
  </action>
  <action type="modify">
    <old>
      <relation id="4" version="7">
        <member type="way" ref="2" role="forward">
          <nd ref="10" version="1" lon="17.0" lat="48.0"/>
        </member>
        <tag k="type" v="route"/>
      </relation>
    </old>
    <new>
      <relation id="4" version="8">
        <member type="way" ref="2" role="forward">
          <nd ref="10" version="1" lon="17.0" lat="48.0"/>
        </member>
        <member type="way" ref="5" role=""/>
        <tag k="type" v="route"/>
        <tag k="name" v="Red trail"/>
      </relation>
    </new>
  </action>
</osm>`;

describe('parseAdiff', () => {
  const diff = parseAdiff(new DOMParser().parseFromString(ADIFF, 'text/xml'));

  it('reads a creation', () => {
    expect(diff[0]).toEqual({
      type: 'node',
      id: 1,
      action: 'create',
      old: null,
      new: {
        version: 1,
        tags: { amenity: 'bench' },
        coords: [[48.1, 17.1]],
        members: [],
      },
    });
  });

  it('reads a way whose node moved as an indirect modification', () => {
    const way = diff[1];

    expect(way.old?.coords).toEqual([
      [48.0, 17.0],
      [48.1, 17.1],
    ]);

    expect(way.new?.coords[1]).toEqual([48.1, 17.2]);

    expect(isIndirect(way)).toBe(true);

    expect(hasMoved(way)).toBe(true);
  });

  it('drops the tombstone of a deletion', () => {
    expect(diff[2]).toMatchObject({
      action: 'delete',
      old: { coords: [[48.3, 17.3]] },
      new: null,
    });
  });

  it("keeps a relation's members but not their geometry", () => {
    expect(diff[3].old?.coords).toEqual([]);

    expect(diff[3].new?.members).toEqual(['way/2:forward', 'way/5']);

    expect(diff[3].new?.tags['name']).toBe('Red trail');

    expect(hasMoved(diff[3])).toBe(false);
  });
});
