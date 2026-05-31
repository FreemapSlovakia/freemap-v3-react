import { setActiveModal } from '@app/store/actions.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import type { DrawingLineType } from '@features/drawing/model/actions/drawingLineActions.js';
import { DrawingLinesState } from '@features/drawing/model/reducers/drawingLinesReducer.js';
import { DrawingPointsState } from '@features/drawing/model/reducers/drawingPointsReducer.js';
import { ObjectsState } from '@features/objects/model/reducer.js';
import { RoutePlannerState } from '@features/routePlanner/model/reducer.js';
import { TrackingState } from '@features/tracking/model/reducer.js';
import { TrackViewerState } from '@features/trackViewer/model/reducer.js';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { splitColorAlpha } from '@shared/colorAlpha.js';
import { COLORS } from '@shared/colors.js';
import {
  faIconToSvg,
  loadAllIcons,
  parseIconSpec,
  poiIconNameToUrl,
} from '@shared/drawingIcons.js';
import { escapeHtml } from '@shared/stringUtils.js';
import type { LatLon } from '@shared/types/common.js';
import { Feature, FeatureCollection } from 'geojson';
import { iconSpecToGarminSym } from '../../garminSymMapping.js';
import {
  iconSpecToOsmAndIcon,
  markerTypeToOsmAndBackground,
} from '../../osmandIconMapping.js';
import { exportMapFeatures } from '../actions.js';
import { fetchPictures, Picture } from './fetchPictures.js';
import {
  addAttribute,
  createElement,
  GARMIN_NS,
  GPX_NS,
  GPX_STYLE_NS,
  LOCUS_NS,
} from './gpxExporter.js';
import { upload } from './upload.js';

// Freemap-private namespace for lossless round-trip of drawing-point styling
// (markerType + icon spec + color) that has no standard GPX equivalent. Other
// consumers ignore unknown extension elements per the GPX spec.
const FM_NS = 'https://www.freemap.sk/GPX/1/0';

// OsmAnd's GPX waypoint extension namespace, declared on the root so we can
// emit `<osmand:icon>`, `<osmand:background>` and `<osmand:color>`.
const OSMAND_NS = 'https://osmand.net';

// The namespace that namespace declarations themselves live in. Declaring
// `xmlns:*` attributes via setAttributeNS with this namespace makes
// XMLSerializer treat them as in-scope prefixes instead of redeclaring them
// on every child element.
const XMLNS_NS = 'http://www.w3.org/2000/xmlns/';

// TODO instead of creating XML directly, create JSON and serialize it to XML

const handle: ProcessorHandler<typeof exportMapFeatures> = async ({
  getState,
  action,
  dispatch,
}) => {
  const doc = document.implementation.createDocument(GPX_NS, 'gpx', null);

  doc.documentElement.setAttributeNS(
    'http://www.w3.org/2001/XMLSchema-instance',
    'xsi:schemaLocation',
    `${GPX_NS} http://www.topografix.com/GPX/1/1/gpx.xsd
      ${GARMIN_NS} https://www8.garmin.com/xmlschemas/GpxExtensionsv3.xsd
      ${GPX_STYLE_NS} https://www.topografix.com/GPX/gpx_style/0/2/gpx_style.xsd`,
  );

  // Declare the prefixes as real namespace declarations (in the xmlns
  // namespace) rather than plain attributes. Otherwise XMLSerializer doesn't
  // see them as in-scope and re-declares `xmlns:*` on every child element that
  // uses them.
  doc.documentElement.setAttributeNS(XMLNS_NS, 'xmlns:locus', LOCUS_NS);

  doc.documentElement.setAttributeNS(XMLNS_NS, 'xmlns:fm', FM_NS);

  doc.documentElement.setAttributeNS(XMLNS_NS, 'xmlns:osmand', OSMAND_NS);

  addAttribute(doc.documentElement, 'version', '1.1');

  addAttribute(doc.documentElement, 'creator', 'https://www.freemap.sk/');

  const meta = createElement(doc.documentElement, 'metadata');

  createElement(meta, 'desc', 'Exported from https://www.freemap.sk/');

  const author = createElement(meta, 'author');

  createElement(author, 'name', 'Freemap Slovakia');

  createElement(author, 'email', undefined, {
    id: 'freemap',
    domain: 'freemap.sk',
  });

  const link = createElement(author, 'link', undefined, {
    href: 'https://www.freemap.sk/',
  });

  createElement(link, 'text', 'Freemap Slovakia');

  createElement(link, 'type', 'text/html');

  // TODO add other licences depending on exported items

  const copyright = createElement(meta, 'copyright', undefined, {
    author: 'OpenStreetMap contributors',
  });

  createElement(
    copyright,
    'license',
    'https://www.openstreetmap.org/copyright',
  );

  createElement(meta, 'time', new Date().toISOString());

  createElement(meta, 'keywords', action.payload.exportables.join(' '));

  const {
    drawingLines,
    drawingPoints,
    objects,
    routePlanner,
    tracking,
    trackViewer,
    search,
    l10n: { language },
  } = getState();

  const set = new Set(action.payload.exportables);

  if (set.has('pictures')) {
    addPictures(doc, await fetchPictures(getState), language);
  }

  if (set.has('drawingLines')) {
    addDrawingLines(doc, drawingLines, 'line');
  }

  if (set.has('drawingAreas')) {
    addDrawingLines(doc, drawingLines, 'polygon');
  }

  if (set.has('drawingPoints')) {
    await addDrawingPoints(doc, drawingPoints);
  }

  if (set.has('objects')) {
    addObjects(doc, objects);
  }

  if (set.has('plannedRoute') || set.has('plannedRouteWithStops')) {
    addPlannedRoute(doc, routePlanner, set.has('plannedRouteWithStops'));
  }

  if (set.has('tracking')) {
    addTracking(doc, tracking);
  }

  if (set.has('gpx')) {
    addGpx(doc, trackViewer);
  }

  if (set.has('search')) {
    const geojson = search.selectedResult?.geojson;

    if (geojson) {
      addGeojson(doc, geojson);
    }
  }

  // order nodes

  const r = getSupportedGpxElements(doc);

  const q: Record<string, Node[]> = {
    wpt: [],
    rte: [],
    trk: [],
  };

  let curr: Node | null;

  while ((curr = r.iterateNext())) {
    q[curr.nodeName].push(curr);
  }

  for (const nodeName of ['wpt', 'rte', 'trk']) {
    for (const node of q[nodeName]) {
      doc.documentElement.appendChild(node);
    }
  }

  const { target } = action.payload;

  if (
    await upload(
      'gpx',
      new Blob([new XMLSerializer().serializeToString(doc)], {
        type:
          target === 'dropbox'
            ? 'application/octet-stream' /* 'application/gpx+xml' is denied */
            : 'application/gpx+xml',
      }),
      target,
      getState,
      dispatch,
    )
  ) {
    dispatch(setActiveModal(null));
  }
};

export default handle;

function addPictures(doc: Document, pictures: Picture[], lang: string) {
  for (const {
    lat,
    lon,
    id,
    takenAt,
    createdAt,
    title,
    description,
    tags,
    rating,
    user,
    hmac,
  } of pictures) {
    const wptEle = createElement(doc.documentElement, 'wpt', undefined, {
      lat: String(lat),
      lon: String(lon),
    });

    if (takenAt) {
      createElement(wptEle, 'time', takenAt.toISOString());
    }

    if (title) {
      createElement(wptEle, 'name', title);
    }

    const gm = window.translations?.gallery;

    const lines: [string, string][] = [];

    lines.push([gm?.filterModal.author ?? 'Author', user]);

    if (description) {
      lines.push([gm?.filterModal.takenAt ?? 'Capture date', description]);
    }

    if (createdAt) {
      lines.push([
        gm?.filterModal.createdAt ?? 'Upload date',
        createdAt.toLocaleString(lang),
      ]);
    }

    if (takenAt) {
      lines.push([
        gm?.filterModal.takenAt ?? 'Taken at',
        takenAt.toLocaleString(lang),
      ]);
    }

    lines.push([gm?.editForm.tags ?? 'Tags', tags.join(', ') || '-']);

    // 3.5: ★★★⯪☆
    const ratingFract = rating - Math.floor(rating);

    lines.push([
      gm?.filterModal.rating ?? 'Rating',
      '★'.repeat(Math.floor(rating)) +
        (ratingFract < 0.25 ? '☆' : ratingFract < 0.75 ? '⯪' : '★') +
        '☆'.repeat(4 - Math.floor(rating)),
    ]);

    let imageUrl = `${process.env['API_URL']}/gallery/pictures/${id}/image`;

    if (hmac) {
      imageUrl += '&hmac=' + encodeURIComponent(hmac);
    }

    createElement(wptEle, 'desc', {
      cdata:
        `<img src="${escapeHtml(imageUrl)}" width="100%"><p>` +
        lines
          .map(
            ([key, value]) => `<b>${escapeHtml(key)}</b>: ` + escapeHtml(value),
          )
          .join('｜') +
        '</p>',
    });

    const link1 = createElement(wptEle, 'link', undefined, {
      href: `${location.origin}?image=${id}`,
    });

    createElement(link1, 'text', gm?.linkToWww ?? 'photo at www.freemap.sk');

    createElement(link1, 'type', 'text/html');

    const link2 = createElement(wptEle, 'link', undefined, {
      href: imageUrl,
    });

    createElement(link2, 'text', gm?.linkToImage ?? 'photo image file');

    createElement(link2, 'type', 'image/jpeg');

    // TODO add comments to cmt?
  }
}

function addDrawingLines(
  doc: Document,
  { lines }: DrawingLinesState,
  type: DrawingLineType,
) {
  for (const line of lines.filter((line) => line.type === type)) {
    const trkEle = createElement(doc.documentElement, 'trk');

    if (line.label) {
      createElement(trkEle, 'name', line.label);
    }

    const extEle = createElement(trkEle, 'extensions');

    const stroke = splitColorAlpha(line.color ?? COLORS.normal);
    const rgb = stroke.color.slice(1);

    const fillSrc = line.fillColor ?? line.color ?? COLORS.normal;
    const fillRaw = splitColorAlpha(fillSrc);
    const fill = {
      color: fillRaw.color,
      opacity: line.fillColor ? fillRaw.opacity : 0.33,
    };
    const fillRgb = fill.color.slice(1);

    if (type === 'polygon') {
      const fillStyleEle = createElement(extEle, [GPX_STYLE_NS, 'fill']);

      createElement(fillStyleEle, [GPX_STYLE_NS, 'color'], fillRgb);

      createElement(
        fillStyleEle,
        [GPX_STYLE_NS, 'opacity'],
        fill.opacity.toFixed(2),
      );
    }

    const lineStyleEle = createElement(extEle, [GPX_STYLE_NS, 'line']);

    createElement(lineStyleEle, [GPX_STYLE_NS, 'color'], rgb);

    createElement(
      lineStyleEle,
      [GPX_STYLE_NS, 'opacity'],
      stroke.opacity.toFixed(2),
    );

    createElement(
      lineStyleEle,
      [GPX_STYLE_NS, 'width'],
      String(line.width || 4),
    );

    if (line.lineCap) {
      createElement(lineStyleEle, [GPX_STYLE_NS, 'linecap'], line.lineCap);
    }

    if (line.lineJoin) {
      createElement(lineStyleEle, [GPX_STYLE_NS, 'linejoin'], line.lineJoin);
    }

    if (line.dashArray && line.dashArray.length > 0) {
      createElement(
        lineStyleEle,
        [GPX_STYLE_NS, 'dasharray'],
        line.dashArray.join(' '),
      );
    }

    const ext2Ele = createElement(lineStyleEle, 'extensions');

    createElement(
      ext2Ele,
      [LOCUS_NS, 'locus:lsColorBase'],
      '#' + toLocusAlpha(stroke.opacity) + rgb,
    );

    createElement(
      ext2Ele,
      [LOCUS_NS, 'locus:lsWidth'],
      String(line.width ?? 4),
    );

    createElement(ext2Ele, [LOCUS_NS, 'locus:lsUnits'], 'PIXELS');

    if (type === 'polygon') {
      createElement(
        ext2Ele,
        [LOCUS_NS, 'locus:lsColorFill'],
        '#' + toLocusAlpha(fill.opacity) + fillRgb,
      );
    }

    // Freemap-private extensions for lossless round-trip. GPX has no native
    // polygon type — `fm:type=polygon` is the unambiguous signal for our
    // importer, separate from the gpx_style:fill heuristic that other
    // consumers use. Color/lineCap/lineJoin/dashArray are duplicated here
    // because gpx_style splits color into RGB+opacity (losing the original
    // hex alpha precision) and not every reader handles linecap/linejoin.
    appendNs(extEle, FM_NS, 'fm:type', type);

    if (line.color) {
      appendNs(extEle, FM_NS, 'fm:color', line.color);
    }

    if (type === 'polygon' && line.fillColor) {
      appendNs(extEle, FM_NS, 'fm:fillColor', line.fillColor);
    }

    if (line.lineCap) {
      appendNs(extEle, FM_NS, 'fm:lineCap', line.lineCap);
    }

    if (line.lineJoin) {
      appendNs(extEle, FM_NS, 'fm:lineJoin', line.lineJoin);
    }

    if (line.dashArray && line.dashArray.length > 0) {
      appendNs(extEle, FM_NS, 'fm:dashArray', line.dashArray.join(' '));
    }

    if (line.width != null) {
      appendNs(extEle, FM_NS, 'fm:width', String(line.width));
    }

    // OsmAnd track styling: a single colour element + width, plus a fill
    // colour for polygons. OsmAnd renders closed tracks with a fill colour
    // as filled areas.
    if (line.color) {
      appendNs(extEle, OSMAND_NS, 'osmand:color', stroke.color);
    }

    if (line.width != null) {
      appendNs(extEle, OSMAND_NS, 'osmand:width', String(line.width));
    }

    if (type === 'polygon') {
      appendNs(extEle, OSMAND_NS, 'osmand:fill_color', fill.color);
    }

    const trksegEle = createElement(trkEle, 'trkseg');

    const points =
      type === 'line' ? line.points : [...line.points, line.points[0]];

    for (const { lat, lon } of points) {
      createElement(trksegEle, 'trkpt', undefined, toLatLon({ lat, lon }));
    }
  }
}

async function addDrawingPoints(doc: Document, { points }: DrawingPointsState) {
  // Caches shared across all points in this export, so a thousand identical
  // poi/fa icons resolve once, and identical markers rasterize to PNG once.
  const faCache = new Map<string, IconDefinition | undefined>();
  const poiDataUrlCache = new Map<string, Promise<string | undefined>>();
  const locusIconCache = new Map<string, Promise<string | undefined>>();

  // Build the synchronous parts (and kick off the async Locus-icon work) in
  // order, then await all icons in parallel and attach them.
  const pending: { extEle: Element; locusIcon: Promise<string | undefined> }[] =
    [];

  for (const { coords, label, color, markerType, icon } of points) {
    const wptEle = createElement(
      doc.documentElement,
      'wpt',
      undefined,
      toLatLon(coords),
    );

    if (label) {
      createElement(wptEle, 'name', label);
    }

    // `<sym>` carries the icon for Garmin / BaseCamp / MapSource and many
    // mobile consumers. Falls back to the icon-spec's literal text/poi/fa
    // name when no curated Garmin sym maps cleanly — those still round-trip
    // via the freemap extensions below.
    const sym = iconSpecToGarminSym(icon) ?? iconToBareSym(icon);

    if (sym) {
      createElement(wptEle, 'sym', sym);
    }

    const extEle = createElement(wptEle, 'extensions');

    // Lossless round-trip metadata for our own importer.
    if (markerType) {
      appendNs(extEle, FM_NS, 'fm:markerType', markerType);
    }

    if (icon) {
      appendNs(extEle, FM_NS, 'fm:icon', icon);
    }

    if (color) {
      appendNs(extEle, FM_NS, 'fm:color', color);
    }

    // OsmAnd extensions: icon name from the OsmAnd catalog, background
    // shape derived from our markerType, and the colour. OsmAnd shows the
    // marker natively rather than relying on the embedded Locus raster.
    const osmandIcon = iconSpecToOsmAndIcon(icon);

    if (osmandIcon) {
      appendNs(extEle, OSMAND_NS, 'osmand:icon', osmandIcon);
    }

    const osmandBg = markerTypeToOsmAndBackground(markerType);

    if (osmandBg) {
      appendNs(extEle, OSMAND_NS, 'osmand:background', osmandBg);
    }

    if (color) {
      appendNs(extEle, OSMAND_NS, 'osmand:color', color);
    }

    // Locus reads `<locus:icon>` as a data URL. We build an SVG that mirrors
    // RichMarker (shape + inner white inset + glyph), rasterized to PNG, so
    // users see the same icon on the device. Dedupe identical markers so each
    // distinct one is built and rasterized only once.
    const effColor = color || COLORS.normal;

    const key = `${markerType ?? ''}|${effColor}|${label ?? ''}|${icon ?? ''}`;

    let locusIcon = locusIconCache.get(key);

    if (!locusIcon) {
      locusIcon = buildLocusIconDataUrl({
        markerType,
        color: effColor,
        label,
        icon,
        faCache,
        poiDataUrlCache,
      });

      locusIconCache.set(key, locusIcon);
    }

    pending.push({ extEle, locusIcon });
  }

  const locusIcons = await Promise.all(pending.map((p) => p.locusIcon));

  locusIcons.forEach((locusIcon, i) => {
    if (locusIcon) {
      createElement(pending[i].extEle, [LOCUS_NS, 'locus:icon'], locusIcon);
    }
  });
}

function appendNs(
  parent: Element,
  ns: string,
  qname: string,
  value: string,
): void {
  const el = parent.ownerDocument.createElementNS(ns, qname);

  el.textContent = value;

  parent.appendChild(el);
}

// Returns a `<sym>`-suitable string when the icon spec has no curated Garmin
// counterpart: poi/fa names are stripped of their prefix; literal text is
// passed through. Some consumers may still display it as text — better than
// no symbol info at all.
function iconToBareSym(icon: string | undefined): string | undefined {
  const spec = parseIconSpec(icon);

  if (!spec) {
    return undefined;
  }

  return spec.kind === 'text' ? spec.text : spec.name;
}

// Builds a self-contained marker matching RichMarker (shape + white inset +
// glyph), rasterizes it to a `data:image/png;base64,...` URL (Locus only
// renders raster icons in `<locus:icon>`), and falls back to the SVG data URL
// when no canvas is available.
async function buildLocusIconDataUrl({
  markerType,
  color,
  label,
  icon,
  faCache,
  poiDataUrlCache,
}: {
  markerType: DrawingPointsState['points'][number]['markerType'];
  color: string;
  label?: string;
  icon?: string;
  faCache: Map<string, IconDefinition | undefined>;
  poiDataUrlCache: Map<string, Promise<string | undefined>>;
}): Promise<string | undefined> {
  const spec = parseIconSpec(icon);

  // Text shown inside the inset: either the explicit text-icon spec, or the
  // first ≤2 chars of `label` for unicon-less markers (matches the in-app
  // behaviour where short labels render as a glyph).
  const text =
    spec?.kind === 'text'
      ? spec.text
      : !spec && label && [...label].length <= 2
        ? label
        : undefined;

  let faSvg: { width: number; height: number; path: string } | undefined;

  if (spec?.kind === 'fa') {
    let def = faCache.get(spec.name);

    if (!faCache.has(spec.name)) {
      const all = await loadAllIcons();
      def = all.find((d) => d.iconName === spec.name);
      faCache.set(spec.name, def);
    }

    if (def) {
      faSvg = faIconToSvg(def);
    }
  }

  let poiDataUrl: string | undefined;

  if (spec?.kind === 'poi') {
    const url = poiIconNameToUrl[spec.name];

    if (url) {
      let p = poiDataUrlCache.get(url);

      if (!p) {
        p = fetchSvgAsDataUrl(url);
        poiDataUrlCache.set(url, p);
      }

      poiDataUrl = await p;
    }
  }

  const hasContent = Boolean(text || faSvg || poiDataUrl);

  const { svg, width, height } = buildMarkerSvg({
    markerType,
    color,
    hasContent,
    text,
    faSvg,
    poiDataUrl,
  });

  // Base64-encode via UTF-8-safe path so non-ASCII labels survive btoa.
  const svgDataUrl = `data:image/svg+xml;base64,${utf8ToBase64(svg)}`;

  return (await svgToPngDataUrl(svgDataUrl, width, height)) ?? svgDataUrl;
}

// UTF-8-safe base64 so non-ASCII content survives btoa.
function utf8ToBase64(s: string): string {
  return typeof btoa === 'function'
    ? btoa(
        Array.from(new TextEncoder().encode(s), (b) =>
          String.fromCharCode(b),
        ).join(''),
      )
    : '';
}

// Rasterizes an SVG (given as a data URL with intrinsic width/height) to a
// `data:image/png` URL via an offscreen canvas, scaled so its longest side is
// RASTER_MAX. Returns undefined when no canvas/Image is available or
// rendering/encoding fails.
async function svgToPngDataUrl(
  svgDataUrl: string,
  width: number,
  height: number,
): Promise<string | undefined> {
  if (typeof document === 'undefined' || typeof Image === 'undefined') {
    return undefined;
  }

  const RASTER_MAX = 128; // px, longest side of the output PNG

  const scale = RASTER_MAX / Math.max(width, height);

  const w = Math.round(width * scale);
  const h = Math.round(height * scale);

  const img = new Image();

  const loaded = new Promise<boolean>((resolve) => {
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
  });

  img.src = svgDataUrl;

  if (!(await loaded)) {
    return undefined;
  }

  const canvas = document.createElement('canvas');

  canvas.width = w;

  canvas.height = h;

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return undefined;
  }

  ctx.drawImage(img, 0, 0, w, h);

  try {
    return canvas.toDataURL('image/png');
  } catch {
    return undefined;
  }
}

async function fetchSvgAsDataUrl(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url);

    if (!res.ok) {
      return undefined;
    }

    const text = await res.text();

    return `data:image/svg+xml;base64,${utf8ToBase64(text)}`;
  } catch {
    return undefined;
  }
}

// Mirrors the geometry and viewBox of RichMarker so the exported icon
// matches the in-app marker. Glyph color is GLYPH_COLOR from RichMarker
// (Bootstrap gray-700) — kept literal here so we don't need a runtime CSS
// variable lookup in the export pipeline.
const GLYPH_COLOR_LITERAL = '#495057';

function buildMarkerSvg({
  markerType,
  color,
  hasContent,
  text,
  faSvg,
  poiDataUrl,
}: {
  markerType: DrawingPointsState['points'][number]['markerType'];
  color: string;
  hasContent: boolean;
  text?: string;
  faSvg?: { width: number; height: number; path: string };
  poiDataUrl?: string;
}): { svg: string; width: number; height: number } {
  const GLYPH = 150;

  const renderGlyph = (cx: number, cy: number): string => {
    if (text) {
      return (
        `<text x="${cx}" y="${cy}" text-anchor="middle" ` +
        `dominant-baseline="central" fill="${GLYPH_COLOR_LITERAL}" ` +
        `font-size="150" font-weight="bold" font-family="Sans-Serif" ` +
        `style="white-space:pre">${escapeXml(text)}</text>`
      );
    }

    if (faSvg) {
      const scale = GLYPH / Math.max(faSvg.width, faSvg.height);
      const tx = cx - (faSvg.width * scale) / 2;
      const ty = cy - (faSvg.height * scale) / 2;

      return (
        `<path d="${escapeXml(faSvg.path)}" fill="${GLYPH_COLOR_LITERAL}" ` +
        `transform="translate(${tx} ${ty}) scale(${scale})"/>`
      );
    }

    if (poiDataUrl) {
      return (
        `<image x="${cx - GLYPH / 2}" y="${cy - GLYPH / 2}" ` +
        `width="${GLYPH}" height="${GLYPH}" href="${poiDataUrl}"/>`
      );
    }

    return '';
  };

  if (markerType === 'ring') {
    return {
      svg:
        `<svg xmlns="http://www.w3.org/2000/svg" width="310" height="310" viewBox="0 0 310 310">` +
        `<ellipse cx="155" cy="155" rx="135" ry="135" fill="${color}" ` +
        `stroke="${color}" stroke-width="10" stroke-opacity="0.5"/>` +
        (hasContent
          ? `<ellipse cx="155" cy="155" rx="110" ry="110" fill="#fff"/>`
          : '') +
        renderGlyph(155, 155) +
        `</svg>`,
      width: 310,
      height: 310,
    };
  }

  if (markerType === 'square') {
    return {
      svg:
        `<svg xmlns="http://www.w3.org/2000/svg" width="310" height="310" viewBox="0 0 310 310">` +
        `<rect x="30" y="30" width="240" height="240" rx="20" ry="20" ` +
        `fill="${color}" stroke="${color}" stroke-width="10" ` +
        `stroke-opacity="0.6"/>` +
        (hasContent
          ? `<rect x="50" y="50" width="200" height="200" rx="20" ry="20" ` +
            `fill="#fff"/>`
          : '') +
        renderGlyph(150, 150) +
        `</svg>`,
      width: 310,
      height: 310,
    };
  }

  // pin (default)
  return {
    svg:
      `<svg xmlns="http://www.w3.org/2000/svg" width="310" height="512" viewBox="0 0 310 512">` +
      `<path d="M 156.063 11.734 C 74.589 11.734 8.53 79.093 8.53 162.204 ` +
      `C 8.53 185.48 13.716 207.552 22.981 227.212 C 23.5 228.329 156.063 ` +
      `493.239 156.063 493.239 L 287.546 230.504 C 297.804 210.02 303.596 ` +
      `186.803 303.596 162.204 C 303.596 79.093 237.551 11.734 156.063 ` +
      `11.734 Z" fill="${color}" stroke="#fff" stroke-width="10" ` +
      `stroke-opacity="0.5"/>` +
      (hasContent
        ? `<ellipse cx="154.12" cy="163.702" rx="119.462" ry="119.462" ` +
          `fill="#fff"/>`
        : '') +
      renderGlyph(154, 164) +
      `</svg>`,
    width: 310,
    height: 512,
  };
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function addObjects(doc: Document, { objects }: ObjectsState) {
  for (const { coords, tags } of objects) {
    const wptEle = createElement(
      doc.documentElement,
      'wpt',
      undefined,
      toLatLon(coords),
    );

    if (!Number.isNaN(parseFloat(tags['ele']))) {
      createElement(wptEle, 'ele', tags['ele']);
    }

    if (tags['name']) {
      createElement(wptEle, 'name', tags['name']);
    }
  }
}

function addPlannedRoute(
  doc: Document,
  { alternatives, points, finishOnly }: RoutePlannerState,
  withStops: boolean,
) {
  // TODO add itinerar details and metadata
  // TODO add option to only export selected alternative

  if (withStops) {
    points.forEach((point, i: number) => {
      const midpointWptEle = createElement(
        doc.documentElement,
        'wpt',
        undefined,
        toLatLon(point),
      );

      createElement(
        midpointWptEle,
        'name',
        i === 0 && !finishOnly
          ? window.translations?.routePlanner.start
          : i === points.length - 1
            ? window.translations?.routePlanner.finish // TODO not for roundtrip?
            : window.translations?.routePlanner.stop + ' ' + (i + 1),
      );
    });
  }

  alternatives.forEach(({ legs }, i: number) => {
    const trkEle = createElement(doc.documentElement, 'trk');

    createElement(
      trkEle,
      'name',
      window.translations?.routePlanner.alternative + ' ' + (i + 1),
    );

    const trksegEle = createElement(trkEle, 'trkseg');

    for (const leg of legs) {
      for (const step of leg.steps) {
        for (const [lon, lat] of step.geometry.coordinates) {
          createElement(trksegEle, 'trkpt', undefined, toLatLon({ lat, lon }));
        }
      }
    }
  });
}

function toLatLon(latLon: LatLon) {
  return {
    lat: latLon.lat.toString(),
    lon: latLon.lon.toString(),
  };
}

function toLocusAlpha(opacity: number): string {
  return Math.round(Math.max(0, Math.min(1, opacity)) * 255)
    .toString(16)
    .padStart(2, '0');
}

function addTracking(doc: Document, { tracks, trackedDevices }: TrackingState) {
  const tdMap = new Map(trackedDevices.map((td) => [td.token, td]));

  const tracks1 = tracks.map((track) => ({
    ...track,
    ...(tdMap.get(track.token) || {}),
  }));

  for (const track of tracks1) {
    const trkEle = createElement(doc.documentElement, 'trk');

    if (track.label) {
      createElement(trkEle, 'name', track.label);
    }

    const trksegEle = createElement(trkEle, 'trkseg');

    for (const {
      ts,
      lat,
      lon,
      altitude,
      speed,
      accuracy,
      bearing,
      battery,
      gsmSignal,
      message,
    } of track.trackPoints) {
      const ptEle = createElement(
        trksegEle,
        'trkpt',
        undefined,
        toLatLon({ lat, lon }),
      );

      if (typeof altitude === 'number') {
        createElement(ptEle, 'ele', altitude.toString());
      }

      createElement(ptEle, 'time', ts.toISOString());

      if (typeof bearing === 'number') {
        createElement(ptEle, 'magvar', bearing.toString()); // maybe not the most suitable tag
      }

      if (typeof accuracy === 'number') {
        createElement(ptEle, 'hdop', accuracy.toString());
      }

      if (message) {
        createElement(ptEle, 'desc', message);
      }

      if (
        typeof speed === 'number' ||
        typeof battery === 'number' ||
        typeof gsmSignal === 'number'
      ) {
        const extEl = createElement(ptEle, 'extensions');

        if (typeof speed === 'number') {
          const elem = document.createElementNS(FM_NS, 'speed');

          elem.textContent = speed.toString();

          extEl.appendChild(elem);
        }

        if (typeof battery === 'number') {
          const elem = document.createElementNS(FM_NS, 'battery');

          elem.textContent = battery.toString();

          extEl.appendChild(elem);
        }

        if (typeof gsmSignal === 'number') {
          const elem = document.createElementNS(FM_NS, 'gsm_signal');

          elem.textContent = gsmSignal.toString();

          extEl.appendChild(elem);
        }
      }
    }
  }
}

function addGpx(doc: Document, { trackGpx, trackGeojson }: TrackViewerState) {
  if (trackGpx) {
    const domParser = new DOMParser();

    const gpxDoc: XMLDocument = domParser.parseFromString(trackGpx, 'text/xml');

    const r = getSupportedGpxElements(gpxDoc);

    const nodes: Node[] = [];

    let curr: Node | null;

    while ((curr = r.iterateNext())) {
      nodes.push(curr);
    }

    for (const node of nodes) {
      doc.documentElement.appendChild(node);
    }
  } else if (trackGeojson) {
    addGeojson(doc, trackGeojson);
  }
}

function getSupportedGpxElements(doc: Document) {
  return doc.evaluate(
    '/gpx:gpx/gpx:wpt | /gpx:gpx/gpx:rte | /gpx:gpx/gpx:trk',
    doc,
    (prefix) => (prefix === 'gpx' ? GPX_NS : null), // TODO add support also for 1.0
    XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
    null,
  );
}

function addGeojson(doc: Document, geojson: Feature | FeatureCollection) {
  for (const pass of ['wpt', 'trk'] as const) {
    for (const feature of geojson.type === 'FeatureCollection'
      ? geojson.features
      : [geojson]) {
      const g = feature.geometry;

      switch (g.type) {
        case 'Point':
          if (pass === 'wpt') {
            const wptEle = createElement(
              doc.documentElement,
              'wpt',
              undefined,
              toLatLon({
                lat: g.coordinates[1],
                lon: g.coordinates[0],
              }),
            );

            if (feature.properties?.['ele']) {
              createElement(wptEle, 'ele', feature.properties['ele']);
            }

            if (feature.properties?.['name']) {
              createElement(wptEle, 'name', feature.properties['name']);
            }
          }

          break;

        case 'MultiPoint': {
          if (pass === 'wpt') {
            for (const pt of g.coordinates) {
              const wptEle = createElement(
                doc.documentElement,
                'wpt',
                undefined,
                toLatLon({
                  lat: pt[1],
                  lon: pt[0],
                }),
              );

              if (feature.properties?.['ele']) {
                createElement(wptEle, 'ele', feature.properties['ele']);
              }

              if (feature.properties?.['name']) {
                createElement(wptEle, 'name', feature.properties['name']);
              }
            }
          }

          break;
        }

        case 'LineString': {
          if (pass === 'trk') {
            const trkEle = createElement(doc.documentElement, 'trk');

            if (feature.properties?.['name']) {
              createElement(trkEle, 'name', feature.properties['name']);
            }

            const trksegEle = createElement(trkEle, 'trkseg');

            for (const pt of g.coordinates) {
              createElement(
                trksegEle,
                'trkpt',
                undefined,
                toLatLon({ lat: pt[1], lon: pt[0] }),
              );
            }
          }

          break;
        }

        case 'Polygon':

        // eslint-disable-next-line no-fallthrough
        case 'MultiLineString':
          if (pass === 'trk') {
            const trkEle = createElement(doc.documentElement, 'trk');

            if (feature.properties?.['name']) {
              createElement(trkEle, 'name', feature.properties['name']);
            }

            for (const seg of g.coordinates) {
              const trksegEle = createElement(trkEle, 'trkseg');

              for (const pt of seg) {
                createElement(
                  trksegEle,
                  'trkpt',
                  undefined,
                  toLatLon({ lat: pt[1], lon: pt[0] }),
                );
              }
            }
          }

          break;

        case 'MultiPolygon':
          if (pass === 'trk') {
            const trkEle = createElement(doc.documentElement, 'trk');

            if (feature.properties?.['name']) {
              createElement(trkEle, 'name', feature.properties['name']);
            }

            for (const seg0 of g.coordinates) {
              for (const seg of seg0) {
                const trksegEle = createElement(trkEle, 'trkseg');

                for (const pt of seg) {
                  createElement(
                    trksegEle,
                    'trkpt',
                    undefined,
                    toLatLon({ lat: pt[1], lon: pt[0] }),
                  );
                }
              }
            }
          }

          break;
      }
    }
  }
}
