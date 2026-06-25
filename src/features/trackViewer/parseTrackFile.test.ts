import type { Feature, LineString } from 'geojson';
import { describe, expect, it } from 'vitest';
import { parseTrackFile } from './parseTrackFile.js';

const KML = `<?xml version="1.0"?>
<kml xmlns="http://www.opengis.net/kml/2.2"><Document><Placemark>
  <name>Path</name>
  <LineString><coordinates>17,48,500 17.1,48.1,510</coordinates></LineString>
</Placemark></Document></kml>`;

const TCX = `<?xml version="1.0"?>
<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2" xmlns:ns3="http://www.garmin.com/xmlschemas/ActivityExtension/v2">
 <Activities><Activity Sport="Biking"><Id>2020-01-01T00:00:00Z</Id>
  <Lap StartTime="2020-01-01T00:00:00Z"><Track>
   <Trackpoint><Time>2020-01-01T00:00:00Z</Time><Position><LatitudeDegrees>48</LatitudeDegrees><LongitudeDegrees>17</LongitudeDegrees></Position><AltitudeMeters>500</AltitudeMeters><HeartRateBpm><Value>120</Value></HeartRateBpm><Cadence>80</Cadence><Extensions><ns3:TPX><ns3:Speed>2.5</ns3:Speed><ns3:Watts>200</ns3:Watts></ns3:TPX></Extensions></Trackpoint>
   <Trackpoint><Time>2020-01-01T00:00:05Z</Time><Position><LatitudeDegrees>48.001</LatitudeDegrees><LongitudeDegrees>17.001</LongitudeDegrees></Position><AltitudeMeters>510</AltitudeMeters><HeartRateBpm><Value>130</Value></HeartRateBpm><Cadence>82</Cadence><Extensions><ns3:TPX><ns3:Speed>3.0</ns3:Speed><ns3:Watts>210</ns3:Watts></ns3:TPX></Extensions></Trackpoint>
  </Track></Lap></Activity></Activities>
</TrainingCenterDatabase>`;

const GPX = `<?xml version="1.0"?>
<gpx version="1.1" xmlns="http://www.topografix.com/GPX/1/1" xmlns:fm="https://www.freemap.sk/GPX/1/0" xmlns:gpxpx="http://www.garmin.com/xmlschemas/PowerExtension/v1">
 <trk><name>T</name>
  <extensions><fm:color>#ff0000ff</fm:color></extensions>
  <trkseg>
   <trkpt lat="48" lon="17"><extensions><gpxpx:PowerExtension><gpxpx:PowerInWatts>200</gpxpx:PowerInWatts></gpxpx:PowerExtension></extensions></trkpt>
   <trkpt lat="48.1" lon="17.1"><extensions><gpxpx:PowerExtension><gpxpx:PowerInWatts>210</gpxpx:PowerInWatts></gpxpx:PowerExtension></extensions></trkpt>
  </trkseg>
 </trk>
</gpx>`;

describe('parseTrackFile', () => {
  it('converts GPX, enriching freemap:* and aliasing Garmin power', () => {
    const r = parseTrackFile(GPX, 'track.gpx');

    expect(r).not.toBeNull();

    if (r) {
      const f = r.features[0]!;

      expect(f.properties?.['freemap:color']).toBe('#ff0000ff');

      const cp = f.properties?.['coordinateProperties'] as Record<
        string,
        unknown
      >;

      expect(cp['powers']).toEqual([200, 210]);
      expect(cp['gpxpx:PowerExtensions']).toBeUndefined();
    }
  });

  it('detects GPX by content when the extension is generic', () => {
    expect(parseTrackFile(GPX, 'track.dat')).not.toBeNull();
  });

  it('lets a recognized root element override a wrong extension', () => {
    // GPX content mislabeled as .tcx must still import as GPX, not error.
    expect(parseTrackFile(GPX, 'mislabeled.tcx')).not.toBeNull();
  });

  it('reports an error for non-XML content', () => {
    expect(parseTrackFile('whatever', 'track.dat')).toBeNull();
  });

  it('parses a dropped GeoJSON file and normalizes title -> name', () => {
    const r = parseTrackFile(
      JSON.stringify({
        type: 'Feature',
        properties: { title: 'X' },
        geometry: { type: 'Point', coordinates: [17, 48] },
      }),
      'x.geojson',
    );

    expect(r?.features[0]?.properties?.['name']).toBe('X');
  });

  it('converts KML to GeoJSON', () => {
    const r = parseTrackFile(KML, 'path.kml');

    expect(r).not.toBeNull();

    if (r) {
      expect(r.features[0]?.geometry.type).toBe('LineString');
      expect(r.features[0]?.properties?.['name']).toBe('Path');
    }
  });

  it('detects KML by content when the extension is generic', () => {
    expect(parseTrackFile(KML, 'path.xml')).not.toBeNull();
  });

  it('converts TCX and normalizes channels onto coordinateProperties', () => {
    const r = parseTrackFile(TCX, 'ride.tcx');

    expect(r).not.toBeNull();

    if (r) {
      const f = r.features[0] as Feature<LineString>;

      // Elevation rides in the coordinates; the rest moves under coordProps.
      expect(f.geometry.coordinates).toEqual([
        [17, 48, 500],
        [17.001, 48.001, 510],
      ]);

      const cp = f.properties?.['coordinateProperties'] as Record<
        string,
        unknown
      >;

      expect(cp['heart']).toEqual([120, 130]);
      expect(cp['cads']).toEqual([80, 82]);
      expect(cp['speeds']).toEqual([2.5, 3]);
      expect(cp['powers']).toEqual([200, 210]);

      // Top-level TCX names are removed once relocated.
      expect(f.properties?.['cadences']).toBeUndefined();
      expect(f.properties?.['watts']).toBeUndefined();
    }
  });

  it('reports an error for unparseable XML claiming to be KML', () => {
    expect(parseTrackFile('<kml><broken', 'x.kml')).toBeNull();
  });

  it('reports an error for invalid GeoJSON', () => {
    expect(parseTrackFile('not json', 'x.geojson')).toBeNull();
  });
});
