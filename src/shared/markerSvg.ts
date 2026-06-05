import type { MarkerType } from '@features/objects/model/actions.js';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { type PoiIconBBox, poiIconBBoxes } from '@osm/poiIconBBoxes.js';
import { splitColorAlpha } from '@shared/colorAlpha.js';
import {
  faIconToSvg,
  loadAllIcons,
  parseIconSpec,
  poiIconNameToUrl,
} from '@shared/drawingIcons.js';
import {
  MARKER_REF_WIDTH,
  MARKER_VIEWBOX_WIDTH,
  poiIconGlyphRect,
} from '@shared/poiIconGlyph.js';

// Glyph color: matches RichMarker's GLYPH_COLOR ('black'), drawn on the white
// inset. Kept literal here so the export pipeline doesn't need a runtime lookup.
const GLYPH_COLOR_LITERAL = 'black';

// Flattened Font Awesome icon geometry, as returned by `faIconToSvg`.
type FaSvg = { width: number; height: number; path: string };

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// UTF-8-safe base64 so non-ASCII content survives btoa.
export function utf8ToBase64(s: string): string {
  return typeof btoa === 'function'
    ? btoa(
        Array.from(new TextEncoder().encode(s), (b) =>
          String.fromCharCode(b),
        ).join(''),
      )
    : '';
}

// Fetches an SVG asset and returns its raw markup, so callers can inline it as
// a nested `<svg>` (true vector) instead of embedding it as an `<image>`.
export async function fetchSvgText(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url);

    if (!res.ok) {
      return undefined;
    }

    return await res.text();
  } catch {
    return undefined;
  }
}

// Strips the XML prolog / DOCTYPE / comments from a standalone SVG and re-tags
// its root `<svg>` as a nested element positioned at (x, y) and sized w×h. The
// element keeps its own `viewBox`, so its vector content scales into the marker
// — no rasterization, unlike an `<image href="data:...">`. `id` attributes are
// dropped so inlining many markers in one document can't produce duplicate ids
// (these icons carry none referenced via `url(#…)`).
export function nestSvg(
  svgText: string,
  x: number,
  y: number,
  w: number,
  h: number,
): string {
  const body = svgText
    .replace(/<\?xml[\s\S]*?\?>/g, '')
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\sid\s*=\s*("[^"]*"|'[^']*')/g, '')
    .trim();

  return body.replace(/<svg\b[^>]*>/, (tag) => {
    const inner = tag.slice(4, -1);

    // The icon's own viewBox maps its coordinate system into the w×h box.
    // Many icons carry no viewBox (just width/height), so synthesize one from
    // those — otherwise the icon's small user units (e.g. 0–8 for peak) would
    // render 1:1 in the box and appear as a tiny speck.
    let viewBox = inner.match(/\sviewBox\s*=\s*("[^"]*"|'[^']*')/)?.[0] ?? '';

    if (!viewBox) {
      const w = inner.match(/\swidth\s*=\s*"([\d.]+)/)?.[1];
      const h = inner.match(/\sheight\s*=\s*"([\d.]+)/)?.[1];

      if (w && h) {
        viewBox = ` viewBox="0 0 ${w} ${h}"`;
      }
    }

    const attrs = inner
      .replace(/\sviewBox\s*=\s*("[^"]*"|'[^']*')/g, '')
      .replace(/\s(?:x|y|width|height)\s*=\s*("[^"]*"|'[^']*')/g, '');

    return `<svg${attrs}${viewBox} x="${x}" y="${y}" width="${w}" height="${h}">`;
  });
}

// Resolves a drawing point's icon spec (+ label fallback) into the concrete
// glyph to embed: literal text, a Font Awesome path, or a poi image data URL.
// The caches are shared across all points of an export so identical icons
// resolve (and poi SVGs are fetched) only once.
export async function resolveMarkerGlyph({
  icon,
  label,
  faCache,
  poiSvgCache,
}: {
  icon?: string;
  label?: string;
  faCache: Map<string, IconDefinition | undefined>;
  poiSvgCache: Map<string, Promise<string | undefined>>;
}): Promise<{
  text?: string;
  faSvg?: FaSvg;
  poiSvg?: string;
  poiBBox?: PoiIconBBox;
  hasContent: boolean;
}> {
  const spec = parseIconSpec(icon);

  // Text shown inside the inset: either the explicit text-icon spec, or the
  // first ≤2 chars of `label` for icon-less markers (matches the in-app
  // behaviour where short labels render as a glyph).
  const text =
    spec?.kind === 'text'
      ? spec.text
      : !spec && label && [...label].length <= 2
        ? label
        : undefined;

  let faSvg: FaSvg | undefined;

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

  let poiSvg: string | undefined;
  let poiBBox: PoiIconBBox | undefined;

  if (spec?.kind === 'poi') {
    const url = poiIconNameToUrl[spec.name];

    if (url) {
      let p = poiSvgCache.get(url);

      if (!p) {
        p = fetchSvgText(url);
        poiSvgCache.set(url, p);
      }

      poiSvg = await p;
      poiBBox = poiIconBBoxes[url];
    }
  }

  return {
    text,
    faSvg,
    poiSvg,
    poiBBox,
    hasContent: Boolean(text || faSvg || poiSvg),
  };
}

// Rasterizes an SVG (given as a data URL with intrinsic width/height) to a
// `data:image/png` URL via an offscreen canvas, scaled so its longest side is
// RASTER_MAX. Returns undefined when no canvas/Image is available or
// rendering/encoding fails.
export async function svgToPngDataUrl(
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

// Mirrors the geometry and viewBox of RichMarker so the exported icon matches
// the in-app marker: the colored shape, the white inset (only when there's a
// glyph), and the centered glyph itself.
//
// `anchorAtCenter` makes the marker's anchor point (the geographic location it
// represents) coincide with the dead center of the viewBox for every shape.
// Ring/square are centered already; the pin's anchor is its bottom tip, so the
// viewBox is padded with transparent space below the tip. This lets a
// shape-agnostic renderer place every marker by simply centering it on the
// coordinate (scaling to a fixed width, since all shapes share width 310).
//
// `displayWidth` is the marker's intended on-screen width in px, baked into the
// root `<svg>`'s width/height so the SVG is self-describing: the renderer draws
// it at its natural size (no separate marker-width knob). Defaults to
// MARKER_REF_WIDTH, the size at which poi glyphs equal the map's natural icons.
export function buildMarkerSvg({
  markerType,
  color,
  hasContent,
  text,
  faSvg,
  poiSvg,
  poiBBox,
  anchorAtCenter = false,
  displayWidth = MARKER_REF_WIDTH,
}: {
  markerType: MarkerType | undefined;
  color: string;
  hasContent: boolean;
  text?: string;
  faSvg?: FaSvg;
  poiSvg?: string;
  poiBBox?: PoiIconBBox;
  anchorAtCenter?: boolean;
  displayWidth?: number;
}): { svg: string; width: number; height: number } {
  // Split any alpha off the color: the solid RGB paints the shape, while the
  // alpha becomes a group `opacity` on the whole <svg> so the entire marker
  // (shape + white inset + glyph) fades uniformly — matching RichMarker.
  const { color: fillColor, opacity } = splitColorAlpha(color);

  const opacityAttr = opacity < 1 ? ` opacity="${opacity}"` : '';

  // viewBox stays in artwork units (width MARKER_VIEWBOX_WIDTH); the px scale
  // maps that to the requested on-screen width so the root <svg> is
  // self-describing (renderer draws it at natural size).
  const pxScale = displayWidth / MARKER_VIEWBOX_WIDTH;

  const GLYPH = 150;

  // poiIcons use RichMarker's GLYPH_SIZE (160) so document exports match the
  // in-app marker; the rest of the glyph kinds keep GLYPH (150).
  const POI_GLYPH_SIZE = 160;

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

    if (poiSvg) {
      // Mirror RichMarker's <image> placement (scale+center by drawing bbox).
      if (poiBBox) {
        const { x, y, width, height } = poiIconGlyphRect(
          poiBBox,
          cx,
          cy,
          POI_GLYPH_SIZE,
        );

        return nestSvg(poiSvg, x, y, width, height);
      }

      // No bbox (icon missing from the table): fall back to filling the box.
      return nestSvg(poiSvg, cx - GLYPH / 2, cy - GLYPH / 2, GLYPH, GLYPH);
    }

    return '';
  };

  if (markerType === 'ring') {
    const pxW = MARKER_VIEWBOX_WIDTH * pxScale;

    return {
      svg:
        `<svg xmlns="http://www.w3.org/2000/svg" width="${pxW}" height="${pxW}" viewBox="0 0 310 310"${opacityAttr}>` +
        `<ellipse cx="155" cy="155" rx="135" ry="135" fill="${fillColor}" ` +
        `stroke="${fillColor}" stroke-width="10" stroke-opacity="0.5"/>` +
        (hasContent
          ? `<ellipse cx="155" cy="155" rx="110" ry="110" fill="#fff"/>`
          : '') +
        renderGlyph(155, 155) +
        `</svg>`,
      width: pxW,
      height: pxW,
    };
  }

  if (markerType === 'square') {
    const pxW = MARKER_VIEWBOX_WIDTH * pxScale;

    return {
      svg:
        `<svg xmlns="http://www.w3.org/2000/svg" width="${pxW}" height="${pxW}" viewBox="0 0 310 310"${opacityAttr}>` +
        `<rect x="30" y="30" width="240" height="240" rx="20" ry="20" ` +
        `fill="${fillColor}" stroke="${fillColor}" stroke-width="10" ` +
        `stroke-opacity="0.6"/>` +
        (hasContent
          ? `<rect x="50" y="50" width="200" height="200" rx="20" ry="20" ` +
            `fill="#fff"/>`
          : '') +
        renderGlyph(150, 150) +
        `</svg>`,
      width: pxW,
      height: pxW,
    };
  }

  // pin (default). The anchor is the tip at (156.06, 493.24). With
  // `anchorAtCenter`, pad the viewBox below the tip so it becomes the vertical
  // center: height = 2 × 493.239, keeping the tip at center (155, 493.239).
  const vbHeight = anchorAtCenter ? 986.478 : 512;

  const pxW = MARKER_VIEWBOX_WIDTH * pxScale;

  const pxH = vbHeight * pxScale;

  return {
    svg:
      `<svg xmlns="http://www.w3.org/2000/svg" width="${pxW}" height="${pxH}" viewBox="0 0 310 ${vbHeight}"${opacityAttr}>` +
      `<path d="M 156.063 11.734 C 74.589 11.734 8.53 79.093 8.53 162.204 ` +
      `C 8.53 185.48 13.716 207.552 22.981 227.212 C 23.5 228.329 156.063 ` +
      `493.239 156.063 493.239 L 287.546 230.504 C 297.804 210.02 303.596 ` +
      `186.803 303.596 162.204 C 303.596 79.093 237.551 11.734 156.063 ` +
      `11.734 Z" fill="${fillColor}" stroke="#fff" stroke-width="10" ` +
      `stroke-opacity="0.5"/>` +
      (hasContent
        ? `<ellipse cx="154.12" cy="163.702" rx="119.462" ry="119.462" ` +
          `fill="#fff"/>`
        : '') +
      renderGlyph(154, 164) +
      `</svg>`,
    width: pxW,
    height: pxH,
  };
}
