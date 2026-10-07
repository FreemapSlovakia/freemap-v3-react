import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  LegendGradientBar,
  LegendShell,
  LegendSwatch,
  LegendTick,
} from '@shared/components/Legend.js';
import { formatDistance } from '@shared/distanceFormatter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { Feature, LineString } from 'geojson';
import { type ReactNode, useMemo } from 'react';
import { FaPalette } from 'react-icons/fa';
import type { Messages } from '@/translations/messagesInterface.js';
import { readCoordTimes, rgbCss } from '../colorize.js';
import type { ColorizingMode, HotlinePalette } from '../index.js';
import { colorizers } from '../index.js';
import { steepnessGradeAt } from '../modes/steepness.js';
import { useColorizerMessages } from '../translations/useColorizerMessages.js';

type Tick = { t: number; label: ReactNode };

type LegendSpec = {
  /** Shown once next to the legend label (e.g. `%`), not repeated on each tick. */
  unit?: string;
  ticks: Tick[];
};

/** Render the colorizer palette as a left-to-right CSS gradient. */
function paletteGradient(palette: HotlinePalette): string {
  return `linear-gradient(to right, ${palette
    .map((s) => `${rgbCss([s.r, s.g, s.b])} ${s.t * 100}%`)
    .join(', ')})`;
}

/** Min/max of finite numbers, or null if fewer than two distinct values. */
function span(values: Iterable<number>): { min: number; max: number } | null {
  let min = Infinity;

  let max = -Infinity;

  for (const v of values) {
    if (Number.isFinite(v)) {
      if (v < min) {
        min = v;
      }

      if (v > max) {
        max = v;
      }
    }
  }

  return max > min ? { min, max } : null;
}

/**
 * Real value range a numeric mode normalizes the feature against, in the mode's
 * unit. Reads the colorizer's own `legend` descriptor (smoothed values), so the
 * labels match the colored line; null for non-numeric modes or degenerate data.
 */
function numericRange(
  mode: ColorizingMode,
  feature: Feature<LineString>,
  zoom: number,
): { unit: string; min: number; max: number } | null {
  const lg = colorizers[mode].legend;

  const range = lg && span(lg.values(feature, { zoom }));

  return range ? { unit: lg.unit, ...range } : null;
}

/**
 * Axis ticks (and the optional unit) for a mode. Fixed-scale modes (steepness
 * grade, absolute battery/GSM percentage, compass heading) are feature-
 * independent and always labelled. Data-derived modes (elevation, speed,
 * sensors, time) normalize per feature, so a single honest scale exists only for
 * ONE feature; with several differently-scaled lines the bar is shown with no
 * labels rather than a misleading scale. A single feature with no/degenerate
 * data falls back to translated low/high (start/end for time) endpoints.
 */
function legendSpec(
  mode: ColorizingMode,
  cardinals: Messages['cardinals'],
  features: Feature<LineString>[] | undefined,
  language: string,
  zoom: number,
  steepnessScale: number,
): LegendSpec {
  switch (mode) {
    case 'steepness':
      return {
        unit: '%',
        // Evenly spaced, labelled with whatever grade lands there — round
        // grades cannot be had at every scale (at ±5 % they collapse onto
        // zero), and the labels closing up toward the middle is itself what
        // shows the scale bending.
        ticks: [0, 1 / 6, 2 / 6, 0.5, 4 / 6, 5 / 6, 1].map((t) => {
          const v = steepnessGradeAt(t, steepnessScale) * 100;

          return {
            t,
            label:
              Math.abs(v) < 0.05
                ? '0'
                : `${v > 0 ? '+' : ''}${Math.abs(v) < 10 ? v.toFixed(1) : Math.round(v)}`,
          };
        }),
      };
    case 'battery':
    case 'gsmSignal':
      return {
        unit: '%',
        ticks: [0, 25, 50, 75, 100].map((v, i) => ({
          t: i / 4,
          label: `${v}`,
        })),
      };
    case 'heading':
      return {
        ticks: [
          { t: 0, label: cardinals.n },
          { t: 0.25, label: cardinals.e },
          { t: 0.5, label: cardinals.s },
          { t: 0.75, label: cardinals.w },
          { t: 1, label: cardinals.n },
        ],
      };
  }

  // Per-feature-normalized modes: one honest scale needs exactly one feature.
  const feature = features?.length === 1 ? features[0] : undefined;

  if (!feature) {
    return { ticks: [] };
  }

  if (mode === 'time') {
    const range = span(
      readCoordTimes(feature, feature.geometry.coordinates.length) ?? [],
    );

    if (range) {
      const fmt = new Intl.DateTimeFormat(language, {
        hour: '2-digit',
        minute: '2-digit',
      });

      return {
        ticks: [0, 0.5, 1].map((t) => ({
          t,
          label: fmt.format(range.min + t * (range.max - range.min)),
        })),
      };
    }

    // No usable timestamp range (degenerate) — show the bar without labels.
    return { ticks: [] };
  }

  const numeric = numericRange(mode, feature, zoom);

  if (numeric) {
    const { unit, min, max } = numeric;

    return {
      unit,
      ticks: [0, 0.5, 1].map((t) => ({
        t,
        label: `${Math.round(min + t * (max - min))}`,
      })),
    };
  }

  // Degenerate data (no min/max range) — show the bar without labels.
  return { ticks: [] };
}

type Props = {
  mode: ColorizingMode;
  /**
   * The button reopening the tool this legend belongs to. A control rather than
   * a glyph because the legend outlives that tool's toolbar, so it is often the
   * only way back to it. Kept out of the label, which carries its own
   * long-press tooltip.
   */
  control: ReactNode;
  /** Features being colorized, used to derive real numeric labels (elevation, sensors). */
  features?: Feature<LineString>[];
  /** Hides the legend. It outlives its tool's toolbar, so it closes itself. */
  onClose: () => void;
};

/**
 * Toggleable legend for the route/track colorization, reusing the active mode's
 * Hotline palette as the gradient bar.
 */
export function ColorizeLegend({ mode, control, features, onClose }: Props) {
  const cm = useColorizerMessages();

  const m = useMessages();

  const language = useAppSelector((state) => state.l10n.language);

  // The same zoom the line is colorized at: a mode's smoothing window widens
  // with it, and the labels describe the smoothed values, not the raw samples.
  const zoom = useAppSelector((state) => Math.round(state.map.zoom));

  const steepnessScale = useAppSelector(
    (state) => state.elevationSettings.steepnessScale,
  );

  const named = colorizers[mode].categories;

  // Walks the lines, so it is memoized like the tick labels below.
  const categories = useMemo(
    () => (named && features && cm ? named(features, cm) : []),
    [named, features, cm],
  );

  // Scanning every coordinate (and building the Intl formatter) is kept off the
  // render path; it only reruns when the mode, features, language, or messages
  // change.
  const { unit, ticks } = useMemo(
    () =>
      cm && m && !named
        ? legendSpec(
            mode,
            m.cardinals,
            features,
            language,
            zoom,
            steepnessScale,
          )
        : { ticks: [] },
    [mode, cm, m, named, features, language, zoom, steepnessScale],
  );

  // A mode outlives the result it was picked for — it is persisted, and only the
  // dropdown consults `isAvailable`. A scale still has itself to show; a list of
  // categories would be an empty box beside the label.
  if (!cm || (named && categories.length === 0)) {
    return null;
  }

  const background = paletteGradient(colorizers[mode].palette);

  return (
    <LegendShell
      icon={<FaPalette />}
      label={cm.legend}
      unit={unit}
      fit={Boolean(named)}
      control={control}
      onClose={onClose}
    >
      {named ? (
        <div
          // `overflow-y` is pinned: `auto` on one axis makes the browser
          // compute `auto` on the other, which puts a scrollbar beside two
          // lines that already fit. The padding keeps the clip edge off the
          // `lh-1` text, whose diacritics rise above the line box.
          className="ms-4 me-3 py-1 my-n1 d-flex align-items-center gap-3 overflow-x-auto overflow-y-hidden"
        >
          {categories.map(({ key, label, meters, color }) => (
            <LegendSwatch
              key={key}
              color={color}
              label={label}
              sub={formatDistance(meters, language)}
            />
          ))}
        </div>
      ) : (
        <LegendGradientBar background={background} className="ms-4 me-3">
          {ticks.map(({ t, label }) => (
            <LegendTick key={t} t={t}>
              {label}
            </LegendTick>
          ))}
        </LegendGradientBar>
      )}
    </LegendShell>
  );
}
