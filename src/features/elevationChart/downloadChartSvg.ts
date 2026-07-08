import { saveBlob } from '@shared/saveBlob.js';

// Bootstrap theme custom properties referenced by the chart's SVG. They resolve
// from the app stylesheet on screen, but must be inlined so a downloaded SVG
// renders standalone.
const CSS_VARS = [
  '--bs-body-bg',
  '--bs-body-color',
  '--bs-primary',
  '--bs-primary-bg-subtle',
  '--bs-secondary',
  '--bs-danger',
];

/**
 * Serializes the live chart `<svg>` to a standalone file and prompts the user to
 * save it. Theme `var()` colours are resolved to literals and the font is
 * inlined so the file renders outside the app (many SVG viewers — librsvg,
 * cairosvg, older Inkscape — don't support CSS custom properties), and an opaque
 * backdrop replaces the otherwise see-through margins.
 *
 * A no-op when `svg` is absent or the user cancels the save dialog.
 */
export async function downloadChartSvg(
  svg: SVGSVGElement | null,
  width: number,
  height: number,
): Promise<void> {
  if (!svg) {
    return;
  }

  const clone = svg.cloneNode(true) as SVGSVGElement;

  const cs = getComputedStyle(svg);

  const resolved = new Map(
    CSS_VARS.map((name) => [name, cs.getPropertyValue(name).trim()]),
  );

  const resolveVar = (value: string) => {
    const match = /^var\((--[\w-]+)\)$/.exec(value);

    return (match && resolved.get(match[1])) || value;
  };

  for (const el of clone.querySelectorAll('[fill], [stroke]')) {
    for (const attr of ['fill', 'stroke']) {
      const value = el.getAttribute(attr);

      if (value) {
        el.setAttribute(attr, resolveVar(value));
      }
    }
  }

  clone.style.fontSize = cs.fontSize;
  clone.style.fontFamily = cs.fontFamily;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  // Opaque backdrop so the transparent margins aren't see-through in viewers.
  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

  bg.setAttribute('x', '0');
  bg.setAttribute('y', '0');
  bg.setAttribute('width', String(width));
  bg.setAttribute('height', String(height));
  bg.setAttribute('fill', resolveVar('var(--bs-body-bg)'));

  clone.insertBefore(bg, clone.firstChild);

  const blob = new Blob(
    [
      '<?xml version="1.0" encoding="UTF-8"?>\n',
      new XMLSerializer().serializeToString(clone),
    ],
    { type: 'image/svg+xml' },
  );

  try {
    await saveBlob(blob, 'elevation-chart.svg', { 'image/svg+xml': ['.svg'] });
  } catch (err) {
    // Swallow the user cancelling the save dialog; surface anything else.
    if (!(err instanceof DOMException && err.name === 'AbortError')) {
      throw err;
    }
  }
}
