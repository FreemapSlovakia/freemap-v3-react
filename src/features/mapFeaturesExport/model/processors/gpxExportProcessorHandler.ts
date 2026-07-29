import type { Selection } from '@app/store/actions.js';
import { setActiveModal } from '@app/store/actions.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import type {
  DrawingLineType,
  Line,
} from '@features/drawing/model/actions/drawingLineActions.js';
import type { DrawingLinesState } from '@features/drawing/model/reducers/drawingLinesReducer.js';
import type { DrawingPointsState } from '@features/drawing/model/reducers/drawingPointsReducer.js';
import type { GalleryMessages } from '@features/gallery/translations/GalleryMessages.js';
import { loadGalleryMessages } from '@features/gallery/translations/loadGalleryMessages.js';
import type { ObjectsState } from '@features/objects/model/reducer.js';
import {
  ISOCHRONE_FILL_OPACITY,
  isochroneColor,
  isochroneLabel,
} from '@features/routePlanner/model/isochrones.js';
import type { RoutePlannerState } from '@features/routePlanner/model/reducer.js';
import {
  dominantStepMode,
  INACTIVE_ALTERNATIVE_COLOR,
  STEP_MODE_COLORS,
  stepModeDashArray,
  stopNumber,
  WAYPOINT_COLORS,
  waypointKind,
} from '@features/routePlanner/model/routeColors.js';
import type { RoutePlannerSettingsState } from '@features/routePlanner/model/settingsReducer.js';
import { loadRoutePlannerMessages } from '@features/routePlanner/translations/loadRoutePlannerMessages.js';
import type { RoutePlannerMessages } from '@features/routePlanner/translations/RoutePlannerMessages.js';
import type { TrackingState } from '@features/tracking/model/reducer.js';
import type { TrackViewerState } from '@features/trackViewer/model/reducer.js';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { joinColorAlpha, splitColorAlpha } from '@shared/colorAlpha.js';
import { COLORS } from '@shared/colors.js';
import { parseIconSpec } from '@shared/drawingIcons.js';
import { fetchElevations } from '@shared/elevation.js';
import {
  buildMarkerSvg,
  resolveMarkerGlyph,
  svgToPngDataUrl,
  utf8ToBase64,
} from '@shared/markerSvg.js';
import { escapeHtml } from '@shared/stringUtils.js';
import { iconSpecToGarminSym } from '../../garminSymMapping.js';
import {
  iconSpecToOsmAndIcon,
  markerTypeToOsmAndBackground,
} from '../../osmandIconMapping.js';
import type { exportMapFeatures } from '../actions.js';
import {
  keepDrawingLine,
  keepDrawingPoint,
  keepObject,
  selectedTrackToken,
} from '../selectionFilter.js';
import {
  fetchPictures,
  type Picture,
  pictureExportUrls,
} from './fetchPictures.js';
import { exportElevationCancelActions } from './fillElevations.js';
import {
  addAttribute,
  createElement,
  FM_NS,
  GARMIN_NS,
  GPX_NS,
  GPX_STYLE_NS,
  GPXTPX_NS,
  LOCUS_NS,
  OSMAND_NS,
  toLatLon,
  XMLNS_NS,
} from './gpxExporter.js';
import { addGeojson } from './gpxFromGeojson.js';
import { exportBlob, upload } from './upload.js';

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

  doc.documentElement.setAttributeNS(XMLNS_NS, 'xmlns:gpxtpx', GPXTPX_NS);

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
    routePlannerSettings,
    tracking,
    trackViewer,
    search,
    l10n: { language },
  } = getState();

  const set = new Set(action.payload.exportables);

  const { only } = action.payload;

  if (set.has('pictures')) {
    addPictures(
      doc,
      await fetchPictures(getState),
      language,
      await loadGalleryMessages(language),
    );
  }

  if (set.has('drawingLines')) {
    addDrawingLines(doc, drawingLines, 'line', only);
  }

  if (set.has('drawingAreas')) {
    addDrawingLines(doc, drawingLines, 'polygon', only);
  }

  if (set.has('drawingPoints')) {
    await addDrawingPoints(doc, drawingPoints, only);
  }

  if (set.has('objects')) {
    addObjects(doc, objects, only);
  }

  if (set.has('plannedRoute')) {
    addPlannedRoute(
      doc,
      routePlanner,
      routePlannerSettings,
      await loadRoutePlannerMessages(language),
      language,
    );
  }

  if (set.has('tracking')) {
    addTracking(doc, tracking, selectedTrackToken(only));
  }

  if (set.has('import')) {
    addImportedTrack(doc, trackViewer);
  }

  if (set.has('search')) {
    const geojson = search.selectedResult?.geojson;

    if (geojson) {
      addGeojson(doc, geojson);
    }
  }

  const { elevation } = action.payload;

  if (elevation === 'missing' || elevation === 'all') {
    await fillGpxElevations(doc, elevation, getState);
  }

  // order nodes

  const r = getSupportedGpxElements(doc);

  const q: Record<string, Node[]> = {
    wpt: [],
    rte: [],
    trk: [],
  };

  while (true) {
    const curr = r.iterateNext();

    if (!curr) {
      break;
    }

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
      exportBlob(
        [new XMLSerializer().serializeToString(doc)],
        'application/gpx+xml',
        target,
      ),
      target,
      getState,
      dispatch,
    )
  ) {
    dispatch(setActiveModal(null));
  }
};

export default handle;

// Fills `<ele>` into `<wpt>`/`<trkpt>`/`<rtept>` elements via the elevation
// API. `missing` adds it only where absent; `all` also overwrites existing
// values. Points inside polygon tracks (drawing areas, tagged `fm:type=polygon`)
// are skipped — elevation has no meaning for an area outline. A new `<ele>` is
// inserted as the first child to satisfy the GPX schema element order.
async function fillGpxElevations(
  doc: Document,
  mode: 'missing' | 'all',
  getState: () => RootState,
): Promise<void> {
  const polygonTrks = new Set<Element>();

  for (const trk of Array.from(doc.getElementsByTagNameNS(GPX_NS, 'trk'))) {
    for (const type of Array.from(trk.getElementsByTagNameNS(FM_NS, 'type'))) {
      if (type.textContent === 'polygon') {
        polygonTrks.add(trk);
      }
    }
  }

  const eleOf = (el: Element) =>
    Array.from(el.children).find(
      (child) => child.namespaceURI === GPX_NS && child.localName === 'ele',
    );

  const inPolygonTrk = (el: Element) => {
    for (let p: Element | null = el; p; p = p.parentElement) {
      if (p.namespaceURI === GPX_NS && p.localName === 'trk') {
        return polygonTrks.has(p);
      }
    }

    return false;
  };

  const candidates: { el: Element; existing: Element | undefined }[] = [];

  for (const tag of ['wpt', 'trkpt', 'rtept']) {
    for (const el of Array.from(doc.getElementsByTagNameNS(GPX_NS, tag))) {
      if (tag === 'trkpt' && inPolygonTrk(el)) {
        continue;
      }

      const existing = eleOf(el);

      if (mode === 'all' || !existing) {
        candidates.push({ el, existing });
      }
    }
  }

  const eles = await fetchElevations(
    candidates.map(({ el }) => [
      Number(el.getAttribute('lat')),
      Number(el.getAttribute('lon')),
    ]),
    getState,
    exportElevationCancelActions,
  );

  candidates.forEach(({ el, existing }, i) => {
    const ele = eles[i];

    if (ele == null) {
      return;
    }

    if (existing) {
      existing.textContent = String(ele);
    } else {
      const eleEl = doc.createElementNS(GPX_NS, 'ele');

      eleEl.textContent = String(ele);

      el.insertBefore(eleEl, el.firstChild);
    }
  });
}

function addPictures(
  doc: Document,
  pictures: Picture[],
  lang: string,
  gm: GalleryMessages,
) {
  for (const picture of pictures) {
    const {
      lat,
      lon,
      takenAt,
      createdAt,
      title,
      description,
      tags,
      rating,
      user,
      license,
      azimuth,
    } = picture;

    const links = pictureExportUrls(picture);

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

    const lines: [string, string][] = [];

    if (user) {
      lines.push([gm?.filterModal.author ?? 'Author', user]);
    }

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

    if (license) {
      lines.push([gm?.license.label ?? 'License', license]);
    }

    if (azimuth != null) {
      lines.push([gm?.editForm.azimuth ?? 'Azimuth', `${azimuth}°`]);
    }

    createElement(wptEle, 'desc', {
      cdata:
        (links.imageUrl
          ? `<img src="${escapeHtml(links.imageUrl)}" width="100%">`
          : '') +
        '<p>' +
        lines
          .map(
            ([key, value]) => `<b>${escapeHtml(key)}</b>: ${escapeHtml(value)}`,
          )
          .join('｜') +
        '</p>',
    });

    const link1 = createElement(wptEle, 'link', undefined, {
      href: links.webUrl,
    });

    createElement(link1, 'text', gm?.linkToWww ?? 'photo at www.freemap.sk');

    createElement(link1, 'type', 'text/html');

    if (links.wikimedia) {
      const link2 = createElement(wptEle, 'link', undefined, {
        href: links.commonsUrl,
      });

      createElement(
        link2,
        'text',
        gm?.linkToCommons ?? 'photo at Wikimedia Commons',
      );

      createElement(link2, 'type', 'text/html');
    } else {
      const link2 = createElement(wptEle, 'link', undefined, {
        href: links.imageUrl,
      });

      createElement(link2, 'text', gm?.linkToImage ?? 'photo image file');

      createElement(link2, 'type', 'image/jpeg');
    }

    // TODO add comments to cmt?
  }
}

function addDrawingLines(
  doc: Document,
  { lines }: DrawingLinesState,
  type: DrawingLineType,
  only: Selection | undefined,
) {
  for (const [index, line] of lines.entries()) {
    if (line.type !== type || !keepDrawingLine(only, index)) {
      continue;
    }

    addStyledTrk(doc, line);
  }
}

// Writes one line/polygon as a `<trk>` carrying its full styling: gpx_style for
// generic consumers, Locus and OsmAnd extensions for those apps, and the
// freemap-private `fm:*` shadows for a lossless round-trip through our own
// importer. A polygon's ring is closed here, since drawing polygons are stored
// open.
function addStyledTrk(doc: Document, line: Line) {
  const trkEle = createElement(doc.documentElement, 'trk');

  if (line.label) {
    createElement(trkEle, 'name', line.label);
  }

  writeTrkStyle(trkEle, line);

  const trksegEle = createElement(trkEle, 'trkseg');

  const points =
    line.type === 'line' ? line.points : [...line.points, line.points[0]];

  for (const { lat, lon } of points) {
    createElement(trksegEle, 'trkpt', undefined, toLatLon({ lat, lon }));
  }
}

// Writes a track's `<extensions>` styling block. Split out of
// {@link addStyledTrk} so the planned route can carry the same styling while
// writing its own trackpoints (which additionally hold elevation).
function writeTrkStyle(trkEle: Element, line: Omit<Line, 'points'>) {
  const type = line.type;

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

  createElement(lineStyleEle, [GPX_STYLE_NS, 'width'], String(line.width || 4));

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
    `#${toLocusAlpha(stroke.opacity)}${rgb}`,
  );

  createElement(ext2Ele, [LOCUS_NS, 'locus:lsWidth'], String(line.width ?? 4));

  createElement(ext2Ele, [LOCUS_NS, 'locus:lsUnits'], 'PIXELS');

  if (type === 'polygon') {
    createElement(
      ext2Ele,
      [LOCUS_NS, 'locus:lsColorFill'],
      `#${toLocusAlpha(fill.opacity)}${fillRgb}`,
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
}

async function addDrawingPoints(
  doc: Document,
  { points }: DrawingPointsState,
  only: Selection | undefined,
) {
  // Caches shared across all points in this export, so a thousand identical
  // poi/fa icons resolve once, and identical markers rasterize to PNG once.
  const faCache = new Map<string, IconDefinition | undefined>();
  const poiSvgCache = new Map<string, Promise<string | undefined>>();
  const locusIconCache = new Map<string, Promise<string | undefined>>();

  // Build the synchronous parts (and kick off the async Locus-icon work) in
  // order, then await all icons in parallel and attach them.
  const pending: { extEle: Element; locusIcon: Promise<string | undefined> }[] =
    [];

  for (const [
    index,
    { coords, label, color, markerType, icon },
  ] of points.entries()) {
    if (!keepDrawingPoint(only, index)) {
      continue;
    }

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
        poiSvgCache,
      });

      locusIconCache.set(key, locusIcon);
    }

    pending.push({ extEle, locusIcon });
  }

  const locusIcons = await Promise.all(pending.map((p) => p.locusIcon));

  for (const [i, locusIcon] of locusIcons.entries()) {
    if (locusIcon) {
      createElement(pending[i].extEle, [LOCUS_NS, 'locus:icon'], locusIcon);
    }
  }
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
  poiSvgCache,
}: {
  markerType: DrawingPointsState['points'][number]['markerType'];
  color: string;
  label?: string;
  icon?: string;
  faCache: Map<string, IconDefinition | undefined>;
  poiSvgCache: Map<string, Promise<string | undefined>>;
}): Promise<string | undefined> {
  const { text, faSvg, poiSvg, poiBBox, hasContent } = await resolveMarkerGlyph(
    {
      icon,
      label,
      faCache,
      poiSvgCache,
    },
  );

  const { svg, width, height } = buildMarkerSvg({
    markerType,
    color,
    hasContent,
    text,
    faSvg,
    poiSvg,
    poiBBox,
  });

  // Base64-encode via UTF-8-safe path so non-ASCII labels survive btoa.
  const svgDataUrl = `data:image/svg+xml;base64,${utf8ToBase64(svg)}`;

  return (await svgToPngDataUrl(svgDataUrl, width, height)) ?? svgDataUrl;
}

function addObjects(
  doc: Document,
  { objects }: ObjectsState,
  only: Selection | undefined,
) {
  for (const { id, coords, tags } of objects) {
    if (!keepObject(only, id)) {
      continue;
    }

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
  {
    alternatives,
    activeAlternativeIndex,
    isochrones,
    points,
    waypoints,
    finishOnly,
    mode,
  }: RoutePlannerState,
  { lineWidth, lineOpacity, markerOpacity }: RoutePlannerSettingsState,
  rpm: RoutePlannerMessages,
  language: string,
) {
  // TODO add itinerar details and metadata
  // TODO add option to only export selected alternative

  // The start/finish/stop markers are part of what the route puts on the map,
  // so they always come along.
  for (const [i, point] of points.entries()) {
    const midpointWptEle = createElement(
      doc.documentElement,
      'wpt',
      undefined,
      toLatLon(point),
    );

    const kind = waypointKind(i, points.length, finishOnly, mode);

    createElement(
      midpointWptEle,
      'name',
      kind === 'start'
        ? rpm.start
        : kind === 'finish'
          ? rpm.finish
          : `${rpm.stop} ${stopNumber(i, mode, waypoints) ?? i}`,
    );

    const extEle = createElement(midpointWptEle, 'extensions');

    const color = joinColorAlpha(WAYPOINT_COLORS[kind], markerOpacity);

    appendNs(extEle, FM_NS, 'fm:color', color);

    appendNs(extEle, OSMAND_NS, 'osmand:color', WAYPOINT_COLORS[kind]);
  }

  // Isochrones replace the route alternatives, so they are what the route
  // source exports when present. GPX has no polygon type, so each ring goes out
  // as a styled closed track — the same representation a drawing polygon uses,
  // which our importer reads back as a polygon.
  if (isochrones?.length) {
    for (const isochrone of isochrones) {
      const bucket = isochrone.properties?.['bucket'] ?? 0;

      const color = isochroneColor(bucket, isochrones.length);

      for (const ring of isochrone.geometry.coordinates) {
        addStyledTrk(doc, {
          type: 'polygon',
          label: isochroneLabel(isochrone, bucket, rpm.isochroneRing, language),
          color: joinColorAlpha(color, lineOpacity),
          width: lineWidth,
          // Only the outermost ring is filled, as on the map, which fades the
          // whole ring group — so the fill takes `lineOpacity` on top of its own.
          fillColor: joinColorAlpha(
            color,
            bucket === isochrones.length - 1
              ? ISOCHRONE_FILL_OPACITY * lineOpacity
              : 0,
          ),
          // The ring arrives closed; `addStyledTrk` closes polygons itself.
          points: ring.slice(0, -1).map(([lon, lat], id) => ({ lat, lon, id })),
        });
      }
    }

    return;
  }

  for (const [i, alternative] of alternatives.entries()) {
    const dominant = dominantStepMode(alternative);

    const trkEle = createElement(doc.documentElement, 'trk');

    createElement(trkEle, 'name', `${rpm.alternative} ${i + 1}`);

    // A GPX track is one line, so a multimodal route takes its dominant mode's
    // color; alternatives the user isn't following are dimmed, as on the map.
    writeTrkStyle(trkEle, {
      type: 'line',
      // The alpha becomes the gpx_style/Locus opacity in `writeTrkStyle`.
      color: joinColorAlpha(
        i === activeAlternativeIndex
          ? STEP_MODE_COLORS[dominant]
          : INACTIVE_ALTERNATIVE_COLOR,
        lineOpacity,
      ),
      width: lineWidth,
      dashArray: stepModeDashArray(dominant),
    });

    const trksegEle = createElement(trkEle, 'trkseg');

    for (const leg of alternative.legs) {
      for (const step of leg.steps) {
        for (const [lon, lat, ele] of step.geometry.coordinates) {
          const trkptEle = createElement(
            trksegEle,
            'trkpt',
            undefined,
            toLatLon({ lat, lon }),
          );

          if (ele !== undefined) {
            createElement(trkptEle, 'ele', ele.toString());
          }
        }
      }
    }
  }
}

function toLocusAlpha(opacity: number): string {
  return Math.round(Math.max(0, Math.min(1, opacity)) * 255)
    .toString(16)
    .padStart(2, '0');
}

function addTracking(
  doc: Document,
  { tracks, trackedDevices }: TrackingState,
  onlyToken: string | null,
) {
  const tdMap = new Map(trackedDevices.map((td) => [td.token, td]));

  const tracks1 = tracks.map((track) => ({
    ...track,
    ...(tdMap.get(track.token) ?? {}),
  }));

  for (const track of tracks1) {
    if (onlyToken !== null && String(track.token) !== onlyToken) {
      continue;
    }

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

function addImportedTrack(doc: Document, { trackGeojson }: TrackViewerState) {
  if (trackGeojson) {
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
