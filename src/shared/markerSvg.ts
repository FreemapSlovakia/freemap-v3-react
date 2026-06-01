import type { MarkerType } from '@features/objects/model/actions.js';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { splitColorAlpha } from '@shared/colorAlpha.js';
import {
  faIconToSvg,
  loadAllIcons,
  parseIconSpec,
  poiIconNameToUrl,
} from '@shared/drawingIcons.js';

// Glyph color: GLYPH_COLOR from RichMarker (Bootstrap gray-700). Kept literal
// here so the export pipeline doesn't need a runtime CSS-variable lookup.
const GLYPH_COLOR_LITERAL = '#495057';

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

export async function fetchSvgAsDataUrl(
  url: string,
): Promise<string | undefined> {
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

// Resolves a drawing point's icon spec (+ label fallback) into the concrete
// glyph to embed: literal text, a Font Awesome path, or a poi image data URL.
// The caches are shared across all points of an export so identical icons
// resolve (and poi SVGs are fetched) only once.
export async function resolveMarkerGlyph({
  icon,
  label,
  faCache,
  poiDataUrlCache,
}: {
  icon?: string;
  label?: string;
  faCache: Map<string, IconDefinition | undefined>;
  poiDataUrlCache: Map<string, Promise<string | undefined>>;
}): Promise<{
  text?: string;
  faSvg?: FaSvg;
  poiDataUrl?: string;
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

  return {
    text,
    faSvg,
    poiDataUrl,
    hasContent: Boolean(text || faSvg || poiDataUrl),
  };
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
export function buildMarkerSvg({
  markerType,
  color,
  hasContent,
  text,
  faSvg,
  poiDataUrl,
  anchorAtCenter = false,
}: {
  markerType: MarkerType | undefined;
  color: string;
  hasContent: boolean;
  text?: string;
  faSvg?: FaSvg;
  poiDataUrl?: string;
  anchorAtCenter?: boolean;
}): { svg: string; width: number; height: number } {
  // Split any alpha off the color: the solid RGB paints the shape, while the
  // alpha becomes a group `opacity` on the whole <svg> so the entire marker
  // (shape + white inset + glyph) fades uniformly — matching RichMarker.
  const { color: fillColor, opacity } = splitColorAlpha(color);

  const opacityAttr = opacity < 1 ? ` opacity="${opacity}"` : '';

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
        `<svg xmlns="http://www.w3.org/2000/svg" width="310" height="310" viewBox="0 0 310 310"${opacityAttr}>` +
        `<ellipse cx="155" cy="155" rx="135" ry="135" fill="${fillColor}" ` +
        `stroke="${fillColor}" stroke-width="10" stroke-opacity="0.5"/>` +
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
        `<svg xmlns="http://www.w3.org/2000/svg" width="310" height="310" viewBox="0 0 310 310"${opacityAttr}>` +
        `<rect x="30" y="30" width="240" height="240" rx="20" ry="20" ` +
        `fill="${fillColor}" stroke="${fillColor}" stroke-width="10" ` +
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

  // pin (default). The anchor is the tip at (156.06, 493.24). With
  // `anchorAtCenter`, pad the viewBox below the tip so it becomes the vertical
  // center: height = 2 × 493.239, keeping the tip at center (155, 493.239).
  const height = anchorAtCenter ? 986.478 : 512;

  return {
    svg:
      `<svg xmlns="http://www.w3.org/2000/svg" width="310" height="${height}" viewBox="0 0 310 ${height}"${opacityAttr}>` +
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
    width: 310,
    height,
  };
}
