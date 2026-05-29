import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { mapPromise } from '@features/map/hooks/leafletElementHolder.js';
import { trackViewerSetData } from '@features/trackViewer/model/actions.js';
import * as toGeoJSON from '@tmcw/togeojson';
import bbox from '@turf/bbox';

const FM_NS = 'https://www.freemap.sk/GPX/1/0';

const OSMAND_NS = 'https://osmand.net';

export const trackViewerSetTrackDataProcessor: Processor<
  typeof trackViewerSetData
> = {
  actionCreator: trackViewerSetData,
  transform: ({ action }) => {
    // GeoJSON may be supplied directly (e.g. a dropped .geojson file); only
    // parse when GPX was given. Either way we focus on the resulting geometry.
    let trackGeojson = action.payload.trackGeojson;

    if (action.payload.trackGpx) {
      // TODO add error handling for failed string-to-gpx and gpx-to-geojson parsing
      const gpxAsXml = new DOMParser().parseFromString(
        action.payload.trackGpx,
        'text/xml',
      );

      trackGeojson = toGeoJSON.gpx(gpxAsXml);

      // togeojson already pulls `<sym>` and any registered namespaces into
      // properties, but the property key depends on the source's prefix
      // (`fm:markerType` -> `fm_markerType`). Walk the wpt/trk elements
      // ourselves and inject canonical `freemap:*` / `osmand:*` keys so
      // downstream readers don't have to guess the prefix.
      enrichWaypointsWithExtensions(gpxAsXml, trackGeojson);

      enrichTracksWithExtensions(gpxAsXml, trackGeojson);
    }

    if (action.payload.focus && trackGeojson) {
      let bounds;

      try {
        bounds = bbox(trackGeojson);
      } catch {}

      if (bounds) {
        mapPromise.then((map) =>
          map.fitBounds([
            [bounds[1], bounds[0]],
            [bounds[3], bounds[2]],
          ]),
        );
      }
    }

    return action.payload.trackGpx
      ? trackViewerSetData({
          ...action.payload,
          trackGeojson,
        })
      : action;
  },
};

function enrichWaypointsWithExtensions(
  gpxDoc: Document,
  geojson: ReturnType<typeof toGeoJSON.gpx>,
): void {
  const wpts = Array.from(gpxDoc.getElementsByTagName('wpt'));

  if (wpts.length === 0) {
    return;
  }

  // togeojson yields Point features in document order, interleaved with
  // tracks and routes. We pair each wpt to the next Point feature.
  let wptIndex = 0;

  for (const feature of geojson.features) {
    if (feature.geometry?.type !== 'Point' || wptIndex >= wpts.length) {
      continue;
    }

    const wpt = wpts[wptIndex++];

    const props = (feature.properties ??= {});

    for (const tag of ['markerType', 'icon', 'color'] as const) {
      const value = wpt
        .getElementsByTagNameNS(FM_NS, tag)[0]
        ?.textContent?.trim();

      if (value) {
        props[`freemap:${tag}`] = value;
      }
    }

    for (const tag of ['icon', 'background', 'color'] as const) {
      const value = wpt
        .getElementsByTagNameNS(OSMAND_NS, tag)[0]
        ?.textContent?.trim();

      if (value) {
        props[`osmand:${tag}`] = value;
      }
    }
  }
}

// GPX has no polygon type; we treat `<trk>` as either a LineString or a
// closed polygon depending on extension hints. Inject our own canonical
// properties so the convert-to-drawing processor can switch type and
// restore styling without re-walking the XML.
function enrichTracksWithExtensions(
  gpxDoc: Document,
  geojson: ReturnType<typeof toGeoJSON.gpx>,
): void {
  const trks = Array.from(gpxDoc.getElementsByTagName('trk'));

  if (trks.length === 0) {
    return;
  }

  let trkIndex = 0;

  for (const feature of geojson.features) {
    const t = feature.geometry?.type;

    if (
      (t !== 'LineString' && t !== 'MultiLineString') ||
      trkIndex >= trks.length
    ) {
      continue;
    }

    const trk = trks[trkIndex++];

    const props = (feature.properties ??= {});

    for (const tag of [
      'type',
      'color',
      'fillColor',
      'lineCap',
      'lineJoin',
      'dashArray',
      'width',
    ] as const) {
      const value = trk
        .getElementsByTagNameNS(FM_NS, tag)[0]
        ?.textContent?.trim();

      if (value) {
        props[`freemap:${tag}`] = value;
      }
    }

    for (const tag of ['color', 'fill_color', 'width'] as const) {
      const value = trk
        .getElementsByTagNameNS(OSMAND_NS, tag)[0]
        ?.textContent?.trim();

      if (value) {
        props[`osmand:${tag}`] = value;
      }
    }

    // Presence of gpx_style:fill is the de-facto polygon signal used by
    // other consumers (Mapbox tooling, GAIA). Flag it so the importer can
    // fall back when freemap:type is absent.
    const gpxStyleFill = trk.getElementsByTagNameNS(
      'http://www.topografix.com/GPX/gpx_style/0/2',
      'fill',
    )[0];

    if (gpxStyleFill) {
      props['gpx_style:hasFill'] = 'true';
    }
  }
}
