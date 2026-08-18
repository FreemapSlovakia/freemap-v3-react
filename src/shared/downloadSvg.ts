import { isAbortError } from '@shared/isAbortError.js';
import { saveBlob } from '@shared/saveBlob.js';

/**
 * Serializes a live `<svg>` to a standalone file and prompts the user to save
 * it. Theme `var()` colours are resolved to literals and the font is inlined so
 * the file renders outside the app (many SVG viewers — librsvg, cairosvg, older
 * Inkscape — don't support CSS custom properties), and an opaque backdrop
 * replaces the otherwise see-through margins.
 *
 * A no-op when `svg` is absent or the user cancels the save dialog.
 */
export async function downloadSvg(
  svg: SVGSVGElement | null,
  filename: string,
): Promise<void> {
  if (!svg) {
    return;
  }

  const clone = svg.cloneNode(true) as SVGSVGElement;

  const cs = getComputedStyle(svg);

  const resolved = new Map<string, string>();

  const resolveVar = (value: string) => {
    const match = /^var\((--[\w-]+)\)$/.exec(value);

    if (!match) {
      return value;
    }

    const name = match[1]!;

    let literal = resolved.get(name);

    if (literal === undefined) {
      literal = cs.getPropertyValue(name).trim();

      resolved.set(name, literal);
    }

    return literal || value;
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
  // Drawn in the SVG's own user units, which a `viewBox` can scale away from the
  // pixel size the element is laid out at; without one they are the same thing.
  const box = clone.viewBox.baseVal;

  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

  bg.setAttribute('x', String(box.width ? box.x : 0));
  bg.setAttribute('y', String(box.height ? box.y : 0));
  bg.setAttribute('width', String(box.width || svg.width.baseVal.value));
  bg.setAttribute('height', String(box.height || svg.height.baseVal.value));
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
    await saveBlob(blob, filename, { 'image/svg+xml': ['.svg'] });
  } catch (err) {
    // Swallow the user cancelling the save dialog; surface anything else.
    if (!isAbortError(err)) {
      throw err;
    }
  }
}
