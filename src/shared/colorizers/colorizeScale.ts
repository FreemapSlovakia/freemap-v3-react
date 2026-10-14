import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { Feature, LineString } from 'geojson';
import { useMemo } from 'react';
import {
  type ColorizeOptions,
  type ColorizeScale,
  linearScale,
  type ScaleContext,
  span,
} from './colorize.js';
import { type ColorizingMode, colorizers } from './index.js';
import { useColorizerMessages } from './translations/useColorizerMessages.js';

const NO_SCALE: ColorizeScale = { ticks: [] };

/**
 * Ticks, unit and readout for a mode. A per-line scale is labelled only for a
 * single line, as several lines each have their own; `options` must smooth it
 * as the line was colorized.
 */
export function colorizeScale(
  mode: ColorizingMode,
  context: ScaleContext,
  features: Feature<LineString>[] | undefined,
  options: ColorizeOptions,
): ColorizeScale {
  const { categoryAt, scale, legend } = colorizers[mode];

  if (categoryAt) {
    return { ticks: [], valueAt: (t) => categoryAt(t, context.cm) };
  }

  if (scale) {
    return scale(context);
  }

  const feature = features?.length === 1 ? features[0] : undefined;

  const range = feature && legend && span(legend.values(feature, options));

  if (!legend || !range) {
    return NO_SCALE;
  }

  const { language } = context;

  return linearScale(range, language, [0, 0.5, 1], {
    digits: legend.digits,
    unit: legend.unit,
    format: legend.format?.(language, range),
    wide: legend.wide,
  });
}

/**
 * {@link colorizeScale} for the features in hand, smoothed at the map's zoom
 * unless the line was colorized at a `metersPerPixel` of its own.
 */
export function useColorizeScale(
  mode: ColorizingMode | null,
  features: Feature<LineString>[] | undefined,
  metersPerPixel?: number,
): ColorizeScale {
  const cm = useColorizerMessages();

  const m = useMessages();

  const language = useAppSelector((state) => state.l10n.language);

  // The same zoom the line is colorized at: a mode's smoothing window widens
  // with it. Read only where it smooths a per-line scale, so it rescans nothing.
  const zoom = useAppSelector((state) =>
    metersPerPixel === undefined && mode && colorizers[mode].legend?.smoothed
      ? Math.round(state.map.zoom)
      : undefined,
  );

  const steepnessScale = useAppSelector(
    (state) => state.elevationSettings.steepnessScale,
  );

  // Scanning every coordinate is kept off the render path.
  return useMemo(
    () =>
      mode && cm && m
        ? colorizeScale(
            mode,
            { cm, cardinals: m.cardinals, language, steepnessScale },
            features,
            metersPerPixel === undefined ? { zoom } : { metersPerPixel },
          )
        : NO_SCALE,
    [mode, cm, m, features, language, zoom, steepnessScale, metersPerPixel],
  );
}
