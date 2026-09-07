/**
 * The dial's live `<svg>`, so the toolbar's download button can reach it.
 *
 * The panel owns the element and the toolbar is a sibling of it, mounted from a
 * different place — same shape of problem as the map itself, which is held the
 * same way (see `leafletElementHolder`). Nothing renders off this, so it is a
 * plain holder rather than state.
 */
let svg: SVGSVGElement | null = null;

export function setToposcopeSvg(element: SVGSVGElement | null): void {
  svg = element;
}

/** The mounted dial, or `null` while the panel is closed. */
export function getToposcopeSvg(): SVGSVGElement | null {
  return svg;
}
