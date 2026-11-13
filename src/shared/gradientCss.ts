/**
 * The `linear-gradient` value `@zdila/react-gradient-color-picker` speaks. A
 * stop dragged past an end comes back outside 0–100%; the selected stop is the
 * one written `RGBA`, and the picker loses it unless handed back so.
 */
export type CssGradientStop = {
  rgba: [r: number, g: number, b: number, a: number];
  pct: number;
};

export function gradientCss(stops: CssGradientStop[], active?: number): string {
  return `linear-gradient(90deg, ${stops
    .map(
      ({ rgba, pct }, i) =>
        `${i === active ? 'RGBA' : 'rgba'}(${rgba.join(',')}) ${pct}%`,
    )
    .join(', ')})`;
}

const NUM = String.raw`\s*(\d+(?:\.\d+)?)\s*`;

const STOP_RE = new RegExp(
  String.raw`(r)gba?\(${NUM},${NUM},${NUM}(?:,${NUM})?\)\s+(-?\d+(?:\.\d+)?)%`,
  'gi',
);

/**
 * Its stops and the selected one; `null` for a plain colour (the solid tab) or
 * a gradient with no stop written as numbers.
 */
export function parseGradientCss(
  css: string,
): { stops: CssGradientStop[]; active?: number } | null {
  if (!css.startsWith('linear-gradient(')) {
    return null;
  }

  let active: number | undefined;

  const stops = [...css.matchAll(STOP_RE)].map(
    ([, r, red, green, blue, alpha, pct], i): CssGradientStop => {
      if (r === 'R') {
        active = i;
      }

      return {
        rgba: [Number(red), Number(green), Number(blue), Number(alpha ?? 1)],
        pct: Number(pct),
      };
    },
  );

  return stops.length ? { stops, active } : null;
}
