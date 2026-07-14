import { escapeHtml, escapeXml } from '@shared/stringUtils.js';
import type { Feature, FeatureCollection, Geometry, Position } from 'geojson';

const KML_NS = 'http://www.opengis.net/kml/2.2';

export interface KmlResult {
  kml: string;
  // Marker images keyed by their archive path (e.g. `files/marker-0.png`).
  // Non-empty only when at least one point baked a raster icon, in which case
  // the caller wraps everything into a KMZ; otherwise a plain `.kml` suffices.
  files: Map<string, Uint8Array>;
}

/**
 * Serialize an export {@link FeatureCollection} (simplestyle + `marker-png`
 * properties, as produced by `buildExportFeatureCollection`) to KML.
 *
 * KML viewers (Google Earth, Locus, OsmAnd, …) render only raster `<Icon>`
 * hrefs — not SVG — so point markers use the already-rasterized `marker-png`
 * data URL, extracted into archive files referenced as `files/marker-N.png`.
 * Identical PNGs are de-duplicated to a single file.
 */
export function geojsonToKml(
  fc: FeatureCollection,
  { documentName }: { documentName?: string } = {},
): KmlResult {
  const files = new Map<string, Uint8Array>();

  // data URL → archive path, so identical markers share one packaged image.
  const pngHrefs = new Map<string, string>();

  const hrefForPng = (dataUrl: string): string | undefined => {
    const existing = pngHrefs.get(dataUrl);

    if (existing) {
      return existing;
    }

    const bytes = dataUrlToBytes(dataUrl);

    if (!bytes) {
      return undefined;
    }

    const href = `files/marker-${pngHrefs.size}.png`;

    pngHrefs.set(dataUrl, href);

    files.set(href, bytes);

    return href;
  };

  // Shared <Style> definitions, de-duplicated by content, referenced from
  // placemarks via <styleUrl>; a long run of identically-styled features then
  // costs one short reference each instead of a repeated inline style block.
  const styles = new Map<string, string>();

  const styleIdFor = (inner: string | null): string | null => {
    if (!inner) {
      return null;
    }

    let id = styles.get(inner);

    if (!id) {
      id = `s${styles.size}`;

      styles.set(inner, id);
    }

    return id;
  };

  const body = fc.features
    .map((feature) => placemark(feature, hrefForPng, styleIdFor))
    .filter((s): s is string => s !== null)
    .join('\n');

  const styleDefs = [...styles]
    .map(([inner, id]) => `<Style id="${id}">${inner}</Style>`)
    .join('\n');

  const kml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<kml xmlns="${KML_NS}">\n` +
    `<Document>\n` +
    (documentName ? `<name>${escapeXml(documentName)}</name>\n` : '') +
    `<description>${escapeXml('Exported from https://www.freemap.sk/')}</description>\n` +
    (styleDefs ? `${styleDefs}\n` : '') +
    `${body}\n` +
    `</Document>\n` +
    `</kml>\n`;

  return { kml, files };
}

function placemark(
  feature: Feature,
  hrefForPng: (dataUrl: string) => string | undefined,
  styleIdFor: (inner: string | null) => string | null,
): string | null {
  const geom = feature.geometry;

  if (!geom) {
    return null;
  }

  const geometryXml = geometry(geom);

  if (!geometryXml) {
    return null;
  }

  const props = (feature.properties ?? {}) as Record<string, unknown>;

  const parts: string[] = ['<Placemark>'];

  const title = str(props['title']) ?? str(props['name']);

  if (title) {
    parts.push(`<name>${escapeXml(title)}</name>`);
  }

  const desc = description(props);

  if (desc) {
    parts.push(`<description><![CDATA[${desc}]]></description>`);
  }

  const styleId = styleIdFor(styleFor(geom, props, hrefForPng));

  if (styleId) {
    parts.push(`<styleUrl>#${styleId}</styleUrl>`);
  }

  parts.push(geometryXml, '</Placemark>');

  return parts.join('');
}

// The inner content of a shared <Style> (without the wrapper), or null when the
// feature has no styling to emit.
function styleFor(
  geom: Geometry,
  props: Record<string, unknown>,
  hrefForPng: (dataUrl: string) => string | undefined,
): string | null {
  if (geom.type === 'Point' || geom.type === 'MultiPoint') {
    const png = str(props['marker-png']);

    const href = png ? hrefForPng(png) : undefined;

    if (href) {
      // The marker is baked center-anchored, so place it centered on the point.
      return (
        `<IconStyle><Icon><href>${escapeXml(href)}</href></Icon>` +
        `<hotSpot x="0.5" y="0.5" xunits="fraction" yunits="fraction"/></IconStyle>`
      );
    }

    // No raster icon (e.g. canvas unavailable): tint the default pin instead.
    const color = kmlColor(
      str(props['marker-color']),
      num(props['marker-color-opacity']) ?? 1,
    );

    return color ? `<IconStyle><color>${color}</color></IconStyle>` : null;
  }

  const lineColor = kmlColor(
    str(props['stroke']),
    num(props['stroke-opacity']) ?? 1,
  );

  const width = num(props['stroke-width']);

  const lineStyle =
    lineColor || width != null
      ? `<LineStyle>${lineColor ? `<color>${lineColor}</color>` : ''}${
          width != null ? `<width>${width}</width>` : ''
        }</LineStyle>`
      : '';

  const isArea =
    geom.type === 'Polygon' ||
    geom.type === 'MultiPolygon' ||
    geom.type === 'GeometryCollection';

  let polyStyle = '';

  if (isArea) {
    const fill = kmlColor(str(props['fill']), num(props['fill-opacity']) ?? 1);

    polyStyle = fill
      ? `<PolyStyle><color>${fill}</color><fill>1</fill><outline>1</outline></PolyStyle>`
      : `<PolyStyle><fill>0</fill><outline>1</outline></PolyStyle>`;
  }

  return lineStyle || polyStyle ? lineStyle + polyStyle : null;
}

function geometry(geom: Geometry): string | null {
  switch (geom.type) {
    case 'Point':
      return `<Point><coordinates>${coord(geom.coordinates)}</coordinates></Point>`;

    case 'MultiPoint':
      return multi(
        geom.coordinates.map(
          (c) => `<Point><coordinates>${coord(c)}</coordinates></Point>`,
        ),
      );

    case 'LineString':
      return lineString(geom.coordinates);

    case 'MultiLineString':
      return multi(geom.coordinates.map(lineString));

    case 'Polygon':
      return polygon(geom.coordinates);

    case 'MultiPolygon':
      return multi(geom.coordinates.map(polygon));

    case 'GeometryCollection':
      return multi(
        geom.geometries.map(geometry).filter((s): s is string => s !== null),
      );

    default:
      return null;
  }
}

function lineString(positions: Position[]): string {
  return `<LineString><tessellate>1</tessellate><coordinates>${coords(
    positions,
  )}</coordinates></LineString>`;
}

function polygon(rings: Position[][]): string {
  const ring = (positions: Position[]) =>
    `<LinearRing><coordinates>${coords(positions)}</coordinates></LinearRing>`;

  const [outer, ...holes] = rings;

  return (
    `<Polygon><tessellate>1</tessellate>` +
    (outer ? `<outerBoundaryIs>${ring(outer)}</outerBoundaryIs>` : '') +
    holes.map((h) => `<innerBoundaryIs>${ring(h)}</innerBoundaryIs>`).join('') +
    `</Polygon>`
  );
}

function multi(geometries: string[]): string {
  return `<MultiGeometry>${geometries.join('')}</MultiGeometry>`;
}

function coords(positions: Position[]): string {
  return positions.map(coord).join(' ');
}

function coord(pos: Position): string {
  // KML accepts lon,lat or lon,lat,alt.
  return pos.length >= 3
    ? `${pos[0]},${pos[1]},${pos[2]}`
    : `${pos[0]},${pos[1]}`;
}

// HTML balloon for picture/object features carrying gallery metadata. Wikimedia
// photos have no embeddable image, so render their attribution (author/license)
// and the Commons/freemap links too — otherwise they'd be bare, unattributed
// pins.
function description(props: Record<string, unknown>): string | null {
  const imageUrl = str(props['imageUrl']);
  const text = str(props['description']);
  const author = str(props['author']);
  const license = str(props['license']);
  const webUrl = str(props['webUrl']);
  const commonsUrl = str(props['commonsUrl']);

  const meta: string[] = [];

  if (author) {
    meta.push(`<b>Author</b>: ${escapeHtml(author)}`);
  }

  if (license) {
    meta.push(`<b>License</b>: ${escapeHtml(license)}`);
  }

  const links: string[] = [];

  if (webUrl) {
    links.push(`<a href="${escapeHtml(webUrl)}">freemap.sk</a>`);
  }

  if (commonsUrl) {
    links.push(`<a href="${escapeHtml(commonsUrl)}">Wikimedia Commons</a>`);
  }

  const parts = [
    imageUrl ? `<img src="${escapeHtml(imageUrl)}" width="100%">` : '',
    text ? `<p>${escapeHtml(text)}</p>` : '',
    meta.length ? `<p>${meta.join('<br>')}</p>` : '',
    links.length ? `<p>${links.join(' ｜ ')}</p>` : '',
  ].filter(Boolean);

  return parts.length > 0 ? parts.join('') : null;
}

// `#rrggbb` (the only form the builder emits — colors are split into hex +
// opacity upstream) → KML's `aabbggrr` (alpha, blue, green, red).
function kmlColor(
  hex: string | undefined,
  opacity: number,
): string | undefined {
  if (!hex) {
    return undefined;
  }

  const h = hex.slice(1);

  return toByte(opacity) + h.slice(4, 6) + h.slice(2, 4) + h.slice(0, 2);
}

function toByte(v: number): string {
  return Math.round(Math.max(0, Math.min(1, v)) * 255)
    .toString(16)
    .padStart(2, '0');
}

function dataUrlToBytes(dataUrl: string): Uint8Array | null {
  const i = dataUrl.indexOf('base64,');

  if (i < 0) {
    return null;
  }

  const bin = atob(dataUrl.slice(i + 7));

  const bytes = new Uint8Array(bin.length);

  for (let j = 0; j < bin.length; j++) {
    bytes[j] = bin.charCodeAt(j);
  }

  return bytes;
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v ? v : undefined;
}

function num(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}
