import type { OsmFeatureId } from '@shared/types/featureId.js';
import { CRS } from 'leaflet';
import {
  toD96tm,
  toHtrs96tm,
  toKrovak,
  toLambert2008,
  toRdNew,
  toSweref99tm,
  toTm35fin,
  toUtm33n,
} from './projections.js';

/** An OSM element's own page on osm.org, or its history. */
export function getOsmElementUrl(
  { elementType, id }: OsmFeatureId,
  history?: boolean,
): string {
  return `https://www.openstreetmap.org/${elementType}/${id}${history ? '/history' : ''}`;
}

/** The element itself open in iD, as opposed to whatever is at a position. */
export function getIdElementUrl({ elementType, id }: OsmFeatureId): string {
  return `https://www.openstreetmap.org/edit?editor=id&${elementType}=${id}`;
}

export function getOsmUrl(
  lat: number,
  lon: number,
  zoom: number,
  includePoint?: boolean,
): string {
  return includePoint
    ? `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=${zoom}`
    : `https://www.openstreetmap.org/#map=${Math.min(zoom, 19)}/${lat.toFixed(
        5,
      )}/${lon.toFixed(5)}`;
}

export function getZbgisUrl(lat: number, lon: number, zoom: number): string {
  return `https://zbgis.skgeodesy.sk/mapka/sk/zakladna-mapa?pos=${lat},${lon},${zoom}`;
}

// TODO to separate file
export function getHikingSkUrl(
  lat: number,
  lon: number,
  zoom: number,
  includePoint?: boolean,
): string {
  const point = CRS.EPSG3857.project({ lat, lng: lon });

  const params: Record<string, string> = {
    zoom: String(zoom > 15 ? 15 : zoom),
    lon: String(point.x),
    lat: String(point.y),
    layers: '00B00FFFTTFTTTTFFFFFFTTT',
  };

  if (includePoint) {
    params['x'] = String(lon);

    params['y'] = String(lat);
  }

  return `https://mapy.hiking.sk/?${new URLSearchParams(params).toString()}`;
}

export function getPeakfinderUrl(lat: number, lon: number): string {
  return `https://www.peakfinder.org/?lat=${lat}&lng=${lon}`;
}

export function getGoogleUrl(
  lat: number,
  lon: number,
  zoom: number,
  includePoint?: boolean,
): string {
  return includePoint
    ? `https://maps.google.com/maps?&z=${zoom}&q=loc:${lat}+${lon}`
    : `https://www.google.com/maps/@${lat},${lon},${zoom}z`;
}

export function getMapyCzUrl(
  lat: number,
  lon: number,
  zoom: number,
  includePoint?: boolean,
): string {
  return `https://mapy.com/zakladni?x=${lon}&y=${lat}&z=${
    zoom > 19 ? 19 : zoom
  }${includePoint ? `&source=coor&id=${lon}%2C${lat}` : ''}`;
}

export function getWazeUrl(lat: number, lon: number, zoom: number): string {
  return `https://www.waze.com/ul?ll=${lat},${lon}&zoom=${zoom}&navigate=yes`;
}

export function getAppleMapsUrl(
  lat: number,
  lon: number,
  zoom: number,
  includePoint?: boolean,
): string {
  return `https://maps.apple.com/?ll=${lat},${lon}&z=${zoom}${
    includePoint ? `&q=${lat},${lon}` : ''
  }`;
}

/** Ground metres a pixel covers, as Web Mercator has it at this latitude and zoom. */
function metersPerPixel(lat: number, zoom: number): number {
  return (156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom;
}

/**
 * The place as a box roughly the size of a map window, projected — the corners
 * of a half-window either way, so a rotated projection still covers the view.
 */
function projectedExtent(
  lat: number,
  lon: number,
  zoom: number,
  project: (lat: number, lon: number) => [number, number],
): [number, number, number, number] {
  const dLat = (metersPerPixel(lat, zoom) * 400) / 111320;

  const dLon = dLat / Math.cos((lat * Math.PI) / 180);

  const corners = [
    project(lat - dLat, lon - dLon),
    project(lat - dLat, lon + dLon),
    project(lat + dLat, lon - dLon),
    project(lat + dLat, lon + dLon),
  ];

  const xs = corners.map(([x]) => x);

  const ys = corners.map(([, y]) => y);

  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

/** ČÚZK's Geoprohlížeč — the Czech cadastre, topo and orthophoto viewer. */
export function getCuzkUrl(lat: number, lon: number, zoom: number): string {
  const extent = projectedExtent(lat, lon, zoom, toKrovak).map((v) =>
    v.toFixed(2),
  );

  return `https://ags.cuzk.gov.cz/geoprohlizec?extent=${extent.join(',')}`;
}

/** The level of a tile grid whose top level covers `top` metres a pixel. */
function tileZoom(lat: number, zoom: number, top: number, max: number): number {
  return Math.max(
    1,
    Math.min(max, Math.round(Math.log2(top / metersPerPixel(lat, zoom)))),
  );
}

/** The level of a tile grid whose resolutions do not simply halve. */
function nearestLevel(
  lat: number,
  zoom: number,
  resolutions: number[],
): number {
  const mpp = metersPerPixel(lat, zoom);

  return resolutions.reduce(
    (best, res, i) =>
      Math.abs(Math.log2(res / mpp)) <
      Math.abs(Math.log2(resolutions[best] / mpp))
        ? i
        : best,
    0,
  );
}

/**
 * DGT's MapasPT. It fits whatever box it is given rather than taking a zoom,
 * and its extent is space-separated.
 */
export function getMapasPtUrl(lat: number, lon: number, zoom: number): string {
  const extent = projectedExtent(lat, lon, zoom, (la, lo) => [lo, la])
    .map((v) => v.toFixed(6))
    .join(' ');

  return `https://mapaspt.dgterritorio.gov.pt/mapa/mapaspt?crs=4326&extent=${encodeURIComponent(
    extent,
  )}`;
}

/**
 * Croatia's ARKOD — farmland parcels over the national orthophoto, the only
 * official Croatian viewer that takes a position at all. It snaps `map_sc` to
 * the nearest rung of its own scale ladder.
 */
export function getArkodUrl(lat: number, lon: number, zoom: number): string {
  const [x, y] = toHtrs96tm(lat, lon);

  const scale = Math.round(metersPerPixel(lat, zoom) / 0.00028);

  return `https://preglednik.arkod.hr/ARKOD-Web/#map_x=${x.toFixed(
    2,
  )}&map_y=${y.toFixed(2)}&map_sc=${scale}`;
}

/** IGN's Iberpix. Naming the CRS lets it take plain lon/lat and our own zoom. */
export function getIberpixUrl(lat: number, lon: number, zoom: number): string {
  return `https://www.ign.es/iberpix/visor?center=${lon},${lat}&zoom=${Math.min(
    zoom,
    20,
  )}&srs=EPSG:4326`;
}

/** The Dutch PDOK viewer, whose hash carries RD New metres. */
export function getPdokUrl(lat: number, lon: number, zoom: number): string {
  const [x, y] = toRdNew(lat, lon);

  return `https://app.pdok.nl/viewer/#x=${x.toFixed(2)}&y=${y.toFixed(
    2,
  )}&z=${tileZoom(lat, zoom, 3440.64, 25)}`;
}

/** NGI's resolutions in Lambert 2008 — 1:4M down to 1:625, and not a plain halving. */
const NGI_RESOLUTIONS = [
  1058.3354500042335, 529.1677250021168, 211.667090000847, 132.2919312505292,
  66.1459656252646, 26.458386250105836, 13.229193125052918, 6.614596562526459,
  2.6458386250105836, 1.3229193125052918, 0.661459656252646, 0.330729828126323,
  0.1653649140631615,
];

/** The Belgian NGI/IGN Topomapviewer, in Lambert 2008. */
export function getTopomapviewerUrl(
  lat: number,
  lon: number,
  zoom: number,
): string {
  const [x, y] = toLambert2008(lat, lon);

  return `https://topomapviewer.ngi.be/?l=en&x=${x.toFixed(2)}&y=${y.toFixed(
    2,
  )}&zoom=${nearestLevel(lat, zoom, NGI_RESOLUTIONS)}`;
}

/** Kartverket's Norgeskart. Its `lat`/`lon` are northing/easting in EPSG:25833. */
export function getNorgeskartUrl(
  lat: number,
  lon: number,
  zoom: number,
): string {
  const [e, n] = toUtm33n(lat, lon);

  return `https://norgeskart.no/#!?project=norgeskart&zoom=${tileZoom(
    lat,
    zoom,
    21664,
    17,
  )}&lat=${n.toFixed(2)}&lon=${e.toFixed(2)}`;
}

/** Lantmäteriet's Min karta, which takes whole SWEREF 99 TM metres. */
export function getMinKartaUrl(lat: number, lon: number, zoom: number): string {
  const [e, n] = toSweref99tm(lat, lon);

  return `https://minkarta.lantmateriet.se/?e=${Math.round(e)}&n=${Math.round(
    n,
  )}&z=${tileZoom(lat, zoom, 4096, 14)}`;
}

/** The Finnish national land survey's Karttapaikka, in ETRS-TM35FIN. */
export function getKarttapaikkaUrl(
  lat: number,
  lon: number,
  zoom: number,
): string {
  const [e, n] = toTm35fin(lat, lon);

  return `https://asiointi.maanmittauslaitos.fi/karttapaikka/?lang=en&e=${Math.round(
    e,
  )}&n=${Math.round(n)}&zoom=${tileZoom(lat, zoom, 8192, 15)}`;
}

/**
 * The Geoportale Nazionale viewer. Its `box` is UTM 33N, and it falls back to
 * the whole country for a box reaching outside Italy.
 */
export function getPcnUrl(lat: number, lon: number, zoom: number): string {
  const box = projectedExtent(lat, lon, zoom, toUtm33n).map((v) =>
    v.toFixed(2),
  );

  return `http://www.pcn.minambiente.it/viewer/?box=${box.join(',')}`;
}

/** ARSO's Atlas okolja — the Slovenian environmental and orthophoto viewer. */
export function getAtlasOkoljaUrl(
  lat: number,
  lon: number,
  zoom: number,
): string {
  const [x, y] = toD96tm(lat, lon);

  const extent = `${x.toFixed(2)},${y.toFixed(2)},${metersPerPixel(
    lat,
    zoom,
  ).toFixed(5)}`;

  return `https://gis.arso.gov.si/atlasokolja/profile.aspx?id=Atlas_Okolja_AXL%40Arso&culture=en-US&initialExtent=${encodeURIComponent(
    extent,
  )}`;
}

/** The Austrian administrations' basemap viewer — topo and 15 cm orthophotos. */
export function getBasemapAtUrl(
  lat: number,
  lon: number,
  zoom: number,
): string {
  const { x, y } = CRS.EPSG3857.project({ lat, lng: lon });

  // The viewer keeps its whole state as JSON in the hash; `layers` is its
  // bitmask of what is switched on.
  const state = JSON.stringify({
    center: [x, y],
    zoom,
    rotation: 0,
    layers: '0010000000',
  });

  return `https://stp.wien.gv.at/basemap/#${encodeURIComponent(state)}`;
}

/** GUGiK's national portal — official Polish topo, cadastre and orthophotos. */
export function getGeoportalPlUrl(
  lat: number,
  lon: number,
  zoom: number,
): string {
  // The viewer takes a scale denominator, not a zoom; 0.28 mm is the pixel the
  // OGC scale definition assumes.
  const scale = Math.round(metersPerPixel(lat, zoom) / 0.00028);

  return `https://mapy.geoportal.gov.pl/imapnext/imap/index.html?moduleId=modulPP&mapview=${lat},${lon},${scale}s`;
}

/** IGN's national portal — official topo, cadastre and orthophotos of France. */
export function getGeoportailUrl(
  lat: number,
  lon: number,
  zoom: number,
): string {
  // Without `permalink=yes` and a layer to show, the viewer ignores `c`/`z` and
  // opens the whole country.
  return `https://www.geoportail.gouv.fr/carte?c=${lon},${lat}&z=${zoom}&l0=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2::GEOPORTAIL:OGC:WMTS(1)&permalink=yes`;
}

export function getWindyUrl(lat: number, lon: number, zoom: number): string {
  return `https://www.windy.com/?${lat},${lon},${zoom}`;
}

/** OSM data-quality issues around the place. */
export function getOsmoseUrl(lat: number, lon: number, zoom: number): string {
  return `https://osmose.openstreetmap.fr/en/map/#zoom=${zoom}&lat=${lat}&lon=${lon}`;
}

export function getF4mapUrl(lat: number, lon: number, zoom: number): string {
  return `https://demo.f4map.com/#lat=${lat}&lon=${lon}&zoom=${Math.max(
    16,
    zoom,
  )}`;
}

export function getGeocachingUrl(
  lat: number,
  lon: number,
  zoom: number,
): string {
  return `https://www.geocaching.com/map/#?ll=${lat},${lon}&z=${Math.max(
    18,
    zoom,
  )}`;
}

export function getPanoramaxUrl(
  lat: number,
  lon: number,
  zoom: number,
): string {
  return `https://api.panoramax.xyz/?focus=map&map=${zoom}/${lat}/${lon}`;
}

/** Google's street-level imagery, which its map URLs do not open by themselves. */
export function getStreetViewUrl(lat: number, lon: number): string {
  return `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lon}`;
}

export function getMapillaryUrl(
  lat: number,
  lon: number,
  zoom: number,
): string {
  return `https://www.mapillary.com/app/?lat=${lat}&lng=${lon}&z=${zoom}`;
}

export function getIdUrl(lat: number, lon: number, zoom: number): string {
  return `https://www.openstreetmap.org/edit?editor=id#map=${zoom}/${lat.toFixed(
    5,
  )}/${lon.toFixed(5)}`;
}

export function getOmaUrl(lat: number, lon: number, zoom: number): string {
  return `http://redirect.oma.sk/?lat=${lat}&lon=${lon}&zoom=${zoom}`;
}

export function getStravaUrl(lat: number, lon: number, zoom: number): string {
  const params = new URLSearchParams({
    sport: 'All',
    style: 'standard',
    terrain: 'false',
    labels: 'true',
    poi: 'true',
    cPhotos: 'true',
    '3d': 'false',
    gColor: 'mobileblue',
    gOpacity: '100',
  });

  return `https://www.strava.com/maps/global-heatmap?${params}#${zoom}/${lat.toFixed(
    4,
  )}/${lon.toFixed(4)}`;
}
