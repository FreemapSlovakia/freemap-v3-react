// The OSM Editor Layer Index → src/features/mapLibrary/eli/; see "Harvesting"
// in doc/map-library.md. Run: node scripts/harvest-eli.mjs [imagery.geojson]
// [--reuse-probe]

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ELI_URL = 'https://osmlab.github.io/editor-layer-index/imagery.geojson';

const outDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '../src/features/mapLibrary/eli',
);

const idsPath = join(outDir, 'ids.json');

const catalogPath = join(outDir, 'eliCatalog.json');

const probePath = join(outDir, 'probe.json');

const nationalSourcesPath = join(
  dirname(fileURLToPath(import.meta.url)),
  'national-sources.json',
);

const args = process.argv.slice(2);

const reuseProbe = args.includes('--reuse-probe');

const inputPath = args.find((arg) => !arg.startsWith('--'));

// Matched against the tile URL's host.
const EXCLUDED_HOSTS = [
  // OSMF's servers are for OSM editing; its usage policy rules out an app.
  ['OSMF-hosted', /(^|\.)openstreetmap\.org$/i],
  // Freemap's own maps are built in.
  ['Freemap', /(^|\.)freemap\.sk$/i],
];

// Imagery and shading, which have no labels to shrink.
const DPI_SCALED_CATEGORIES = new Set(['photo', 'historicphoto', 'elevation']);

// Bumped when a probe record's meaning changes, so --reuse-probe asks again.
const PROBE_VERSION = 3;

/** A tile was served, or the probed spot merely had none (ragged coverage). */
const answered = (status) =>
  typeof status === 'number' &&
  ((status >= 200 && status < 300) || status === 404);

// The origins the app is served from; CORS must answer both.
const APP_ORIGINS = ['https://www.freemap.sk', 'https://www.freemap.eu'];

// Scraped or commercial sources, matched against the ELI id and the URL host
// only: attribution text names Esri or says "here" on agency maps that stay.
const EXCLUDED_SOURCES = [
  ['Google', /google/i],
  ['Bing', /bing|virtualearth/i],
  ['Yandex', /yandex/i],
  ['2GIS', /2gis/i],
  ['HERE', /here\.com|hereapi/i],
  ['Mapbox', /mapbox/i],
  ['Apple', /\bapple\b/i],
  ['DigitalGlobe/Maxar', /digitalglobe|maxar/i],
  // Esri's own basemaps only; agencies' tiles hosted on tiles.arcgis.com stay.
  [
    'Esri',
    /\besri\b|arcgisonline\.com|maptiles\.arcgis\.com|basemaps(-api)?\.arcgis\.com/i,
  ],
];

// Non-commercial licences clash with the premium tier.
const NON_COMMERCIAL = [
  ['EOX Sentinel-2 cloudless 2018+ (CC BY-NC-SA)', /^EOXAT20(1[89]|[2-9]\d)/],
  ['NC licence text', /by-nc|non-?commercial/i],
];

const KEY_PATTERNS = [
  /\{apikey\}/i,
  /[?&](api_?key|access_token|token|key)=/i,
  /\/token\//i,
];

const LEAFLET_PLACEHOLDERS = new Set(['x', 'y']);

async function loadEli(path) {
  if (path) {
    return JSON.parse(readFileSync(path, 'utf8'));
  }

  const res = await fetch(ELI_URL);

  if (!res.ok) {
    throw new Error(`${ELI_URL}: HTTP ${res.status}`);
  }

  return res.json();
}

/**
 * Maps found beyond ELI, as ELI features: a WMS by its base URL and `layers`,
 * the coverage by its `bbox`. Ids are `fm:<country>-…`, apart from ELI's.
 */
function loadNationalSources() {
  let entries;

  try {
    entries = JSON.parse(readFileSync(nationalSourcesPath, 'utf8'));
  } catch {
    return [];
  }

  return entries.map(({ layers, bbox: [w, s, e, n], note, ...p }) => ({
    type: 'Feature',
    properties: {
      ...p,
      url: layers
        ? `${p.url}${p.url.includes('?') ? '&' : '?'}SERVICE=WMS&REQUEST=GetMap&LAYERS=${layers.join(',')}&STYLES=`
        : p.url,
      available_projections: layers ? ['EPSG:3857'] : undefined,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [w, s],
          [e, s],
          [e, n],
          [w, n],
          [w, s],
        ],
      ],
    },
  }));
}

function host(url) {
  try {
    return new URL(url.replace(/\{[^}]*\}/g, 'x').replace(/^\/\//, 'https://'))
      .host;
  } catch {
    return '';
  }
}

/** JOSM-style template → Leaflet's, or a drop reason. */
function toLeaflet(url) {
  let tms = false;

  let plainY = false;

  let subdomains;

  let unsupported;

  const out = url.replace(/\{([^}]*)\}/g, (match, name) => {
    if (name === 'zoom' || name === 'z') {
      return '{z}';
    }

    if (name === '-y') {
      tms = true;

      return '{y}';
    }

    if (name.startsWith('switch:') && !subdomains) {
      subdomains = name.slice(7).split(',');

      return '{s}';
    }

    if (LEAFLET_PLACEHOLDERS.has(name)) {
      plainY ||= name === 'y';

      return match;
    }

    unsupported ??= match.replace(/:.*/, ':…}');

    return match;
  });

  if (unsupported) {
    return { error: `placeholder ${unsupported}` };
  }

  if (tms && plainY) {
    return { error: 'both {y} and {-y}' };
  }

  if (!/\{z\}/.test(out) || !/\{x\}/.test(out) || !/\{y\}/.test(out)) {
    return { error: 'missing {z}/{x}/{y}' };
  }

  return {
    url: out,
    tms,
    subdomains: subdomains?.every((s) => s.length === 1)
      ? subdomains.join('')
      : subdomains,
  };
}

// A GetMap URL's own parameters; Leaflet adds them per request.
const WMS_PARAMS = new Set([
  'service',
  'request',
  'version',
  'layers',
  'styles',
  'format',
  'transparent',
  'srs',
  'crs',
  'bbox',
  'width',
  'height',
  'exceptions',
]);

/** An ELI GetMap template → the base URL and layers the app asks with, or a drop reason. */
function toWms(url, projections) {
  if (!projections?.includes('EPSG:3857')) {
    return { error: 'wms: no EPSG:3857' };
  }

  let parsed;

  try {
    parsed = new URL(url.replace(/\{[^}]*\}/g, 'x'));
  } catch {
    return { error: 'wms: bad URL' };
  }

  // ELI files ArcGIS REST `export` URLs as WMS too.
  if (/\{wkid\}|\/MapServer\/export|[?&]f=image/i.test(url)) {
    return { error: 'wms: ArcGIS REST, not WMS' };
  }

  // Placeholders belong in the request parameters only.
  if (/\{[^}]*\}/.test(url.split('?')[0])) {
    return { error: 'wms: placeholder in path' };
  }

  const param = (name) =>
    [...parsed.searchParams].find(([k]) => k.toLowerCase() === name)?.[1];

  const layers = param('layers')?.split(',').filter(Boolean);

  if (!layers?.length) {
    return { error: 'wms: no layers' };
  }

  // The app asks for the default style, which `default` names too.
  if (
    param('styles')
      ?.split(',')
      .some((style) => style && style.toLowerCase() !== 'default')
  ) {
    return { error: 'wms: styles' };
  }

  for (const key of [...parsed.searchParams.keys()]) {
    if (WMS_PARAMS.has(key.toLowerCase())) {
      parsed.searchParams.delete(key);
    }
  }

  return { wms: true, url: parsed.toString(), layers };
}

// Rounded outwards so the box still contains the coverage.
function bboxOf(geometry) {
  if (!geometry) {
    return undefined;
  }

  let w = Infinity;
  let s = Infinity;
  let e = -Infinity;
  let n = -Infinity;

  const visit = (c) => {
    if (typeof c[0] === 'number') {
      w = Math.min(w, c[0]);
      e = Math.max(e, c[0]);
      s = Math.min(s, c[1]);
      n = Math.max(n, c[1]);
    } else {
      c.forEach(visit);
    }
  };

  visit(geometry.coordinates);

  const down = (v) => Math.floor(v * 1e4) / 1e4;
  const up = (v) => Math.ceil(v * 1e4) / 1e4;

  return [
    Math.max(-180, down(w)),
    Math.max(-90, down(s)),
    Math.min(180, up(e)),
    Math.min(90, up(n)),
  ];
}

/** Runs `task` over `items`, at most `limit` at a time. */
async function mapConcurrently(items, limit, task) {
  let next = 0;

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        await task(items[next++]);
      }
    }),
  );
}

/**
 * Fetches one tile at the middle of the coverage, as the app would — no
 * referrer, an origin to answer CORS for — and records how it went.
 */
async function probeTile(feature, leaflet) {
  const p = feature.properties;

  const box = bboxOf(feature.geometry) ?? [-180, -85, 180, 85];

  const z = Math.max(p.min_zoom ?? 0, Math.min(p.max_zoom ?? 18, 12));

  const lon = (box[0] + box[2]) / 2;

  const lat = (box[1] + box[3]) / 2;

  const n = 2 ** z;

  const x = Math.floor(((lon + 180) / 360) * n);

  const latRad = (lat * Math.PI) / 180;

  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  );

  const url = leaflet.wms
    ? getMapUrl(leaflet, p.overlay, z, x, y)
    : leaflet.url
        .replace(/^\/\//, 'https://')
        .replace('{s}', leaflet.subdomains?.[0] ?? '')
        .replace('{z}', String(z))
        .replace('{x}', String(x))
        .replace('{y}', String(leaflet.tms ? n - 1 - y : y));

  // A timeout or a dropped connection is tried once more before it counts.
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Origin: APP_ORIGINS[0] },
        signal: AbortSignal.timeout(15_000),
      });

      const size = res.ok ? imageSize(await res.arrayBuffer()) : undefined;

      if (!res.ok) {
        await res.body?.cancel();
      }

      return {
        // A redirect to http is blocked on an https page. A WMS reports an
        // error as an XML document with a 200.
        status: !res.url.startsWith('https:')
          ? 'redirected to http'
          : leaflet.wms && res.ok && !size
            ? 'not an image'
            : res.status,
        // A 404 carries the CORS headers as well. A WMS needs CORS only for
        // its layer list in the Map layers panel; the map is plain images.
        cors: await allowsAppOrigins(url, res),
        scales: size && !leaflet.wms ? await probeScales(url, size.width) : [],
      };
    } catch {
      if (attempt) {
        return { status: 'error', cors: false, scales: [] };
      }
    }
  }
}

/** The tile's GetMap request, as Leaflet's `TileLayer.WMS` makes it in the app. */
function getMapUrl(wms, overlay, z, x, y) {
  const size = (2 * Math.PI * 6378137) / 2 ** z;

  const minX = -Math.PI * 6378137 + x * size;

  const maxY = Math.PI * 6378137 - y * size;

  const url = new URL(wms.url);

  for (const [key, value] of Object.entries({
    service: 'WMS',
    request: 'GetMap',
    layers: wms.layers.join(','),
    styles: '',
    format: overlay ? 'image/png' : 'image/jpeg',
    transparent: String(Boolean(overlay)),
    version: '1.3.0',
    width: '256',
    height: '256',
    crs: 'EPSG:3857',
    bbox: [minX, maxY - size, minX + size, maxY].join(','),
  })) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}

/**
 * Whether the server lets both app origins read its tiles: `*`, or each
 * origin named back — one that names another site refuses ours.
 */
async function allowsAppOrigins(url, res) {
  const allowed = (r, origin) => {
    const acao = r.headers.get('access-control-allow-origin');

    return acao === '*' || acao === origin;
  };

  if (!allowed(res, APP_ORIGINS[0])) {
    return false;
  }

  if (res.headers.get('access-control-allow-origin') === '*') {
    return true;
  }

  try {
    const other = await fetch(url, {
      headers: { Origin: APP_ORIGINS[1] },
      signal: AbortSignal.timeout(15_000),
    });

    await other.body?.cancel();

    return allowed(other, APP_ORIGINS[1]);
  } catch {
    return false;
  }
}

/**
 * The `@Nx` variants the server has, appended to the tile URL as the app asks
 * for them: one counts when its tile is N times wider than the plain one.
 * Past a missing `@2x` the larger ones aren't tried.
 */
async function probeScales(url, width) {
  const scales = [];

  for (const scale of [2, 3, 4]) {
    try {
      const res = await fetch(`${url}@${scale}x`, {
        signal: AbortSignal.timeout(15_000),
      });

      const size = res.ok ? imageSize(await res.arrayBuffer()) : undefined;

      if (!res.ok) {
        await res.body?.cancel();
      }

      if (size?.width === width * scale) {
        scales.push(scale);
      } else if (scale === 2) {
        break;
      }
    } catch {
      if (scale === 2) {
        break;
      }
    }
  }

  return scales;
}

/** Width and height from a PNG, JPEG or WebP header, or undefined. */
function imageSize(buffer) {
  const b = Buffer.from(buffer);

  // PNG: the IHDR chunk follows the 8-byte signature.
  if (b.length >= 24 && b.readUInt32BE(0) === 0x89504e47) {
    return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  }

  // JPEG: the first start-of-frame marker holds the dimensions.
  if (b.length >= 4 && b[0] === 0xff && b[1] === 0xd8) {
    for (let i = 2; i + 9 < b.length; ) {
      if (b[i] !== 0xff) {
        return undefined;
      }

      const marker = b[i + 1];

      if (
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc
      ) {
        return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
      }

      i += 2 + b.readUInt16BE(i + 2);
    }

    return undefined;
  }

  // WebP: lossy, lossless or extended.
  if (
    b.length >= 30 &&
    b.toString('ascii', 0, 4) === 'RIFF' &&
    b.toString('ascii', 8, 12) === 'WEBP'
  ) {
    const chunk = b.toString('ascii', 12, 16);

    if (chunk === 'VP8 ') {
      return {
        width: b.readUInt16LE(26) & 0x3fff,
        height: b.readUInt16LE(28) & 0x3fff,
      };
    }

    if (chunk === 'VP8L') {
      const bits = b.readUInt32LE(21);

      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
      };
    }

    if (chunk === 'VP8X') {
      return {
        width: b.readUIntLE(24, 3) + 1,
        height: b.readUIntLE(27, 3) + 1,
      };
    }
  }

  return undefined;
}

const isValidId = (id) => /[A-Z]/.test(id);

function allocateId(eliId, taken) {
  for (let bump = 0; ; bump++) {
    const digest = createHash('sha256')
      .update(bump ? `${eliId}#${bump}` : eliId)
      .digest();

    const id = (digest.readBigUInt64BE() % 36n ** 5n)
      .toString(36)
      .toUpperCase()
      .padStart(5, '0');

    if (isValidId(id) && !taken.has(id)) {
      return id;
    }
  }
}

const sortedObject = (o) =>
  Object.fromEntries(
    Object.entries(o).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
  );

// Puts arrays of scalars on one line where they fit, as Biome formats them.
const toJson = (value) =>
  `${JSON.stringify(value, null, 2).replace(
    /^( *)(.*)\[\n([^[\]{}]*?)\n *\]/gm,
    (match, indent, head, items) => {
      const line = `${indent}${head}[${items.trim().split(/,\n */).join(', ')}]`;

      return line.length <= 80 ? line : match;
    },
  )}\n`;

const eli = await loadEli(inputPath);

eli.features.push(...loadNationalSources());

const counts = { total: eli.features.length };

const drops = {};

const drop = (reason, p) => {
  drops[reason] = [...(drops[reason] ?? []), p.id];
};

const types = {};

const kept = [];

for (const feature of eli.features) {
  const p = feature.properties;

  types[p.type] = (types[p.type] ?? 0) + 1;

  if (p.type !== 'tms' && p.type !== 'wms') {
    continue;
  }

  if (/^http:/i.test(p.url)) {
    drop('http only', p);
    continue;
  }

  if (KEY_PATTERNS.some((re) => re.test(p.url)) || p['custom-http-headers']) {
    drop('needs key or headers', p);
    continue;
  }

  const leaflet =
    p.type === 'wms' ? toWms(p.url, p.available_projections) : toLeaflet(p.url);

  if (leaflet.error) {
    drop(leaflet.error, p);
    continue;
  }

  if (!leaflet.wms && p['tile-size'] && p['tile-size'] !== 256) {
    drop('tile size', p);
    continue;
  }

  const excludedHost = EXCLUDED_HOSTS.find(([, re]) => re.test(host(p.url)));

  if (excludedHost) {
    drop(`excluded host: ${excludedHost[0]}`, p);
    continue;
  }

  const haystack = [p.id, host(p.url)].join(' ');

  const source = EXCLUDED_SOURCES.find(([, re]) => re.test(haystack));

  if (source) {
    drop(`excluded source: ${source[0]}`, p);
    continue;
  }

  const licenceText = [
    p.license_url,
    p.attribution?.text,
    p['terms-of-use-text'],
  ].join(' ');

  const nc = NON_COMMERCIAL.find(
    ([, re]) => re.test(p.id) || re.test(licenceText),
  );

  if (nc) {
    drop(`non-commercial: ${nc[0]}`, p);
    continue;
  }

  // ELI's permissions are for tracing, not display; with no licence to read,
  // an entry waits for a review.
  if (!p.license_url) {
    drop('held: no licence URL', p);
    continue;
  }

  kept.push({ feature, leaflet });
}

const previousProbe = (() => {
  try {
    return JSON.parse(readFileSync(probePath, 'utf8'));
  } catch {
    return {};
  }
})();

const probe = {};

await mapConcurrently(kept, 12, async ({ feature, leaflet }) => {
  const { id } = feature.properties;

  const previous = previousProbe[id];

  // Only a current-format answer is reused; a failure is always asked again.
  probe[id] =
    reuseProbe && previous?.v === PROBE_VERSION && answered(previous.status)
      ? previous
      : { v: PROBE_VERSION, ...(await probeTile(feature, leaflet)) };
});

// A tile that couldn't be had at all drops the map; a 404 only says the probed
// spot is empty, which a ragged coverage often is.
const alive = kept.filter(({ feature }) => {
  const { status } = probe[feature.properties.id];

  if (status === 401 || status === 403) {
    drop('forbidden', feature.properties);
    return false;
  }

  if (status === 'not an image') {
    drop('wms: not an image', feature.properties);
    return false;
  }

  if (status === 'redirected to http') {
    drop('redirected to http', feature.properties);
    return false;
  }

  if (!answered(status)) {
    drop('dead', feature.properties);
    return false;
  }

  return true;
});

kept.length = 0;

kept.push(...alive);

counts.types = types;

// The id table: existing entries always win.
const table = (() => {
  try {
    return JSON.parse(readFileSync(idsPath, 'utf8'));
  } catch {
    return { ids: {}, retired: {} };
  }
})();

const ids = { ...table.ids };
const retired = { ...table.retired };

const keptIds = new Set(kept.map(({ feature }) => feature.properties.id));

for (const eliId of Object.keys(ids)) {
  if (!keptIds.has(eliId)) {
    retired[eliId] = ids[eliId];
    delete ids[eliId];
  }
}

const taken = new Set([...Object.values(ids), ...Object.values(retired)]);

let allocated = 0;

for (const eliId of [...keptIds].sort()) {
  if (ids[eliId]) {
    continue;
  }

  if (retired[eliId]) {
    ids[eliId] = retired[eliId];
    delete retired[eliId];
    continue;
  }

  const id = allocateId(eliId, taken);

  taken.add(id);
  ids[eliId] = id;
  allocated++;
}

const catalog = kept
  .map(({ feature, leaflet }) => {
    const p = feature.properties;

    const cc = p.country_code?.toLowerCase();

    const row = {
      type: ids[p.id],
      layer: p.overlay ? 'overlay' : 'base',
      name: p.name,
      countries: cc && cc !== 'zz' ? [cc] : undefined,
      bbox: bboxOf(feature.geometry),
      category: p.category,
    };

    const attribution = p.attribution?.text
      ? [{ type: 'map', name: p.attribution.text, url: p.attribution.url }]
      : [];

    if (leaflet.wms) {
      return {
        ...row,
        technology: 'wms',
        body: {
          url: leaflet.url,
          layers: leaflet.layers,
          minZoom: p.min_zoom,
          maxNativeZoom: p.max_zoom,
          attribution,
        },
      };
    }

    return {
      ...row,
      body: {
        url: leaflet.url,
        subdomains: leaflet.subdomains,
        tms: leaflet.tms || undefined,
        minZoom: p.min_zoom,
        maxNativeZoom: p.max_zoom,
        // Without CORS headers a crossOrigin request gets no tile.
        cors: probe[p.id].cors ? undefined : false,
        // Real hi-DPI tiles where the server has them; else imagery is sharpened
        // by fetching a zoom deeper, as the built-in aerials are, while maps
        // with labels stay as they are, which would shrink.
        ...(probe[p.id].scales.length
          ? { extraScales: probe[p.id].scales }
          : DPI_SCALED_CATEGORIES.has(p.category)
            ? { scaleWithDpi: true }
            : {}),
        attribution,
      },
    };
  })
  .sort((a, b) => (a.type < b.type ? -1 : 1));

mkdirSync(outDir, { recursive: true });

writeFileSync(
  idsPath,
  toJson({ ids: sortedObject(ids), retired: sortedObject(retired) }),
);

// Derived from ELI, so under its licence and crediting it.
writeFileSync(
  catalogPath,
  toJson({
    source:
      'OSM Editor Layer Index, https://github.com/osmlab/editor-layer-index, and scripts/national-sources.json',
    licence: 'CC BY-SA 3.0, https://creativecommons.org/licenses/by-sa/3.0/',
    maps: catalog,
  }),
);

writeFileSync(probePath, toJson(sortedObject(probe)));

const tally = (key) =>
  sortedObject(
    catalog.reduce((acc, m) => {
      const k = m[key] ?? '(none)';
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {}),
  );

const keptProps = kept.map(({ feature }) => feature.properties);

console.log(
  JSON.stringify(
    {
      ...counts,
      tms: types.tms ?? 0,
      dropped: sortedObject(
        Object.fromEntries(
          Object.entries(drops).map(([k, v]) => [k, v.length]),
        ),
      ),
      kept: catalog.length,
      byTechnology: tally('technology'),
      byLayer: tally('layer'),
      byCategory: tally('category'),
      withoutCors: catalog.filter((m) => m.body.cors === false).length,
      // Their maps draw without it; only the layer list in the panel needs it.
      wmsWithoutCors: keptProps.filter(
        (p) => p.type === 'wms' && !probe[p.id].cors,
      ).length,
      withExtraScales: sortedObject(
        catalog.reduce((acc, m) => {
          const k = m.body.extraScales?.join(',');

          if (k) {
            acc[k] = (acc[k] ?? 0) + 1;
          }

          return acc;
        }, {}),
      ),
      scaleWithDpi: catalog.filter((m) => m.body.scaleWithDpi).length,
      probed404: keptProps.filter((p) => probe[p.id].status === 404).length,
      noAttribution: keptProps.filter((p) => !p.attribution?.text).length,
      worldwide: catalog.filter((m) => !m.bbox).length,
      newIds: allocated,
      retiredIds: Object.keys(retired).length,
      excluded: Object.fromEntries(
        Object.entries(drops).filter(([k]) =>
          /^(excluded|non-commercial|needs key|dead|forbidden)/.test(k),
        ),
      ),
    },
    null,
    2,
  ),
);
