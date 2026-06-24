import { writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Regenerate the sample tracks: `node samples/gen-samples.mjs`.
// Deterministic, so re-running produces identical files. Extend the synthetic
// fields in `pt()` (and the writers below) to add new sample variants.
const OUT = dirname(fileURLToPath(import.meta.url));

// Deterministic synthetic track near Košice, SK (matches complex.gpx area).
const N = 60;
const START_MS = Date.parse('2024-06-01T08:00:00Z');

function pt(i) {
  const t = i / (N - 1);
  return {
    lat: 48.74 + 0.06 * t + 0.004 * Math.sin(t * 6),
    lon: 21.05 + 0.1 * t + 0.004 * Math.cos(t * 5),
    ele: Math.round(
      600 + 250 * Math.sin(t * Math.PI * 2) + 60 * Math.sin(t * 18),
    ),
    time: new Date(START_MS + i * 8000).toISOString(),
    hr: Math.round(120 + 35 * Math.sin(t * 8)),
    cad: Math.round(80 + 10 * Math.sin(t * 5)),
    atemp: Math.round((18 + 4 * Math.sin(t * 3)) * 10) / 10,
    power: Math.round(200 + 80 * Math.sin(t * 7)),
    // Recorded speed (m/s) and course (degrees, two full sweeps over the track).
    speed: Math.round((3 + 2 * Math.sin(t * 9)) * 100) / 100,
    course: Math.round((t * 720) % 360),
  };
}

const pts = Array.from({ length: N }, (_, i) => pt(i));

const GPX_HEAD = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="freemap sample generator" xmlns="http://www.topografix.com/GPX/1/1" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1" xmlns:gpxpx="http://www.garmin.com/xmlschemas/PowerExtension/v1">`;
const GPX_TAIL = `</gpx>\n`;

function trkpt(p, { ele = true, time = true, ext = false } = {}) {
  const lines = [
    `      <trkpt lat="${p.lat.toFixed(7)}" lon="${p.lon.toFixed(7)}">`,
  ];
  if (ele) lines.push(`        <ele>${p.ele}</ele>`);
  if (time) lines.push(`        <time>${p.time}</time>`);
  if (ext) {
    const tpx = [`          <gpxtpx:TrackPointExtension>`];
    // Heart rate may be absent for a stretch (sensor dropout) — omit the tag so
    // the importer sees a real gap rather than a zero.
    if (p.hr != null) tpx.push(`            <gpxtpx:hr>${p.hr}</gpxtpx:hr>`);
    tpx.push(
      `            <gpxtpx:cad>${p.cad}</gpxtpx:cad>`,
      `            <gpxtpx:atemp>${p.atemp}</gpxtpx:atemp>`,
      `            <gpxtpx:speed>${p.speed}</gpxtpx:speed>`,
      `            <gpxtpx:course>${p.course}</gpxtpx:course>`,
      `          </gpxtpx:TrackPointExtension>`,
    );
    lines.push(
      `        <extensions>`,
      ...tpx,
      `          <gpxpx:PowerExtension><gpxpx:PowerInWatts>${p.power}</gpxpx:PowerInWatts></gpxpx:PowerExtension>`,
      `        </extensions>`,
    );
  }
  lines.push(`      </trkpt>`);
  return lines.join('\n');
}

function gpxTrack(name, segPts, opts) {
  const segs = segPts
    .map(
      (seg) =>
        `    <trkseg>\n${seg.map((p) => trkpt(p, opts)).join('\n')}\n    </trkseg>`,
    )
    .join('\n');
  return `${GPX_HEAD}\n  <trk>\n    <name>${name}</name>\n${segs}\n  </trk>\n${GPX_TAIL}`;
}

function write(name, content) {
  writeFileSync(`${OUT}/${name}`, content);
  console.log('wrote', name);
}

// --- GPX ---------------------------------------------------------------

// Everything: elevation, time, HR, cadence, temperature, power.
write(
  'track-full.gpx',
  gpxTrack('Full track', [pts], { ele: true, time: true, ext: true }),
);

// Elevation + time only (chart works locally; speed/time colorizers work).
write(
  'track-elevation-time.gpx',
  gpxTrack('Elevation + time', [pts], { ele: true, time: true }),
);

// No elevation at all (chart/colorize-by-elevation need server fill).
write(
  'track-no-elevation.gpx',
  gpxTrack('No elevation', [pts], { ele: false, time: true }),
);

// Partial elevation: present in the first and last third, missing in the
// middle — exercises gap rendering and "fill missing".
{
  const seg = pts
    .map((p, i) => trkpt(p, { ele: i < 20 || i >= 40, time: true }))
    .join('\n');
  write(
    'track-partial-elevation.gpx',
    `${GPX_HEAD}\n  <trk>\n    <name>Partial elevation</name>\n    <trkseg>\n${seg}\n    </trkseg>\n  </trk>\n${GPX_TAIL}`,
  );
}

// Partial heart rate: HR present in the first and last third, dropped in the
// middle — exercises gap rendering of the HR colorizer (other channels stay
// continuous). The middle still carries cadence/temperature/speed/course.
{
  const gapped = pts.map((p, i) =>
    i >= 20 && i < 40 ? { ...p, hr: null } : p,
  );
  write(
    'track-partial-hr.gpx',
    gpxTrack('Partial heart rate', [gapped], {
      ele: true,
      time: true,
      ext: true,
    }),
  );
}

// Multiple segments (gaps between recording sessions).
write(
  'track-multisegment.gpx',
  gpxTrack(
    'Multi-segment',
    [pts.slice(0, 20), pts.slice(25, 45), pts.slice(50)],
    { ele: true, time: true },
  ),
);

// Route (rte) with elevation.
write(
  'route.gpx',
  `${GPX_HEAD}\n  <rte>\n    <name>Sample route</name>\n${pts
    .filter((_, i) => i % 6 === 0)
    .map(
      (p) =>
        `    <rtept lat="${p.lat.toFixed(7)}" lon="${p.lon.toFixed(7)}"><ele>${p.ele}</ele></rtept>`,
    )
    .join('\n')}\n  </rte>\n${GPX_TAIL}`,
);

// Waypoints only.
write(
  'waypoints.gpx',
  `${GPX_HEAD}\n${pts
    .filter((_, i) => i % 15 === 0)
    .map(
      (p, i) =>
        `  <wpt lat="${p.lat.toFixed(7)}" lon="${p.lon.toFixed(7)}"><ele>${p.ele}</ele><name>WP ${i + 1}</name></wpt>`,
    )
    .join('\n')}\n${GPX_TAIL}`,
);

// --- KML ---------------------------------------------------------------

// A gx:Track carries per-point timestamps and 3D coords; togeojson reads it as
// a LineString with `coordTimes` (KML has no native HR/cadence/etc.).
function kmlTrack(name, usePts) {
  const whens = usePts.map((p) => `        <when>${p.time}</when>`).join('\n');
  const coords = usePts
    .map(
      (p) =>
        `        <gx:coord>${p.lon.toFixed(7)} ${p.lat.toFixed(7)} ${p.ele}</gx:coord>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2">
  <Document>
    <Placemark>
      <name>${name}</name>
      <gx:Track>
${whens}
${coords}
      </gx:Track>
    </Placemark>
  </Document>
</kml>
`;
}

write('track-full.kml', kmlTrack('Full track', pts));

// --- TCX ---------------------------------------------------------------

// Activity/Lap/Track with HR + cadence (core) and speed + watts (ActivityExtension
// ns3). The importer relocates these onto coordinateProperties.
function tcxRide(name, usePts) {
  const tps = usePts
    .map(
      (p) => `        <Trackpoint>
          <Time>${p.time}</Time>
          <Position><LatitudeDegrees>${p.lat.toFixed(7)}</LatitudeDegrees><LongitudeDegrees>${p.lon.toFixed(7)}</LongitudeDegrees></Position>
          <AltitudeMeters>${p.ele}</AltitudeMeters>
          <HeartRateBpm><Value>${p.hr}</Value></HeartRateBpm>
          <Cadence>${p.cad}</Cadence>
          <Extensions><ns3:TPX><ns3:Speed>${p.speed}</ns3:Speed><ns3:Watts>${p.power}</ns3:Watts></ns3:TPX></Extensions>
        </Trackpoint>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2" xmlns:ns3="http://www.garmin.com/xmlschemas/ActivityExtension/v2">
  <Activities>
    <Activity Sport="Biking">
      <Id>${usePts[0].time}</Id>
      <Name>${name}</Name>
      <Lap StartTime="${usePts[0].time}">
        <Track>
${tps}
        </Track>
      </Lap>
    </Activity>
  </Activities>
</TrainingCenterDatabase>
`;
}

write('track-full.tcx', tcxRide('Full ride', pts));

// --- GeoJSON -----------------------------------------------------------

function lineFeature(usePts, { ele = true, props = {} } = {}) {
  return {
    type: 'Feature',
    properties: {
      name: props.name,
      coordTimes: usePts.map((p) => p.time),
      coordinateProperties: {
        heart: usePts.map((p) => p.hr),
        cads: usePts.map((p) => p.cad),
        atemps: usePts.map((p) => p.atemp),
        powers: usePts.map((p) => p.power),
        speeds: usePts.map((p) => p.speed),
        courses: usePts.map((p) => p.course),
      },
      ...props,
    },
    geometry: {
      type: 'LineString',
      coordinates: usePts.map((p) =>
        ele ? [p.lon, p.lat, p.ele] : [p.lon, p.lat],
      ),
    },
  };
}

function fc(features) {
  return (
    JSON.stringify({ type: 'FeatureCollection', features }, null, 2) + '\n'
  );
}

// Full LineString with elevation + all coordinateProperties.
write(
  'track-full.geojson',
  fc([lineFeature(pts, { props: { name: 'Full track' } })]),
);

// Heart rate missing in the middle third (null entries in the `heart` array) —
// exercises HR gap rendering while the other channels stay continuous.
write(
  'track-partial-hr.geojson',
  fc([
    lineFeature(
      pts.map((p, i) => (i >= 20 && i < 40 ? { ...p, hr: null } : p)),
      { props: { name: 'Partial heart rate' } },
    ),
  ]),
);

// 2D LineString, no elevation.
write(
  'track-no-elevation.geojson',
  fc([lineFeature(pts, { ele: false, props: { name: 'No elevation' } })]),
);

// Mixed arity: first/last third 3D, middle 2D (gaps).
write(
  'track-partial-elevation.geojson',
  fc([
    {
      type: 'Feature',
      properties: { name: 'Partial elevation' },
      geometry: {
        type: 'LineString',
        coordinates: pts.map((p, i) =>
          i >= 20 && i < 40 ? [p.lon, p.lat] : [p.lon, p.lat, p.ele],
        ),
      },
    },
  ]),
);

// Mixed collection: point, line (3D), polygon.
write(
  'collection-mixed.geojson',
  fc([
    {
      type: 'Feature',
      properties: { name: 'A point' },
      geometry: {
        type: 'Point',
        coordinates: [pts[0].lon, pts[0].lat, pts[0].ele],
      },
    },
    lineFeature(pts.slice(0, 30), { props: { name: 'A line' } }),
    {
      type: 'Feature',
      properties: { name: 'An area' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [21.06, 48.76],
            [21.09, 48.76],
            [21.09, 48.78],
            [21.06, 48.78],
            [21.06, 48.76],
          ],
        ],
      },
    },
  ]),
);
