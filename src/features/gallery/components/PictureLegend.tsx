import {
  type ColorizeScale,
  formatScaleNumber,
} from '@shared/colorizers/colorize.js';
import {
  LegendGradientBar,
  LegendShell,
  LegendSwatch,
  LegendTick,
} from '@shared/components/Legend.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useMemo } from 'react';
import { FaCamera, FaPalette } from 'react-icons/fa';
import {
  AGE_YEAR_S,
  ageColor,
  ageT,
  ageYearsAt,
  ratingColor,
  SEASON_START_S,
  seasonColor,
  seasonOffsetAt,
} from '../colorScales.js';
import { LICENSE_COLORS } from '../licenseColors.js';
import { PHOTO_LICENSES } from '../licenses.js';
import { GALLERY_COLOR, MUTED_COLOR } from '../marbleColors.js';
import type { GalleryColorizeBy } from '../model/actions.js';
import type { GalleryMessages } from '../translations/GalleryMessages.js';
import { useGalleryMessages } from '../translations/useGalleryMessages.js';

const ICON = (
  <>
    <FaCamera />
    <FaPalette />
  </>
);

/** A CSS gradient sampled from a colour function, for a curve CSS can't draw. */
function sampledGradient(colorAt: (t: number) => string, steps: number) {
  const stops = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;

    return `${colorAt(t)} ${t * 100}%`;
  });

  return `linear-gradient(to right, ${stops.join(', ')})`;
}

/** Older than this, the date readout stops counting. */
const MAX_AGE_YEARS = 100;

const SEC = 1000;

type PictureScale = ColorizeScale & { background: string };

function ageScale(language: string): PictureScale {
  const monthYear = new Intl.DateTimeFormat(language, {
    month: 'short',
    year: 'numeric',
  });

  const year = new Intl.DateTimeFormat(language, { year: 'numeric' });

  return {
    background: sampledGradient(ageColor, 4),
    wide: true,
    ticks: [0, 1, 2, 3, 5, 10, 20].map((y) => ({ t: ageT(y), label: `${-y}` })),
    valueAt: (t) => {
      const years = Math.min(MAX_AGE_YEARS, ageYearsAt(t));

      const date = Date.now() - years * AGE_YEAR_S * SEC;

      return years < MAX_AGE_YEARS
        ? monthYear.format(date)
        : `< ${year.format(date)}`;
    },
  };
}

/**
 * The gradient, ticks and readout of each gradient colorize mode, by language;
 * which modes draw a scale — see {@link pictureLegendApplies}.
 */
const PICTURE_SCALES: Partial<
  Record<GalleryColorizeBy, (language: string) => PictureScale>
> = {
  rating: (language) => ({
    background: sampledGradient((t) => ratingColor(1 + 4 * t), 16),
    ticks: [1, 2, 3, 4, 5].map((r) => ({ t: (r - 1) / 4, label: `${r}` })),
    valueAt: (t) => formatScaleNumber(1 + 4 * t, 1, language),
  }),
  takenAt: ageScale,
  createdAt: ageScale,
  season: (language) => {
    const dayMonth = new Intl.DateTimeFormat(language, {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    });

    return {
      background: sampledGradient(seasonColor, 24),
      wide: true,
      ticks: Array.from({ length: 13 }, (_, i) => ({
        t: i / 12,
        label: `${(i % 12) + 1}`,
      })),
      valueAt: (t) =>
        dayMonth.format((SEASON_START_S + seasonOffsetAt(t)) * SEC),
    };
  },
};

type Swatch = { color: string; label: string; title?: string };

/**
 * The swatch list for a categorical colorize mode (license/mine/premium), or
 * null for gradient/uncolored modes. The single source of truth for which
 * categorical modes draw a legend — see {@link pictureLegendApplies}.
 */
function categoricalSwatches(
  colorizeBy: GalleryColorizeBy | null | undefined,
  gm: GalleryMessages | undefined,
): Swatch[] | null {
  switch (colorizeBy) {
    case 'license':
      return PHOTO_LICENSES.map(({ id }) => ({
        color: LICENSE_COLORS[id],
        label: gm?.license.names[id] ?? id,
        title: gm?.license.descriptions[id],
      }));
    case 'mine':
      return [
        { color: GALLERY_COLOR, label: gm?.legendCategory.mine ?? '' },
        { color: MUTED_COLOR, label: gm?.legendCategory.notMine ?? '' },
      ];
    case 'premium':
      return [
        { color: GALLERY_COLOR, label: gm?.legendCategory.premium ?? '' },
        { color: MUTED_COLOR, label: gm?.legendCategory.free ?? '' },
      ];
    default:
      return null;
  }
}

/** Whether a colorize mode draws a legend (gradient or categorical swatches). */
export function pictureLegendApplies(
  colorizeBy: GalleryColorizeBy | null | undefined,
): boolean {
  return (
    (colorizeBy != null && colorizeBy in PICTURE_SCALES) ||
    categoricalSwatches(colorizeBy, undefined) !== null
  );
}

export function PictureLegend() {
  const colorizeBy = useAppSelector(
    (state) =>
      state.map.layers.includes('I') && state.gallerySettings.colorizeBy,
  );

  const gm = useGalleryMessages();

  const language = useAppSelector((state) => state.l10n.language);

  // Sampling the gradient converts colours, and new ticks re-measure the bar.
  const scale = useMemo(
    () => (colorizeBy ? PICTURE_SCALES[colorizeBy]?.(language) : undefined),
    [colorizeBy, language],
  );

  const swatches = categoricalSwatches(colorizeBy || undefined, gm);

  if (swatches) {
    return (
      <LegendShell
        icon={ICON}
        label={gm?.legend}
        className="flex-wrap align-items-center gap-2"
      >
        {swatches.map(({ color, label, title }) => (
          <LegendSwatch key={color} color={color} label={label} title={title} />
        ))}
      </LegendShell>
    );
  }

  if (!scale) {
    return null;
  }

  return (
    <LegendShell icon={ICON} label={gm?.legend}>
      <LegendGradientBar
        background={scale.background}
        valueAt={scale.valueAt}
        wide={scale.wide}
      >
        {scale.ticks.map(({ t, label }) => (
          <LegendTick key={t} t={t}>
            {label}
          </LegendTick>
        ))}
      </LegendGradientBar>
    </LegendShell>
  );
}
