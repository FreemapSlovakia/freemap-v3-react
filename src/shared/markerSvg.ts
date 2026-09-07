import type { MarkerType } from '@features/objects/model/actions.js';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {
  POI_ICON_KNOCKOUT_VAR,
  type PoiIcon,
  poiIcons,
} from '@osm/poiIcons.js';
import { splitColorAlpha } from '@shared/colorAlpha.js';
import {
  GLYPH_INSET_LIGHT,
  glyphInsetColor,
  POI_ARTWORK_INK,
} from '@shared/colors.js';
import { faIconToSvg, getFaIcon, parseIconSpec } from '@shared/drawingIcons.js';
import {
  MARKER_REF_WIDTH,
  MARKER_VIEWBOX_WIDTH,
  poiIconGlyphRect,
} from '@shared/poiIconGlyph.js';
import { escapeXml } from '@shared/stringUtils.js';

// Flattened Font Awesome icon geometry, as returned by `faIconToSvg`.
type FaSvg = { width: number; height: number; path: string };

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

// Places a poi icon's drawing into a host SVG at (x, y) sized w×h. The drawing
// is inlined markup, so it stays vector and — for the monochrome icons — takes
// `fill`, exactly like the Font Awesome glyphs beside it. `knockout` fills the
// areas that stand for the surface behind the drawing; a standalone export has
// no stylesheet, so the variable is resolved here rather than left to CSS.
export function nestPoiIcon(
  icon: PoiIcon,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  knockout: string,
): string {
  return (
    // `color` as well as `fill`: shapes that carry no paint of their own inherit
    // the fill, while the ones the drawing paints explicitly say `currentColor`,
    // which resolves against `color`.
    `<svg x="${x}" y="${y}" width="${w}" height="${h}" ` +
    `viewBox="${icon.vb.join(' ')}" fill="${fill}" color="${fill}">` +
    icon.body.replaceAll(`var(${POI_ICON_KNOCKOUT_VAR}, #fff)`, knockout) +
    `</svg>`
  );
}

// Resolves a drawing point's icon spec (+ label fallback) into the concrete
// glyph to embed: literal text, a Font Awesome path, or a poi icon drawing.
// `faCache` is shared across all points of an export so identical Font Awesome
// icons resolve only once.
export async function resolveMarkerGlyph({
  icon,
  label,
  faCache,
}: {
  icon?: string;
  label?: string;
  faCache: Map<string, IconDefinition | undefined>;
}): Promise<{
  text?: string;
  faSvg?: FaSvg;
  poi?: PoiIcon;
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
      def = await getFaIcon(spec.name);
      faCache.set(spec.name, def);
    }

    if (def) {
      faSvg = faIconToSvg(def);
    }
  }

  const poi = spec?.kind === 'poi' ? poiIcons[spec.name] : undefined;

  return {
    text,
    faSvg,
    poi,
    hasContent: Boolean(text || faSvg || poi),
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
  poi,
  anchorAtCenter = false,
  displayWidth = MARKER_REF_WIDTH,
}: {
  markerType: MarkerType | undefined;
  color: string;
  hasContent: boolean;
  text?: string;
  faSvg?: FaSvg;
  poi?: PoiIcon;
  anchorAtCenter?: boolean;
  displayWidth?: number;
}): { svg: string; width: number; height: number } {
  // Split any alpha off the color: the solid RGB paints the shape, while the
  // alpha becomes a group `opacity` on the whole <svg> so the entire marker
  // (shape + white inset + glyph) fades uniformly — matching RichMarker.
  const { color: fillColor, opacity } = splitColorAlpha(color);

  // A poi icon with colors of its own is artwork drawn for a light background,
  // so it keeps the white inset; everything else is painted in `fillColor` and
  // gets whichever inset that reads on. Mirrors RichMarker.
  const insetFill =
    poi && !poi.mono ? GLYPH_INSET_LIGHT : glyphInsetColor(fillColor);

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
        `dominant-baseline="central" fill="${fillColor}" ` +
        `font-size="150" font-weight="bold" font-family="Sans-Serif" ` +
        `style="white-space:pre">${escapeXml(text)}</text>`
      );
    }

    if (faSvg) {
      const scale = GLYPH / Math.max(faSvg.width, faSvg.height);
      const tx = cx - (faSvg.width * scale) / 2;
      const ty = cy - (faSvg.height * scale) / 2;

      return (
        `<path d="${escapeXml(faSvg.path)}" fill="${fillColor}" ` +
        `transform="translate(${tx} ${ty}) scale(${scale})"/>`
      );
    }

    if (poi) {
      // Mirror RichMarker's placement (scale+center by drawing bbox).
      const { x, y, width, height } = poiIconGlyphRect(
        poi,
        cx,
        cy,
        POI_GLYPH_SIZE,
      );

      return nestPoiIcon(
        poi,
        x,
        y,
        width,
        height,
        poi.mono ? fillColor : POI_ARTWORK_INK,
        insetFill,
      );
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
          ? `<ellipse cx="155" cy="155" rx="110" ry="110" fill="${insetFill}"/>`
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
            `fill="${insetFill}"/>`
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
          `fill="${insetFill}"/>`
        : '') +
      renderGlyph(154, 164) +
      `</svg>`,
    width: pxW,
    height: pxH,
  };
}
