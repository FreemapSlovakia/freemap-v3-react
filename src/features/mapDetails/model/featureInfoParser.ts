import { MERCATOR_EPSG_CODES, parseWmsXml } from '@shared/wms.js';
import { bbox } from '@turf/bbox';
import type {
  Feature,
  FeatureCollection,
  Geometry,
  LineString,
  Point,
  Polygon,
  Position,
} from 'geojson';
import type { LatLngBounds } from 'leaflet';
import { GeoJSONGeometrySchema } from 'zod-geojson';

/**
 * Decodes an answer by the encoding its XML prolog declares, else the
 * Content-Type charset, else UTF-8. MapServer writes ISO-8859-1 by default.
 */
export function decodeFeatureInfo(
  bytes: ArrayBuffer,
  contentType: string | null,
): string {
  // The prolog is ASCII in any encoding a server would use.
  const head = new TextDecoder('latin1').decode(bytes.slice(0, 200));

  const label =
    (head.startsWith('\xEF\xBB\xBF') ? 'utf-8' : undefined) ??
    /^\s*<\?xml[^>]*\bencoding\s*=\s*["']([\w.:-]+)["']/.exec(head)?.[1] ??
    /charset\s*=\s*"?([\w.:-]+)/i.exec(contentType ?? '')?.[1] ??
    'utf-8';

  try {
    return new TextDecoder(label).decode(bytes);
  } catch {
    // An unknown label.
    return new TextDecoder().decode(bytes);
  }
}

/**
 * A GetFeatureInfo answer, JSON or GML, as GeoJSON in EPSG:3857. Throws on an
 * exception or an unreadable body, so the caller can try another format.
 */
export function parseFeatureInfo(body: string): FeatureCollection {
  const text = body.trimStart();

  if (text.startsWith('{')) {
    // Some ArcGIS servers (kataster.skgeodesy.sk) write decimal commas: a 2D
    // position reads as four integers, or isn't JSON at all (`,05`).
    const repaired = () =>
      JSON.parse(text.replace(/\[(\d+),(\d+),(\d+),(\d+)\]/g, '[$1.$2,$3.$4]'));

    let json: unknown;

    try {
      json = JSON.parse(text);
    } catch {
      json = repaired();
    }

    if (hasCommaPositions(json)) {
      json = repaired();
    }

    const {
      type,
      features: raw,
      crs,
    } = (json ?? {}) as {
      type?: unknown;
      features?: unknown;
      crs?: { properties?: { name?: unknown } };
    };

    // Esri JSON or an error object would otherwise pass as an empty answer;
    // an empty spot may come as `features: null` or without `type`.
    if (
      raw == null
        ? type !== 'FeatureCollection'
        : !Array.isArray(raw) ||
          !raw.every((f) => (f as Feature | null)?.type === 'Feature')
    ) {
      throw new Error('Feature info JSON is not a FeatureCollection.');
    }

    const crsName = crs?.properties?.name;

    const mercator = typeof crsName !== 'string' || isMercatorName(crsName);

    // Every `bbox` and the `crs` are dropped: toWgs84 projects only coordinates.
    return {
      type: 'FeatureCollection',
      features: ((raw ?? []) as Feature[]).map(
        ({ bbox: _feature, geometry, ...feature }) => {
          // The schema rejects a bbox that isn't the exact extent.
          const { bbox: _geometry, ...bare } = geometry ?? {};

          const parsed = GeoJSONGeometrySchema.safeParse(bare);

          // An invalid geometry costs only its own outline, not the answer.
          return {
            ...feature,
            geometry: mercator && parsed.success ? parsed.data : null,
          };
        },
      ),
    } as FeatureCollection;
  }

  const root = parseWmsXml(text).documentElement;

  const features: Feature[] = [];

  // Elements are matched by local name: proxies rewrite namespace URIs, and a
  // GML 2, 3 and 3.2 answer differ in theirs.
  if (root.localName === 'msGMLOutput') {
    for (const layer of root.children) {
      const layerName =
        childrenNamed(layer, 'name')[0]?.textContent?.trim() ||
        layer.localName.replace(/_layer$/, '');

      for (const el of layer.children) {
        if (!isGml(el)) {
          features.push(readFeature(el, layerName));
        }
      }
    }
  } else if (root.localName === 'FeatureCollection') {
    readCollection(root, features);
  } else {
    // ArcGIS's FeatureInfoResponse and the like; another format may do better.
    throw new Error(`Unsupported feature info document ${root.localName}.`);
  }

  return { type: 'FeatureCollection', features };
}

function readCollection(collection: Element, features: Feature[]) {
  for (const member of collection.children) {
    if (!/^(featureMembers?|member)$/.test(member.localName)) {
      continue;
    }

    for (const el of member.children) {
      // WFS 2 nests one collection per queried layer.
      if (el.localName === 'FeatureCollection') {
        readCollection(el, features);
      } else {
        features.push(readFeature(el, el.localName));
      }
    }
  }
}

const GEOMETRY_NAMES = new Set([
  'Point',
  'LineString',
  'Polygon',
  'MultiPoint',
  'MultiLineString',
  'MultiCurve',
  'MultiPolygon',
  'MultiSurface',
  // Read as unsupported, but found so a curve isn't mistaken for no geometry.
  'Curve',
  'Surface',
  'MultiGeometry',
  'CompositeCurve',
  'CompositeSurface',
]);

function hasCommaPositions(json: unknown): boolean {
  const isBad = (c: unknown): boolean =>
    Array.isArray(c) &&
    (typeof c[0] === 'number'
      ? c.length === 4 && c.every(Number.isInteger)
      : c.some(isBad));

  const { features } = (json ?? {}) as { features?: unknown };

  return (
    Array.isArray(features) &&
    features.some((f) => isBad(f?.geometry?.coordinates))
  );
}

function isGml(el: Element) {
  return /opengis\.net\/gml(\/|$)/.test(el.namespaceURI ?? '');
}

function childrenNamed(el: Element, localName: string) {
  return [...el.children].filter((child) => child.localName === localName);
}

function readFeature(el: Element, layerName: string): Feature {
  const values = new Map<string, Set<string>>();

  collectLeaves(el, values);

  const id =
    el.getAttribute('fid') ??
    [...el.attributes].find((a) => a.localName === 'id')?.value;

  return {
    type: 'Feature',
    ...(id ? { id } : {}),
    layerName,
    geometry: findGeometry(el) ?? null,
    properties: Object.fromEntries(
      [...values].map(([key, set]) => [key, [...set].join('; ')]),
    ),
  } as Feature;
}

const GML_PROPERTIES = new Set(['name', 'description', 'identifier']);

/** Every leaf is a property, except GML's own (geometry, `boundedBy`). */
function collectLeaves(el: Element, values: Map<string, Set<string>>) {
  for (const child of el.children) {
    if (isGml(child) && !GML_PROPERTIES.has(child.localName)) {
      continue;
    }

    if (child.children.length) {
      collectLeaves(child, values);

      continue;
    }

    // A code-list reference (ALKIS/NAS) names its value in `xlink:title`.
    const value =
      child.textContent?.trim() ||
      [...child.attributes].find(
        (a) => a.localName === 'title' && /xlink/.test(a.namespaceURI ?? ''),
      )?.value;

    if (value) {
      values.set(
        child.localName,
        (values.get(child.localName) ?? new Set()).add(value),
      );
    }
  }
}

/** The first geometry that reads; an unreadable one isn't descended into. */
function findGeometry(el: Element): Geometry | undefined {
  for (const child of el.children) {
    if (isGml(child) && child.localName === 'boundedBy') {
      continue;
    }

    const found =
      isGml(child) && GEOMETRY_NAMES.has(child.localName)
        ? readGeometry(child)
        : findGeometry(child);

    if (found) {
      return found;
    }
  }

  return undefined;
}

/**
 * Plain linear geometries only; anything with curve segments is dropped, as is
 * a geometry in a CRS other than the EPSG:3857 requested.
 */
function readGeometry(el: Element): Geometry | undefined {
  return readSimple(el) ?? readMulti(el);
}

/** Inherited, so a multi-geometry's parts each answer for the whole. */
function isMercator(el: Element) {
  const srsName = closestAttribute(el, 'srsName');

  return !srsName || isMercatorName(srsName);
}

/** `EPSG:3857`, `urn:ogc:def:crs:EPSG::3857`, `…/epsg.xml#3857` and aliases. */
function isMercatorName(name: string) {
  return MERCATOR_EPSG_CODES.includes(/(\d+)\s*$/.exec(name)?.[1] ?? '');
}

function readSimple(el: Element): Point | LineString | Polygon | undefined {
  if (!isMercator(el)) {
    return undefined;
  }

  switch (el.localName) {
    case 'Point': {
      const [coordinates] = positions(el);

      return coordinates && { type: 'Point', coordinates };
    }

    case 'LineString': {
      const coordinates = positions(el);

      return coordinates.length >= 2
        ? { type: 'LineString', coordinates }
        : undefined;
    }

    case 'Polygon': {
      let exterior: Position[] | undefined;

      const holes: Position[][] = [];

      for (const boundary of el.children) {
        const ring = boundary.children[0];

        // Not a `Ring` of curve segments; a bad hole is dropped on its own.
        const coordinates =
          ring?.localName === 'LinearRing' ? positions(ring) : [];

        if (/^(exterior|outerBoundaryIs)$/.test(boundary.localName)) {
          if (coordinates.length < 4) {
            return undefined;
          }

          exterior = coordinates;
        } else if (
          /^(interior|innerBoundaryIs)$/.test(boundary.localName) &&
          coordinates.length >= 4
        ) {
          holes.push(coordinates);
        }
      }

      return exterior
        ? { type: 'Polygon', coordinates: [exterior, ...holes] }
        : undefined;
    }

    default:
      return undefined;
  }
}

function readMulti(el: Element): Geometry | undefined {
  const type = (
    {
      MultiPoint: 'Point',
      MultiLineString: 'LineString',
      MultiCurve: 'LineString',
      MultiPolygon: 'Polygon',
      MultiSurface: 'Polygon',
    } as const
  )[el.localName];

  if (!type) {
    return undefined;
  }

  const parts: (Point | LineString | Polygon)[] = [];

  // `*Member` holds one geometry, `*Members` several; `gml:name` and the like
  // are no part.
  for (const member of el.children) {
    if (!/Members?$/.test(member.localName)) {
      continue;
    }

    for (const part of member.children) {
      const geometry = readSimple(part);

      if (geometry?.type !== type) {
        return undefined;
      }

      parts.push(geometry);
    }
  }

  if (!parts.length) {
    return undefined;
  }

  return {
    type: `Multi${type}`,
    coordinates: parts.map((part) => part.coordinates),
  } as Geometry;
}

/** Positions of a Point, LineString or LinearRing, in GML 2 or 3 notation. */
function positions(el: Element): Position[] {
  const [posList] = childrenNamed(el, 'posList');

  if (posList) {
    // `dimension` is the GML 3.1.1 spelling.
    const dim = Number(
      posList.getAttribute('dimension') ??
        closestAttribute(posList, 'srsDimension') ??
        2,
    );

    // A bad value would never advance the loop below.
    if (!Number.isInteger(dim) || dim < 2) {
      return [];
    }

    const numbers = numbersOf(posList.textContent);

    const result: Position[] = [];

    for (let i = 0; i + dim <= numbers.length; i += dim) {
      result.push(numbers.slice(i, i + 2));
    }

    return result.filter(isPosition);
  }

  const pos = childrenNamed(el, 'pos');

  if (pos.length) {
    return pos
      .map((p) => numbersOf(p.textContent).slice(0, 2))
      .filter(isPosition);
  }

  const [coordinates] = childrenNamed(el, 'coordinates');

  if (coordinates) {
    const cs = coordinates.getAttribute('cs') || ',';
    const ts = coordinates.getAttribute('ts') || ' ';
    const decimal = coordinates.getAttribute('decimal') || '.';

    return (coordinates.textContent ?? '')
      .trim()
      .split(ts === ' ' ? /\s+/ : ts)
      .map((tuple) =>
        tuple
          .split(cs)
          .slice(0, 2)
          .map((n) => toNumber(n.replaceAll(decimal, '.'))),
      )
      .filter(isPosition);
  }

  // GML 2's `<coord><X/><Y/></coord>`.
  return childrenNamed(el, 'coord')
    .map((coord) =>
      ['X', 'Y'].map((axis) =>
        toNumber(childrenNamed(coord, axis)[0]?.textContent ?? ''),
      ),
    )
    .filter(isPosition);
}

function numbersOf(text: string | null) {
  return (text ?? '').trim().split(/\s+/).map(toNumber);
}

/** Unlike `Number`, which reads an empty string as 0. */
function toNumber(text: string) {
  return text.trim() ? Number(text) : Number.NaN;
}

function isPosition(p: number[]) {
  return p.length === 2 && p.every(Number.isFinite);
}

function closestAttribute(el: Element, name: string): string | undefined {
  for (let e: Element | null = el; e; e = e.parentElement) {
    const value = e.getAttribute(name);

    if (value) {
      return value;
    }
  }

  return undefined;
}

/**
 * Drops a geometry nowhere near the queried view, as one in an undeclared CRS
 * other than the assumed EPSG:3857 is. The click point stands in for it.
 */
export function dropOffView(
  info: FeatureCollection,
  view: LatLngBounds,
): FeatureCollection<Geometry | null> {
  const cx = view.getCenter().lng;

  // A margin of one view on each side.
  const near = view.pad(1);

  const isNear = (geometry: Geometry) => {
    const [west, south, east, north] = bbox(geometry);

    // Leaflet's bounds aren't wrapped to ±180°.
    const shift = Math.round((cx - (west + east) / 2) / 360) * 360;

    return (
      west + shift <= near.getEast() &&
      east + shift >= near.getWest() &&
      south <= near.getNorth() &&
      north >= near.getSouth()
    );
  };

  return {
    ...info,
    features: info.features.map((feature) =>
      !feature.geometry || isNear(feature.geometry)
        ? feature
        : { ...feature, geometry: null },
    ),
  };
}
