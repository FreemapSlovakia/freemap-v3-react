import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { Feature, LineString } from 'geojson';
import { type ReactNode, useMemo } from 'react';
import { FaPalette } from 'react-icons/fa';
import { readCoordTimes } from '../colorize.js';
import type { ColorizingMode, HotlinePalette } from '../index.js';
import { colorizers } from '../index.js';
import type { ColorizerMessages } from '../translations/ColorizerMessages.js';
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
    .map((s) => `rgb(${s.r} ${s.g} ${s.b}) ${s.t * 100}%`)
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
): { unit: string; min: number; max: number } | null {
  const lg = colorizers[mode].legend;

  const range = lg && span(lg.values(feature));

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
  cm: ColorizerMessages,
  features: Feature<LineString>[] | undefined,
  language: string,
): LegendSpec {
  switch (mode) {
    case 'steepness':
      return {
        unit: '%',
        ticks: [-50, -25, 0, 25, 50].map((v, i) => ({
          t: i / 4,
          label: `${v > 0 ? '+' : ''}${v}`,
        })),
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
          { t: 0, label: cm.compass.n },
          { t: 0.25, label: cm.compass.e },
          { t: 0.5, label: cm.compass.s },
          { t: 0.75, label: cm.compass.w },
          { t: 1, label: cm.compass.n },
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

  const numeric = numericRange(mode, feature);

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
  /** The host tool's icon, shown before the palette icon (like the gallery). */
  icon: ReactNode;
  /** Features being colorized, used to derive real numeric labels (elevation, sensors). */
  features?: Feature<LineString>[];
};

/**
 * Toggleable legend for the route/track colorization, reusing the active mode's
 * Hotline palette as the gradient bar. Mirrors the picture-gallery legend.
 */
export function ColorizeLegend({ mode, icon, features }: Props) {
  const cm = useColorizerMessages();

  const language = useAppSelector((state) => state.l10n.language);

  // Scanning every coordinate (and building the Intl formatter) is kept off the
  // render path; it only reruns when the mode, features, language, or messages
  // change.
  const { unit, ticks } = useMemo(
    () => (cm ? legendSpec(mode, cm, features, language) : { ticks: [] }),
    [mode, cm, features, language],
  );

  if (!cm) {
    return null;
  }

  const background = paletteGradient(colorizers[mode].palette);

  return (
    <div className="w-100" style={{ maxWidth: '400px' }}>
      <Toolbar className="mt-2 d-flex">
        <LongPressTooltip label={cm.legend} breakpoint="sm">
          {({ props, label, labelClassName }) => (
            <span className="align-self-center ms-1" {...props}>
              {icon} <FaPalette />{' '}
              <span className={labelClassName}>
                {label}
                {unit ? ` [${unit}]` : ''}
              </span>
            </span>
          )}
        </LongPressTooltip>

        <div
          // Extra left gap so the leftmost value — centered on the gradient's
          // left edge — overhangs into empty space, not over the legend label.
          className="ms-4 me-3"
          style={{
            flexGrow: '1',
            position: 'relative',
            height: '34px',
          }}
        >
          <div
            className="border rounded position-absolute"
            style={{ inset: 0, background }}
          />

          <div
            className="text-body position-absolute"
            style={{
              inset: 0,
              paintOrder: 'stroke',
              WebkitTextStrokeWidth: '2px',
              WebkitTextStrokeColor: 'var(--bs-body-bg)',
            }}
          >
            {ticks.map(({ t, label }) => (
              <div
                key={t}
                style={{
                  position: 'absolute',
                  top: '16%',
                  // Center every label on its position, so the endpoints sit
                  // centered on the gradient edges (matching the gallery legend).
                  left: `calc(${t * 100}% - 20px)`,
                  width: '40px',
                  textAlign: 'center',
                  textWrap: 'nowrap',
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </Toolbar>
    </div>
  );
}
