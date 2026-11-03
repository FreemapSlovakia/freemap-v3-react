import { fetchOrNetworkError, isNetworkError } from '@app/httpRequest.js';
import { isCatalogId } from '@shared/mapLibrary/catalogId.js';

export type Layer = {
  title: string | null;
  name: string | null;
  queryable: boolean;
  transparent: boolean;
  minScale: number | null;
  maxScale: number | null;
  /** The area the layer covers, as [west, south, east, north]. */
  bbox: [number, number, number, number] | null;
  children: Layer[];
  legendUrl: string | null;
};

/** EPSG:3857 and the codes that are aliases of it. */
export const MERCATOR_EPSG_CODES = ['3857', '900913', '102100', '102113'];

/**
 * Projections the map can draw. `CRS:84` and the Google-Mercator aliases count
 * as the two standard codes they are equivalent to.
 */
const SUPPORTED_CRS = new Set([
  ...MERCATOR_EPSG_CODES.map((code) => `EPSG:${code}`),
  'EPSG:4326',
  'CRS:84',
]);

/**
 * Parameters that describe one request rather than the service, and that every
 * request sets for itself. A URL pasted from a server's own example carries
 * some of them already — a `REQUEST=GetCapabilities` left beside the
 * `request=GetMap` a tile asks for makes the server answer with neither, since
 * the names are case-insensitive but `URLSearchParams` keys are not. What
 * identifies the service, MapServer's `map=` above all, is kept.
 */
const REQUEST_PARAMS = [
  'service',
  'request',
  'version',
  'styles',
  'format',
  'transparent',
  'crs',
  'srs',
  'bbox',
  'width',
  'height',
];

/**
 * The service's own URL, with any request's parameters stripped off it. Pass
 * `alsoStrip` for the ones a particular request sets on top of those — the
 * rendering hints, the feature-info parameters and `layers` are left in place
 * otherwise, so that a URL tuned by hand keeps them. `layers` matters most: a
 * layer whose layer list is empty has nothing of its own to ask for, and the
 * pasted URL is then the only thing naming what to draw.
 */
export function wmsBaseUrl(
  urlString: string,
  alsoStrip: string[] = [],
): string {
  let url: URL;

  try {
    url = new URL(urlString);
  } catch {
    return urlString;
  }

  const strip = [...REQUEST_PARAMS, ...alsoStrip.map((k) => k.toLowerCase())];

  for (const key of [...url.searchParams.keys()]) {
    if (strip.includes(key.toLowerCase())) {
      url.searchParams.delete(key);
    }
  }

  return url.toString();
}

/** Parses an OGC service's XML answer, throwing on non-XML or an exception. */
export function parseWmsXml(text: string): Document {
  const dom = new DOMParser().parseFromString(text, 'text/xml');

  const root = dom.documentElement;

  // Searched from the document rather than from the root, which is itself the
  // `parsererror` element when the response was not XML at all.
  if (!root?.localName || dom.getElementsByTagName('parsererror').length) {
    throw new Error("The server's response is not XML.");
  }

  // Answered with 200 by servers that report failure in the body. The OWS
  // form is `ExceptionReport`, the WMS one `ServiceExceptionReport`.
  if (/^(Service)?Exception/.test(root.localName)) {
    throw new Error(root.textContent?.trim() || 'WMS service exception');
  }

  return dom;
}

/** A catalog map's WMS, which the API proxies by its id; `always` skips the direct try. */
export type WmsProxy = { type: string; always?: boolean };

/** Only catalog maps are proxied: the API knows their services. */
export function wmsProxyOf(def: {
  type: string;
  source?: string;
  proxy?: boolean;
}): WmsProxy | undefined {
  // A named map is proxied as the library map it was made from.
  const type = def.source ?? def.type;

  return isCatalogId(type) ? { type, always: def.proxy } : undefined;
}

// Maps whose service the page could not reach directly, for the page's life.
const proxiedTypes = new Set<string>();

/** The API builds the service URL from the catalog; only the query goes along. */
const wmsProxyUrl = (type: string, url: string) =>
  `${process.env['API_URL']}/wms-proxy/${type}${new URL(url).search}`;

/**
 * Requests what the page must read directly, then through the API's proxy on a
 * `NetworkError`: missing CORS and an outage look alike. Catalog WMS URLs are
 * https only, as the map's images don't go through the proxy.
 */
export async function requestWms<T>(
  url: string,
  proxy: WmsProxy | undefined,
  request: (url: string) => Promise<T>,
): Promise<T> {
  if (!proxy) {
    return request(url);
  }

  if (proxy.always || proxiedTypes.has(proxy.type)) {
    return request(wmsProxyUrl(proxy.type, url));
  }

  try {
    return await request(url);
  } catch (err) {
    // Offline, the proxy is out of reach too, and says nothing about the service.
    if (!isNetworkError(err) || !navigator.onLine) {
      throw err;
    }
  }

  // The proxy serves only this map's own service, so pinning can't misroute.
  proxiedTypes.add(proxy.type);

  return request(wmsProxyUrl(proxy.type, url));
}

export async function wms(urlString: string, proxy?: WmsProxy) {
  const url = new URL(wmsBaseUrl(urlString));

  url.searchParams.set('request', 'GetCapabilities');
  url.searchParams.set('service', 'WMS');
  url.searchParams.set('version', '1.3.0');

  // Throws on an error status, so a failing proxy isn't taken as working.
  const res = await requestWms(url.toString(), proxy, async (url) => {
    const res = await fetchOrNetworkError(new Request(url));

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return res;
  });

  const dom = parseWmsXml(await res.text());

  const root = dom.documentElement;

  /**
   * Elements are matched by local name, ignoring the namespace they are in: a
   * proxy that rewrites every `http://` in the document to `https://` rewrites
   * the namespace declarations too, though those are identifiers and not
   * addresses, and a 1.1.1 document is DTD-based with no namespace at all — a
   * server capping at 1.1.1 answers a 1.3.0 request with one, so that shape has
   * to parse as well. `local-name(.)` rather than `local-name()`: the argument
   * is redundant to the spec but required by some implementations.
   */
  const el = (name: string) => `*[local-name(.)='${name}']`;

  function elements(node: Node, xpath: string): Element[] {
    const iterator = dom.evaluate(
      xpath,
      node,
      null,
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
    );

    const result: Element[] = [];

    for (let n = iterator.iterateNext(); n; n = iterator.iterateNext()) {
      if (n instanceof Element) {
        result.push(n);
      }
    }

    return result;
  }

  function getText(node: Node, name: string): string | null {
    return elements(node, `./${el(name)}`)[0]?.textContent?.trim() || null;
  }

  const globalFormats = elements(
    root,
    `./${el('Capability')}/${el('Request')}/${el('GetMap')}/${el('Format')}`,
  ).flatMap((n) => (n.textContent ? [n.textContent] : []));

  /** Whether a layer declares a projection of its own that the map can draw. */
  function hasSupportedCrs(node: Element): boolean {
    return [
      ...elements(node, `./${el('CRS')}`),
      ...elements(node, `./${el('SRS')}`),
    ].some((n) =>
      // 1.1.1 allows several codes in one `SRS` element, space separated.
      (n.textContent ?? '')
        .trim()
        .split(/\s+/)
        .some((code) => SUPPORTED_CRS.has(code.toUpperCase())),
    );
  }

  /**
   * Both elements are defined in degrees, so anything outside them — a server
   * putting projected metres in one, or naming the corners the wrong way round
   * — is not an extent this can use. Taken at face value it would place the
   * layer somewhere off the earth and offer to fly there.
   */
  function asDegrees(box: number[]): [number, number, number, number] | null {
    const [west, south, east, north] = box;

    return box.every((n) => !Number.isNaN(n)) &&
      west >= -180 &&
      east <= 180 &&
      south >= -90 &&
      north <= 90 &&
      west < east &&
      south < north
      ? [west, south, east, north]
      : null;
  }

  /**
   * The area a layer declares, which 1.3.0 spells out in child elements and
   * 1.1.1 in attributes of one.
   */
  function getBbox(node: Element): [number, number, number, number] | null {
    const geographic = elements(node, `./${el('EX_GeographicBoundingBox')}`)[0];

    if (geographic) {
      const box = asDegrees(
        (
          [
            'westBoundLongitude',
            'southBoundLatitude',
            'eastBoundLongitude',
            'northBoundLatitude',
          ] as const
        ).map((side) => parseFloat(getText(geographic, side) || '')),
      );

      if (box) {
        return box;
      }
    }

    const latLon = elements(node, `./${el('LatLonBoundingBox')}`)[0];

    if (latLon) {
      const box = asDegrees(
        (['minx', 'miny', 'maxx', 'maxy'] as const).map((side) =>
          parseFloat(latLon.getAttribute(side) || ''),
        ),
      );

      if (box) {
        return box;
      }
    }

    return null;
  }

  function getLegendUrl(node: Node): string | null {
    const onlineResource = elements(
      node,
      `.//${el('Style')}/${el('LegendURL')}/${el('OnlineResource')}`,
    )[0];

    // The xlink namespace gets rewritten by the same kind of proxy, so the
    // qualified name is the last resort.
    return (
      onlineResource?.getAttributeNS('http://www.w3.org/1999/xlink', 'href') ??
      onlineResource?.getAttributeNS('https://www.w3.org/1999/xlink', 'href') ??
      onlineResource?.getAttribute('xlink:href') ??
      null
    );
  }

  /**
   * Projections, scale range and extent are inheritable properties: a layer
   * that declares none takes its parent's. Support is therefore carried down
   * the tree, and a layer supporting none is kept only for the sake of the
   * supported ones below it.
   */
  function parseLayer(
    node: Element,
    inherited: {
      crs: boolean;
      minScale: number | null;
      maxScale: number | null;
      bbox: [number, number, number, number] | null;
    },
  ): Layer | null {
    const crs = inherited.crs || hasSupportedCrs(node);

    const minScale =
      parseFloat(getText(node, 'MinScaleDenominator') || '') ||
      inherited.minScale;

    const maxScale =
      parseFloat(getText(node, 'MaxScaleDenominator') || '') ||
      inherited.maxScale;

    const bbox = getBbox(node) ?? inherited.bbox;

    const children = elements(node, `./${el('Layer')}`).flatMap((child) => {
      const layer = parseLayer(child, { crs, minScale, maxScale, bbox });

      return layer ? [layer] : [];
    });

    if (!crs && children.length === 0) {
      return null;
    }

    return {
      title: getText(node, 'Title'),
      name: getText(node, 'Name'),
      queryable: node.getAttribute('queryable') === '1',
      transparent: node.getAttribute('opaque') !== '1',
      minScale,
      maxScale,
      bbox,
      legendUrl: getLegendUrl(node),
      children,
    };
  }

  // The root layer is offered itself when it is requestable — a service whose
  // whole map is one layer has nothing below it — and is otherwise just the
  // container its children are listed from.
  const layersTree = elements(
    root,
    `./${el('Capability')}/${el('Layer')}`,
  ).flatMap((node) => {
    const layer = parseLayer(node, {
      crs: false,
      minScale: null,
      maxScale: null,
      bbox: null,
    });

    return !layer ? [] : layer.name ? [layer] : layer.children;
  });

  const title = getText(
    elements(root, `./${el('Service')}`)[0] ?? root,
    'Title',
  );

  return { title: title ?? '', globalFormats, layersTree };
}

// Per service, for as long as the page lives; a failed one is asked again.
const capabilities = new Map<string, Promise<Layer[]>>();

/** A service and its route: a custom map on the same service can't reach the proxy. */
export const wmsLayersKey = (url: string, proxy?: WmsProxy) =>
  `${proxy?.type ?? ''} ${url}`;

/** A service's layer tree, fetched once for the layer picker and legend alike. */
export function wmsLayers(url: string, proxy?: WmsProxy): Promise<Layer[]> {
  const key = wmsLayersKey(url, proxy);

  let p = capabilities.get(key);

  if (!p) {
    p = wms(url, proxy).then(({ layersTree }) => layersTree);

    p.catch(() => capabilities.delete(key));

    capabilities.set(key, p);
  }

  return p;
}
