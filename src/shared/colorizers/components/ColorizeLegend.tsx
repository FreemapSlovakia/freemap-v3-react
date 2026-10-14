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
import { rgbCss } from '../colorize.js';
import { useColorizeScale } from '../colorizeScale.js';
import type { ColorizingMode, HotlinePalette } from '../index.js';
import { colorizers } from '../index.js';
import { useColorizerMessages } from '../translations/useColorizerMessages.js';

/** Render the colorizer palette as a left-to-right CSS gradient. */
function paletteGradient(palette: HotlinePalette): string {
  return `linear-gradient(to right, ${palette
    .map((s) => `${rgbCss([s.r, s.g, s.b])} ${s.t * 100}%`)
    .join(', ')})`;
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

  const language = useAppSelector((state) => state.l10n.language);

  const named = colorizers[mode].categories;

  // Walks the lines, so it is memoized like the scale below.
  const categories = useMemo(
    () => (named && features && cm ? named(features, cm) : []),
    [named, features, cm],
  );

  const { unit, ticks, valueAt, wide } = useColorizeScale(mode, features);

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
      control={control}
      onClose={onClose}
    >
      {named ? (
        <div
          // `overflow-y` is pinned: `auto` on one axis makes the browser
          // compute `auto` on the other, which puts a scrollbar beside two
          // lines that already fit. The padding keeps the clip edge off the
          // `lh-1` text, whose diacritics rise above the line box.
          className="me-1 py-1 my-n1 d-flex align-items-center gap-3 overflow-x-auto overflow-y-hidden"
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
        <LegendGradientBar
          background={background}
          valueAt={valueAt}
          wide={wide}
        >
          {ticks.map(({ t, label, inside }) => (
            <LegendTick key={t} t={t} inside={inside}>
              {label}
            </LegendTick>
          ))}
        </LegendGradientBar>
      )}
    </LegendShell>
  );
}
