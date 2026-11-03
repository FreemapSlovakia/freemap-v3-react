import type { FeatureCollection, Geometry } from 'geojson';
import { latLngBounds } from 'leaflet';
import { describe, expect, it } from 'vitest';
import {
  decodeFeatureInfo,
  dropOffView,
  parseFeatureInfo,
} from './featureInfoParser.js';

describe('dropOffView', () => {
  const fc = (geometry: Geometry): FeatureCollection => ({
    type: 'FeatureCollection',
    features: [{ type: 'Feature', geometry, properties: {} }],
  });

  const kept = (geometry: Geometry, view = latLngBounds([48, 17], [49, 18])) =>
    dropOffView(fc(geometry), view).features[0]?.geometry !== null;

  it('keeps geometry in or near the view and drops it far off', () => {
    expect(kept({ type: 'Point', coordinates: [17.5, 48.5] })).toBe(true);

    expect(kept({ type: 'Point', coordinates: [18.9, 48.5] })).toBe(true);

    expect(kept({ type: 'Point', coordinates: [-30, 10] })).toBe(false);
  });

  it('compares across the antimeridian on an unwrapped view', () => {
    expect(
      kept(
        { type: 'Point', coordinates: [-175, 0] },
        latLngBounds([-5, 180], [5, 190]),
      ),
    ).toBe(true);
  });
});

describe('decodeFeatureInfo', () => {
  const latin1 = (text: string) =>
    Uint8Array.from(text, (c) => c.charCodeAt(0)).buffer;

  it('decodes a UTF-8 body with a BOM as UTF-8 whatever the header says', () => {
    const bytes = new TextEncoder().encode('﻿<a>č</a>');

    expect(
      decodeFeatureInfo(bytes.buffer, 'text/xml; charset=ISO-8859-1'),
    ).toBe('<a>č</a>');
  });

  it('decodes by the XML prolog, then the Content-Type charset', () => {
    expect(
      decodeFeatureInfo(
        latin1('<?xml version="1.0" encoding="ISO-8859-1"?><a>Übersicht</a>'),
        'application/vnd.ogc.gml; charset=UTF-8',
      ),
    ).toContain('Übersicht');

    expect(
      decodeFeatureInfo(latin1('<a>Übersicht</a>'), 'text/xml; charset=latin1'),
    ).toContain('Übersicht');

    expect(
      decodeFeatureInfo(new TextEncoder().encode('{"a":"č"}').buffer, null),
    ).toBe('{"a":"č"}');
  });
});

describe('parseFeatureInfo', () => {
  it('nulls an invalid JSON geometry, keeping the feature and the rest', () => {
    const fc = parseFeatureInfo(
      '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":null},"properties":{"a":"1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[1,2]},"properties":{}}]}',
    );

    expect(fc.features.map((f) => f.geometry)).toEqual([
      null,
      { type: 'Point', coordinates: [1, 2] },
    ]);

    expect(fc.features[0]?.properties).toEqual({ a: '1' });
  });

  it('nulls JSON geometries declared in another CRS', () => {
    const fc = parseFeatureInfo(
      '{"type":"FeatureCollection","crs":{"type":"name","properties":{"name":"urn:ogc:def:crs:EPSG::25832"}},"features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[1,2]},"properties":{}}]}',
    );

    expect(fc.features[0]?.geometry).toBeNull();
  });

  it('reads a multi-geometry that carries a gml:name', () => {
    const fc =
      parseFeatureInfo(`<FeatureCollection xmlns:gml="http://www.opengis.net/gml">
  <featureMember><a><g><gml:MultiPoint><gml:name>x</gml:name><gml:pointMember><gml:Point><gml:pos>3 4</gml:pos></gml:Point></gml:pointMember></gml:MultiPoint></g></a></featureMember>
</FeatureCollection>`);

    expect(fc.features[0]?.geometry).toEqual({
      type: 'MultiPoint',
      coordinates: [[3, 4]],
    });
  });

  it('repairs decimal-comma positions, and only those answers', () => {
    const fc = (coordinates: string, properties = '{}') =>
      `{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":${coordinates}},"properties":${properties}}]}`;

    expect(
      parseFeatureInfo(fc('[1946001,234,6211002,5]')).features[0]?.geometry,
    ).toEqual({ type: 'Point', coordinates: [1946001.234, 6211002.5] });

    // A leading zero makes the raw text invalid JSON.
    expect(
      parseFeatureInfo(fc('[1946001,05,6211002,5]')).features[0]?.geometry,
    ).toEqual({ type: 'Point', coordinates: [1946001.05, 6211002.5] });

    expect(
      parseFeatureInfo(fc('[1946001.5,6211002]', '{"codes":[1,2,3,4]}'))
        .features[0]?.properties,
    ).toEqual({ codes: [1, 2, 3, 4] });
  });

  it('throws on JSON that is not a FeatureCollection', () => {
    expect(() => parseFeatureInfo('{"results":[]}')).toThrow();

    expect(() => parseFeatureInfo('{"error":{"code":400}}')).toThrow();

    // An Esri FeatureSet.
    expect(() =>
      parseFeatureInfo('{"features":[{"attributes":{"a":1},"geometry":null}]}'),
    ).toThrow();
  });

  it('drops a multi-part geometry whose part names another CRS', () => {
    const fc =
      parseFeatureInfo(`<FeatureCollection xmlns:gml="http://www.opengis.net/gml">
  <featureMember><a><g><gml:MultiPoint><gml:pointMember><gml:Point srsName="EPSG:25832"><gml:pos>3 4</gml:pos></gml:Point></gml:pointMember></gml:MultiPoint></g></a></featureMember>
</FeatureCollection>`);

    expect(fc.features[0]?.geometry).toBeNull();
  });

  it('reads an empty answer without `type` or with null features', () => {
    expect(parseFeatureInfo('{"features":[]}').features).toEqual([]);

    expect(
      parseFeatureInfo('{"type":"FeatureCollection","features":null}').features,
    ).toEqual([]);
  });

  it('ignores a posList with a nonsensical dimension', () => {
    const fc =
      parseFeatureInfo(`<FeatureCollection xmlns:gml="http://www.opengis.net/gml">
  <featureMember><a><g><gml:LineString><gml:posList srsDimension="0">0 1 2 3</gml:posList></gml:LineString></g></a></featureMember>
</FeatureCollection>`);

    expect(fc.features[0]?.geometry).toBeNull();
  });

  it('strips every bbox and the crs, which stay in EPSG:3857', () => {
    const fc = parseFeatureInfo(
      '{"type":"FeatureCollection","bbox":[0,0,9,9],"crs":{"type":"name","properties":{"name":"EPSG:3857"}},"features":[{"type":"Feature","bbox":[0,0,9,9],"geometry":{"type":"Point","bbox":[0,0,5,5],"coordinates":[1,2]},"properties":{}}]}',
    );

    expect(fc).toEqual({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [1, 2] },
          properties: {},
        },
      ],
    });
  });

  it('reads the first readable GML geometry and the GML 2 coord form', () => {
    const fc =
      parseFeatureInfo(`<FeatureCollection xmlns:gml="http://www.opengis.net/gml">
  <featureMember><a>
    <label><gml:Curve><gml:segments><gml:LineStringSegment><gml:posList>0 0 1 1</gml:posList></gml:LineStringSegment></gml:segments></gml:Curve></label>
    <g><gml:Point><gml:coord><gml:X>3</gml:X><gml:Y>4</gml:Y></gml:coord></gml:Point></g>
  </a></featureMember>
</FeatureCollection>`);

    expect(fc.features[0]?.geometry).toEqual({
      type: 'Point',
      coordinates: [3, 4],
    });
  });

  it('skips an empty GML 2 tuple part rather than reading it as 0', () => {
    const fc =
      parseFeatureInfo(`<FeatureCollection xmlns:gml="http://www.opengis.net/gml">
  <featureMember><a><g><gml:LineString><gml:coordinates>17,48 18,49 19,</gml:coordinates></gml:LineString></g></a></featureMember>
</FeatureCollection>`);

    expect(fc.features[0]?.geometry).toEqual({
      type: 'LineString',
      coordinates: [
        [17, 48],
        [18, 49],
      ],
    });
  });

  it('reads a GML 3.1.1 posList with `dimension`', () => {
    const fc =
      parseFeatureInfo(`<FeatureCollection xmlns:gml="http://www.opengis.net/gml">
  <featureMember><a><g><gml:LineString><gml:posList dimension="3">0 1 7 2 3 7</gml:posList></gml:LineString></g></a></featureMember>
</FeatureCollection>`);

    expect(fc.features[0]?.geometry).toEqual({
      type: 'LineString',
      coordinates: [
        [0, 1],
        [2, 3],
      ],
    });
  });

  it('throws on a WMS or OWS exception', () => {
    expect(() =>
      parseFeatureInfo(
        '<?xml version="1.0"?><ServiceExceptionReport xmlns="http://www.opengis.net/ogc"><ServiceException code="InvalidFormat">no</ServiceException></ServiceExceptionReport>',
      ),
    ).toThrow('no');

    expect(() =>
      parseFeatureInfo(
        '<ows:ExceptionReport xmlns:ows="http://www.opengis.net/ows/1.1"><ows:Exception><ows:ExceptionText>bad</ows:ExceptionText></ows:Exception></ows:ExceptionReport>',
      ),
    ).toThrow('bad');
  });

  it('reads WFS 2 collections nested per layer, with GML names', () => {
    const fc =
      parseFeatureInfo(`<wfs:FeatureCollection xmlns:wfs="http://www.opengis.net/wfs/2.0" xmlns:gml="http://www.opengis.net/gml/3.2" xmlns:x="urn:x">
  <wfs:member><wfs:FeatureCollection>
    <wfs:member><x:a gml:id="a.1"><gml:name>Alpha</gml:name><x:p>1</x:p></x:a></wfs:member>
  </wfs:FeatureCollection></wfs:member>
  <wfs:member><wfs:FeatureCollection>
    <wfs:member><x:b gml:id="b.1"><gml:identifier codeSpace="c">B-1</gml:identifier></x:b></wfs:member>
  </wfs:FeatureCollection></wfs:member>
</wfs:FeatureCollection>`);

    expect(fc.features.map((f) => [f.id, f.properties])).toEqual([
      ['a.1', { name: 'Alpha', p: '1' }],
      ['b.1', { identifier: 'B-1' }],
    ]);
  });

  it('drops a curved hole but keeps the polygon', () => {
    const fc =
      parseFeatureInfo(`<FeatureCollection xmlns:gml="http://www.opengis.net/gml/3.2">
  <member><a><g><gml:Polygon>
    <gml:exterior><gml:LinearRing><gml:posList>0 0 9 0 9 9 0 0</gml:posList></gml:LinearRing></gml:exterior>
    <gml:interior><gml:Ring><gml:curveMember/></gml:Ring></gml:interior>
  </gml:Polygon></g></a></member>
</FeatureCollection>`);

    expect(fc.features[0]?.geometry).toEqual({
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [9, 0],
          [9, 9],
          [0, 0],
        ],
      ],
    });
  });

  it('throws on HTML and on documents it does not know', () => {
    expect(() => parseFeatureInfo('<html><body><p>x</body></html>')).toThrow();

    expect(() =>
      parseFeatureInfo(
        '<FeatureInfoResponse><FIELDS a="1"/></FeatureInfoResponse>',
      ),
    ).toThrow();
  });

  it('reads GeoServer GML 2 with a multipolygon', () => {
    const fc = parseFeatureInfo(`<?xml version="1.0" encoding="UTF-8"?>
<wfs:FeatureCollection xmlns:wfs="http://www.opengis.net/wfs" xmlns:gml="http://www.opengis.net/gml" xmlns:nebih="http://www.nebih.gov.hu/">
  <gml:boundedBy><gml:null>unknown</gml:null></gml:boundedBy>
  <gml:featureMember>
    <nebih:korzet_erdosultseg fid="korzet_erdosultseg.21">
      <nebih:the_geom>
        <gml:MultiPolygon srsName="http://www.opengis.net/gml/srs/epsg.xml#3857">
          <gml:polygonMember><gml:Polygon srsName="EPSG:3857"><gml:outerBoundaryIs><gml:LinearRing>
            <gml:coordinates decimal="." cs="," ts=" ">0,0 10,0 10,10 0,0</gml:coordinates>
          </gml:LinearRing></gml:outerBoundaryIs></gml:Polygon></gml:polygonMember>
        </gml:MultiPolygon>
      </nebih:the_geom>
      <nebih:nev>Budapest</nebih:nev>
      <nebih:erdosultseg>12.5</nebih:erdosultseg>
    </nebih:korzet_erdosultseg>
  </gml:featureMember>
</wfs:FeatureCollection>`);

    expect(fc.features).toEqual([
      {
        type: 'Feature',
        id: 'korzet_erdosultseg.21',
        layerName: 'korzet_erdosultseg',
        geometry: {
          type: 'MultiPolygon',
          coordinates: [
            [
              [
                [0, 0],
                [10, 0],
                [10, 10],
                [0, 0],
              ],
            ],
          ],
        },
        properties: { nev: 'Budapest', erdosultseg: '12.5' },
      },
    ]);
  });

  it('reads GML 3 posList with holes and 3D coordinates', () => {
    const fc =
      parseFeatureInfo(`<wfs:FeatureCollection xmlns:wfs="http://www.opengis.net/wfs" xmlns:gml="http://www.opengis.net/gml" xmlns:x="urn:x">
  <gml:featureMembers>
    <x:a gml:id="a.1"><x:g><gml:Polygon srsName="urn:ogc:def:crs:EPSG::3857" srsDimension="3">
      <gml:exterior><gml:LinearRing><gml:posList>0 0 5 9 0 5 9 9 5 0 0 5</gml:posList></gml:LinearRing></gml:exterior>
      <gml:interior><gml:LinearRing><gml:posList>1 1 5 2 1 5 2 2 5 1 1 5</gml:posList></gml:LinearRing></gml:interior>
    </gml:Polygon></x:g></x:a>
    <x:b gml:id="b.1"><x:g><gml:Point><gml:pos>3 4</gml:pos></gml:Point></x:g></x:b>
  </gml:featureMembers>
</wfs:FeatureCollection>`);

    expect(fc.features.map((f) => f.geometry)).toEqual([
      {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [9, 0],
            [9, 9],
            [0, 0],
          ],
          [
            [1, 1],
            [2, 1],
            [2, 2],
            [1, 1],
          ],
        ],
      },
      { type: 'Point', coordinates: [3, 4] },
    ]);
  });

  it('drops curves and geometries in another CRS, keeping properties', () => {
    const fc =
      parseFeatureInfo(`<FeatureCollection xmlns:gml="http://www.opengis.net/gml/3.2">
  <member><a><g><gml:Curve><gml:segments><gml:Arc><gml:posList>0 0 1 1 2 0</gml:posList></gml:Arc></gml:segments></gml:Curve></g><p>1</p></a></member>
  <member><b><g><gml:Point srsName="EPSG:25832"><gml:pos>3 4</gml:pos></gml:Point></g><p>2</p></b></member>
</FeatureCollection>`);

    expect(fc.features.map((f) => [f.geometry, f.properties])).toEqual([
      [null, { p: '1' }],
      [null, { p: '2' }],
    ]);
  });

  it('reads nested ALKIS/NAS leaves and code-list titles', () => {
    const fc =
      parseFeatureInfo(`<gmlx:FeatureCollection xmlns:adv="http://www.adv-online.de/namespaces/adv/gid/7.1" xmlns:gmlx="http://www.opengis.net/gml" xmlns:xlink="http://www.w3.org/1999/xlink">
<gmlx:featureMember>
<adv:AX_Flurstueck gmlx:id="DENW20AL0000DR8m">
<adv:anlass xlink:href="https://registry.gdi-de.org/codelist/x/010704" xlink:title="Qualitätssicherung"/>
<adv:position><gmlx:Polygon><gmlx:exterior><gmlx:LinearRing><gmlx:posList>0 0 1 0 1 1 0 0</gmlx:posList></gmlx:LinearRing></gmlx:exterior></gmlx:Polygon></adv:position>
<adv:gemarkung><adv:AX_Gemarkung_Schluessel><adv:land>05</adv:land><adv:gemarkungsnummer>3110</adv:gemarkungsnummer></adv:AX_Gemarkung_Schluessel></adv:gemarkung>
<adv:gemeindezugehoerigkeit><adv:AX_Gemeindekennzeichen><adv:land>05</adv:land><adv:kreis>11</adv:kreis></adv:AX_Gemeindekennzeichen></adv:gemeindezugehoerigkeit>
<adv:weistAuf xlink:href="urn:adv:oid:DENW20AL0000EWxD"/>
<adv:amtlicheFlaeche uom="m2">2355.0</adv:amtlicheFlaeche>
</adv:AX_Flurstueck>
</gmlx:featureMember>
</gmlx:FeatureCollection>`);

    expect(fc.features[0]).toMatchObject({
      id: 'DENW20AL0000DR8m',
      layerName: 'AX_Flurstueck',
      geometry: { type: 'Polygon' },
      properties: {
        anlass: 'Qualitätssicherung',
        land: '05',
        gemarkungsnummer: '3110',
        kreis: '11',
        amtlicheFlaeche: '2355.0',
      },
    });
  });

  it("reads MapServer's msGMLOutput", () => {
    const fc = parseFeatureInfo(`<?xml version="1.0" encoding="UTF-8"?>
<msGMLOutput xmlns:gml="http://www.opengis.net/gml">
  <geologische_uebersichtskarte300_layer>
  <gml:name>GÜK300: Geologische Übersichtskarte</gml:name>
    <geologische_uebersichtskarte300_feature>
      <gml:boundedBy><gml:Box srsName="EPSG:3857"><gml:coordinates>865021,6427451 868658,6430052</gml:coordinates></gml:Box></gml:boundedBy>
      <OBJECTID>3366</OBJECTID>
      <LABEL>ol</LABEL>
      <BEMERKUNG></BEMERKUNG>
    </geologische_uebersichtskarte300_feature>
  </geologische_uebersichtskarte300_layer>
</msGMLOutput>`);

    expect(fc.features).toEqual([
      {
        type: 'Feature',
        layerName: 'GÜK300: Geologische Übersichtskarte',
        geometry: null,
        properties: { OBJECTID: '3366', LABEL: 'ol' },
      },
    ]);
  });
});
