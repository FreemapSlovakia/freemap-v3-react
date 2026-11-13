import type { RootState } from '@app/store/store.js';
import { fromWire } from '@features/dataViewer/drawingWire.js';
import { withGpxHoles } from '@features/dataViewer/gpxHoles.js';
import { parseDataFile } from '@features/dataViewer/parseDataFile.js';
import { parseGpx } from '@features/dataViewer/parseGpx.js';
import type { Line } from '@features/drawing/model/actions/drawingLineActions.js';
import type { Feature, FeatureCollection, Polygon } from 'geojson';
import { describe, expect, it } from 'vitest';
import { geojsonToKml } from './model/processors/geojsonToKml.js';
import { FM_NS, GPX_STYLE_NS } from './model/processors/gpxExporter.js';
import { buildGpx } from './model/processors/gpxExportProcessorHandler.js';

const at = (lat: number, lon: number, id: number) => ({ lat, lon, id });

const collection = (features: Feature[]): FeatureCollection => ({
  type: 'FeatureCollection',
  features,
});

const outer: Line = {
  type: 'polygon',
  label: 'Lake',
  points: [at(0, 0, 0), at(0, 1, 1), at(1, 1, 2), at(1, 0, 3)],
};

const hole = (points: Line['points']): Line => ({
  type: 'polygon',
  points,
  holeOf: 0,
});

const lakeWith = (...holes: Line[]): Feature[] =>
  fromWire([outer, ...holes].map((line) => ({ kind: 'line', line })));

const island = hole([at(0.2, 0.2, 0), at(0.2, 0.4, 1), at(0.4, 0.4, 2)]);

const islet = hole([at(0.6, 0.6, 0), at(0.6, 0.8, 1), at(0.8, 0.8, 2)]);

async function gpxOf(features: Feature[]): Promise<string> {
  const state = {
    trackViewer: { trackGeojson: { type: 'FeatureCollection', features } },
    l10n: { language: 'en' },
    search: { selectedResults: [] },
  } as unknown as RootState;

  return buildGpx(() => state, {
    exportables: ['drawingAreas'],
    elevation: 'none',
  });
}

const trks = (gpx: string) =>
  Array.from(
    new DOMParser()
      .parseFromString(gpx, 'application/xml')
      .getElementsByTagName('trk'),
  );

const fm = (trk: Element, tag: string) =>
  trk.getElementsByTagNameNS(FM_NS, tag)[0]?.textContent;

describe('a polygon with holes in GPX', () => {
  it('ties each hole to its parent by a shared id', async () => {
    const [parent, ...holes] = trks(await gpxOf(lakeWith(island, islet)));

    expect(holes).toHaveLength(2);

    const id = fm(parent!, 'polygonId');

    expect(id).toBeTruthy();

    for (const trk of holes) {
      expect(fm(trk, 'holeOf')).toBe(id);
      expect(fm(trk, 'polygonId')).toBeUndefined();
    }
  });

  it('names only the parent and leaves the holes unfilled', async () => {
    const [parent, child] = trks(await gpxOf(lakeWith(island)));

    expect(parent!.getElementsByTagName('name')[0]?.textContent).toBe('Lake');

    expect(child!.getElementsByTagName('name')).toHaveLength(0);

    expect(
      child!
        .getElementsByTagNameNS(GPX_STYLE_NS, 'fill')[0]
        ?.getElementsByTagName('opacity')[0]?.textContent,
    ).toBe('0.00');
  });

  it('gives each export its own ids, so merged files keep them apart', async () => {
    const [a] = trks(await gpxOf(lakeWith(island)));

    const [b] = trks(await gpxOf(lakeWith(island)));

    expect(fm(a!, 'polygonId')).not.toBe(fm(b!, 'polygonId'));
  });

  it('writes no ids for a polygon without holes', async () => {
    const [trk] = trks(await gpxOf(lakeWith()));

    expect(fm(trk!, 'polygonId')).toBeUndefined();
  });

  it('opens as one polygon with the same rings', async () => {
    const features = lakeWith(island, islet);

    const [feature, ...rest] = parseDataFile(
      await gpxOf(features),
      'x.gpx',
    )!.features;

    expect(rest).toHaveLength(0);

    expect((feature!.geometry as Polygon).coordinates).toEqual(
      (features[0]!.geometry as Polygon).coordinates,
    );

    expect(feature!.properties).toMatchObject({ 'freemap:label': 'Lake' });
    expect(feature!.properties).not.toHaveProperty('freemap:polygonId');
  });
});

// The `<trk>`s as parsed, before any pairing: a polygon, then its hole.
async function tracks(): Promise<Feature[]> {
  const gpx = await gpxOf(lakeWith(island));

  return parseGpx(new DOMParser().parseFromString(gpx, 'application/xml'))
    .features as Feature[];
}

const stray: Feature = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'LineString',
    coordinates: [
      [5, 5],
      [6, 6],
    ],
  },
};

const opened = (features: Feature[]) =>
  withGpxHoles(collection(features)).features.map((feature) =>
    feature.geometry?.type === 'Polygon'
      ? feature.geometry.coordinates.length
      : feature.geometry?.type,
  );

describe('pairing GPX holes', () => {
  it('goes by id, not by position', async () => {
    const [parent, child] = await tracks();

    const mixed = [child!, stray, parent!];

    expect(opened(mixed)).toEqual(['LineString', 2]);
  });

  it('keeps a hole whose parent is missing as a feature of its own', async () => {
    const [, child] = await tracks();

    expect(opened([child!])).toEqual(['LineString']);
  });

  it('keeps a hole whose parent is itself a hole', async () => {
    const [parent, child] = await tracks();

    const nested: Feature = {
      ...child!,
      properties: { ...child!.properties, 'freemap:polygonId': 'h' },
    };

    const grandchild: Feature = {
      ...child!,
      properties: { ...child!.properties, 'freemap:holeOf': 'h' },
    };

    expect(opened([parent!, nested, grandchild])).toEqual([2, 'LineString']);
  });

  // The app lets a hole cross its polygon's edge; the id alone decides.
  it('pairs a hole that crosses its polygon’s edge', async () => {
    const [parent, child] = await tracks();

    const crossing: Feature = {
      ...child!,
      geometry: {
        type: 'LineString',
        coordinates: [
          [0.5, 0.5],
          [1.5, 0.5],
          [1.5, 0.7],
          [0.5, 0.5],
        ],
      },
    };

    expect(opened([parent!, crossing])).toEqual([2]);
  });

  it('pairs a hole track whatever its style says', async () => {
    const [parent, child] = await tracks();

    const {
      'freemap:type': _,
      'gpx_style:hasFill': __,
      ...unstyled
    } = child!.properties ?? {};

    expect(opened([parent!, { ...child!, properties: unstyled }])).toEqual([2]);
  });

  it('pairs no hole to an id two polygons claim', async () => {
    const [parent, child] = await tracks();

    expect(opened([parent!, parent!, child!])).toEqual([
      'LineString',
      'LineString',
      'LineString',
    ]);
  });

  it('drops the ids from what it does not pair', async () => {
    const [, child] = await tracks();

    const [orphan] = withGpxHoles(collection([child!])).features;

    expect(orphan!.properties).not.toHaveProperty('freemap:holeOf');
  });
});

describe('a polygon with holes in KML', () => {
  it('writes each hole as an innerBoundaryIs of the one Placemark', () => {
    const { kml } = geojsonToKml(collection(lakeWith(island, islet)));

    expect(kml.match(/<Placemark>/g)).toHaveLength(1);
    expect(kml.match(/<outerBoundaryIs>/g)).toHaveLength(1);
    expect(kml.match(/<innerBoundaryIs>/g)).toHaveLength(2);
  });

  it('reads back as one polygon with the same rings', () => {
    const features = lakeWith(island, islet);

    const { kml } = geojsonToKml(collection(features));

    const [feature, ...rest] = parseDataFile(kml, 'x.kml')!.features;

    expect(rest).toHaveLength(0);

    expect((feature!.geometry as Polygon).coordinates).toEqual(
      (features[0]!.geometry as Polygon).coordinates,
    );
  });
});
