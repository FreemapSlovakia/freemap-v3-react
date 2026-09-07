import { readdirSync, readFileSync } from 'node:fs';
import type { Feature, LineString, MultiLineString } from 'geojson';
import { describe, expect, it } from 'vitest';
import { parseGpx } from './parseGpx.js';

const parse = (gpx: string) =>
  parseGpx(new DOMParser().parseFromString(gpx, 'text/xml'));

const wrap = (body: string, xmlns = '') => `<?xml version="1.0"?>
<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1"${xmlns}>${body}</gpx>`;

const FM = ' xmlns:fm="https://www.freemap.sk/GPX/1/0"';

const GARMIN =
  ' xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1" xmlns:gpxpx="http://www.garmin.com/xmlschemas/PowerExtension/v1"';

const cp = (feature: Feature | undefined) =>
  feature?.properties?.['coordinateProperties'] as
    | Record<string, unknown>
    | undefined;

describe('parseGpx geometry', () => {
  it('reads one segment as a LineString and several as a MultiLineString', () => {
    const one = parse(
      wrap(
        `<trk><trkseg><trkpt lat="48" lon="17"/><trkpt lat="48.1" lon="17.1"/></trkseg></trk>`,
      ),
    );

    expect(one.features[0]?.geometry.type).toBe('LineString');

    const two = parse(
      wrap(
        `<trk>
          <trkseg><trkpt lat="48" lon="17"/><trkpt lat="48.1" lon="17.1"/></trkseg>
          <trkseg><trkpt lat="49" lon="18"/><trkpt lat="49.1" lon="18.1"/></trkseg>
        </trk>`,
      ),
    );

    expect(two.features[0]?.geometry.type).toBe('MultiLineString');
  });

  it('takes elevation into the coordinate', () => {
    const r = parse(
      wrap(`<trk><trkseg>
        <trkpt lat="48" lon="17"><ele>500</ele></trkpt>
        <trkpt lat="48.1" lon="17.1"/>
      </trkseg></trk>`),
    );

    expect((r.features[0] as Feature<LineString>).geometry.coordinates).toEqual(
      [
        [17, 48, 500],
        [17.1, 48.1],
      ],
    );
  });

  it('yields nothing for an element with no line in it', () => {
    const r = parse(
      wrap(
        `<trk><name>empty</name><trkseg/></trk>
         <trk><name>lone</name><trkseg><trkpt lat="48" lon="17"/></trkseg></trk>
         <trk><name>real</name><trkseg><trkpt lat="48" lon="17"/><trkpt lat="48.1" lon="17.1"/></trkseg></trk>`,
      ),
    );

    // A segment of one point is not a line, and the one that survives is still
    // the one that has them — an element yielding no feature cannot shift what
    // the next one is read as.
    expect(r.features).toHaveLength(1);
    expect(r.features[0]?.properties?.['name']).toBe('real');
  });

  it('drops a lone point from a track that has other segments', () => {
    const r = parse(
      wrap(
        `<trk>
          <trkseg><trkpt lat="48" lon="17"/><trkpt lat="48.1" lon="17.1"/></trkseg>
          <trkseg><trkpt lat="49" lon="18"/></trkseg>
        </trk>`,
      ),
    );

    expect(r.features[0]?.geometry.type).toBe('LineString');
  });
});

describe('parseGpx per-point channels', () => {
  it('names the series as the app reads them, padding what a point lacks', () => {
    const r = parse(
      wrap(
        `<trk><trkseg>
          <trkpt lat="48" lon="17"><time>2024-06-01T08:00:00Z</time><extensions>
            <gpxtpx:TrackPointExtension><gpxtpx:hr>120</gpxtpx:hr><gpxtpx:cad>80</gpxtpx:cad><gpxtpx:atemp>18</gpxtpx:atemp></gpxtpx:TrackPointExtension>
            <gpxpx:PowerExtension><gpxpx:PowerInWatts>200</gpxpx:PowerInWatts></gpxpx:PowerExtension>
            <accuracy>4</accuracy>
          </extensions></trkpt>
          <trkpt lat="48.1" lon="17.1"><time>2024-06-01T08:00:08Z</time></trkpt>
        </trkseg></trk>`,
        GARMIN,
      ),
    );

    expect(cp(r.features[0])).toEqual({
      times: ['2024-06-01T08:00:00Z', '2024-06-01T08:00:08Z'],
      heart: [120, null],
      cads: [80, null],
      atemps: [18, null],
      powers: [200, null],
      // The plural the recorder writes, which `${name}s` would get wrong.
      accuracies: [4, null],
    });
  });

  it('keeps a series aligned when a point states it twice', () => {
    const r = parse(
      wrap(
        `<trk><trkseg>
          <trkpt lat="48" lon="17"><extensions>
            <power>200</power>
            <gpxpx:PowerExtension><gpxpx:PowerInWatts>201</gpxpx:PowerInWatts></gpxpx:PowerExtension>
          </extensions></trkpt>
          <trkpt lat="48.1" lon="17.1"><extensions><power>210</power></extensions></trkpt>
        </trkseg></trk>`,
        GARMIN,
      ),
    );

    // Both spell the same series, so the last one stands — one entry per point
    // rather than a series running ahead of the coordinates.
    expect(cp(r.features[0])?.['powers']).toEqual([201, 210]);
  });

  it('reads an empty element as absent, not as zero', () => {
    const r = parse(
      wrap(
        `<trk><trkseg>
          <trkpt lat="48" lon="17"><ele></ele></trkpt>
          <trkpt lat="48.1" lon="17.1"><ele>500</ele></trkpt>
        </trkseg></trk>`,
      ),
    );

    expect((r.features[0] as Feature<LineString>).geometry.coordinates).toEqual(
      [
        [17, 48],
        [17.1, 48.1, 500],
      ],
    );
  });

  it('lays the series out per segment for a MultiLineString', () => {
    const r = parse(
      wrap(
        `<trk>
          <trkseg><trkpt lat="48" lon="17"><time>a</time></trkpt><trkpt lat="48.1" lon="17.1"/></trkseg>
          <trkseg><trkpt lat="49" lon="18"><time>b</time></trkpt><trkpt lat="49.1" lon="18.1"/></trkseg>
        </trk>`,
      ),
    );

    expect(cp(r.features[0])?.['times']).toEqual([
      ['a', null],
      ['b', null],
    ]);
  });

  it('keeps a route’s own points and their times', () => {
    const r = parse(
      wrap(
        `<rte><name>R</name><rtept lat="48" lon="17"><time>a</time></rtept><rtept lat="48.1" lon="17.1"><time>b</time></rtept></rte>`,
      ),
    );

    expect(r.features[0]?.properties?.['_gpxType']).toBe('rte');
    expect(cp(r.features[0])?.['times']).toEqual(['a', 'b']);
  });
});

describe('parseGpx properties', () => {
  it('keeps an element to its own metadata', () => {
    const r = parse(
      wrap(
        `<trk><name>T</name><trkseg>
          <trkpt lat="48" lon="17"><time>2024-06-01T08:00:00Z</time><extensions>
            <gpxtpx:TrackPointExtension><gpxtpx:hr>120</gpxtpx:hr></gpxtpx:TrackPointExtension>
          </extensions></trkpt>
          <trkpt lat="48.1" lon="17.1"/>
        </trkseg></trk>`,
        GARMIN,
      ),
    );

    const props = r.features[0]?.properties;

    expect(props?.['name']).toBe('T');
    expect(props?.['time']).toBeUndefined();
    expect(props?.['gpxtpx:hr']).toBeUndefined();
    expect(props?.['gpxtpx_hr']).toBeUndefined();
  });

  it('reads a waypoint’s own fields, elevation included', () => {
    const r = parse(
      wrap(
        `<wpt lat="48" lon="17"><ele>514</ele><time>2024-06-01T08:00:00Z</time><name>WP</name><desc>d</desc><sym>Flag, Blue</sym></wpt>`,
      ),
    );

    const f = r.features[0]!;

    expect(f.geometry).toEqual({ type: 'Point', coordinates: [17, 48, 514] });

    expect(f.properties).toMatchObject({
      name: 'WP',
      desc: 'd',
      sym: 'Flag, Blue',
      time: '2024-06-01T08:00:00Z',
    });
  });

  it('states our own extensions once, under the canonical key', () => {
    const r = parse(
      wrap(
        `<wpt lat="48" lon="17"><name>Dubník 504</name><extensions>
          <fm:label>{p:name} {p:ele}</fm:label>
          <fm:color>#ff0000ff</fm:color>
          <fm:prop key="name">Dubník</fm:prop>
          <fm:prop key="ele">504</fm:prop>
        </extensions></wpt>`,
        FM,
      ),
    );

    const props = r.features[0]?.properties;

    expect(props?.['freemap:label']).toBe('{p:name} {p:ele}');
    expect(props?.['freemap:color']).toBe('#ff0000ff');
    expect(props?.['freemap:props']).toEqual({ name: 'Dubník', ele: '504' });

    // No second spelling of the same element.
    expect(props?.['fm:label']).toBeUndefined();
    expect(props?.['fm_label']).toBeUndefined();
  });

  it('spells a known namespace the same way whatever prefix the file used', () => {
    const r = parse(
      wrap(
        `<trk><extensions><garmin:DisplayColor>Red</garmin:DisplayColor></extensions>
        <trkseg><trkpt lat="48" lon="17"/><trkpt lat="48.1" lon="17.1"/></trkseg></trk>`,
        // Garmin's own namespace, under a prefix nobody else writes.
        ' xmlns:garmin="http://www.garmin.com/xmlschemas/GpxExtensions/v3"',
      ),
    );

    expect(r.features[0]?.properties?.['gpxx:DisplayColor']).toBe('Red');
    expect(r.features[0]?.properties?.['garmin:DisplayColor']).toBeUndefined();
  });

  it('never lets an extension overwrite what the element states itself', () => {
    const r = parse(
      wrap(
        `<trk><name>T</name><extensions><name>not the track's</name></extensions>
        <trkseg><trkpt lat="48" lon="17"/><trkpt lat="48.1" lon="17.1"/></trkseg></trk>`,
      ),
    );

    expect(r.features[0]?.properties?.['name']).toBe('T');
  });

  it('keeps an unknown namespace under the file’s own name', () => {
    const r = parse(
      wrap(
        `<trk><extensions><who:Thing>x</who:Thing></extensions>
        <trkseg><trkpt lat="48" lon="17"/><trkpt lat="48.1" lon="17.1"/></trkseg></trk>`,
        ' xmlns:who="https://example.com/whoknows"',
      ),
    );

    expect(r.features[0]?.properties?.['who:Thing']).toBe('x');
  });

  it('reads gpx_style as pixels and flags a filled track', () => {
    const r = parse(
      wrap(
        `<trk><extensions><gpx_style:line>
          <gpx_style:color>ff0000</gpx_style:color>
          <gpx_style:opacity>0.5</gpx_style:opacity>
          <gpx_style:width>6</gpx_style:width>
          <gpx_style:fill>00ff00</gpx_style:fill>
        </gpx_style:line></extensions>
        <trkseg><trkpt lat="48" lon="17"/><trkpt lat="48.1" lon="17.1"/></trkseg></trk>`,
        ' xmlns:gpx_style="http://www.topografix.com/GPX/gpx_style/0/2"',
      ),
    );

    expect(r.features[0]?.properties).toMatchObject({
      stroke: '#ff0000',
      'stroke-opacity': 0.5,
      // Not the schema's millimetres, which would make this a 23 px slab.
      'stroke-width': 6,
      'gpx_style:hasFill': 'true',
    });
  });
});

// Vitest runs from the repo root.
const SAMPLES = `${process.cwd()}/samples`;

describe('parseGpx over the sample files', () => {
  const files = readdirSync(SAMPLES).filter((name) => name.endsWith('.gpx'));

  it.each(files)('%s parses with every series aligned', (name) => {
    const parsed = parse(readFileSync(`${SAMPLES}/${name}`, 'utf8'));

    expect(parsed.features.length).toBeGreaterThan(0);

    for (const feature of parsed.features) {
      const geometry = feature.geometry;

      if (
        geometry.type !== 'LineString' &&
        geometry.type !== 'MultiLineString'
      ) {
        continue;
      }

      const lengths =
        geometry.type === 'LineString'
          ? [geometry.coordinates.length]
          : (geometry as MultiLineString).coordinates.map((s) => s.length);

      for (const series of Object.values(cp(feature) ?? {})) {
        const perSegment = (
          lengths.length > 1 ? series : [series]
        ) as unknown[][];

        expect(perSegment.map((s) => s.length)).toEqual(lengths);
      }
    }
  });
});
