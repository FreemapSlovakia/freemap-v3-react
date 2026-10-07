import {
  LegendGradientBar,
  LegendShell,
  LegendSwatch,
  LegendTick,
} from '@shared/components/Legend.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { FaCamera, FaPalette } from 'react-icons/fa';
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

/**
 * The CSS gradient for a colorize mode's legend, or undefined for categorical
 * modes (mine/author/premium) that have no gradient scale. The single source of
 * truth for which modes draw a legend — see {@link pictureLegendApplies}.
 */
export function pictureGradient(
  colorizeBy: GalleryColorizeBy | null | undefined,
): string | undefined {
  switch (colorizeBy) {
    case 'rating':
      return 'linear-gradient(to right in hsl, hsl(60 100% 1%), hsl(60 100% 99%))';
    case 'takenAt':
    case 'createdAt':
      return 'linear-gradient(to right in hsl, hsl(60 100% 99%), hsl(60 100% 1%))';
    case 'season':
      return `linear-gradient(
              to right in lab,
              lab(70 -5 -52) 0%,  /* winter */
              lab(70 -62 42) 25%, /* spring */
              lab(90 -4 74) 50%,  /* summer */
              lab(70 48 43) 75%,  /* fall */
              lab(70 -5 -52) 100% /* wrap back to winter */
            )`;
    default:
      return undefined;
  }
}

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
    pictureGradient(colorizeBy) !== undefined ||
    categoricalSwatches(colorizeBy, undefined) !== null
  );
}

export function PictureLegend() {
  const colorizeBy = useAppSelector(
    (state) =>
      state.map.layers.includes('I') && state.gallerySettings.colorizeBy,
  );

  const gm = useGalleryMessages();

  const byDate = colorizeBy === 'takenAt' || colorizeBy === 'createdAt';

  const background = pictureGradient(colorizeBy || undefined);

  const swatches = categoricalSwatches(colorizeBy || undefined, gm);

  if (swatches) {
    return (
      <LegendShell
        icon={ICON}
        label={gm?.legend}
        fit
        className="flex-wrap align-items-center gap-2"
      >
        {swatches.map(({ color, label, title }) => (
          <LegendSwatch key={color} color={color} label={label} title={title} />
        ))}
      </LegendShell>
    );
  }

  if (!background) {
    return null;
  }

  return (
    <LegendShell icon={ICON} label={gm?.legend}>
      <LegendGradientBar background={background} className="mx-2">
        {colorizeBy === 'rating'
          ? new Array(5).fill(0).map((_, i) => (
              <LegendTick key={i} t={i / 4}>
                {i + 1}
              </LegendTick>
            ))
          : byDate
            ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 40].map((i, j) => (
                <div
                  key={i}
                  style={{
                    transform: 'rotate(90deg)',
                    fontSize: '0.75em',
                    position: 'absolute',
                    left: `calc(${(0.333 * i * 100) / (1 + 0.333 * i)}% - 4px)`,
                    top: j % 2 ? '3px' : '13px',
                  }}
                >
                  {-i}
                </div>
              ))
            : colorizeBy === 'season'
              ? new Array(13).fill(0).map((_, i) => (
                  <LegendTick key={i} t={i / 12}>
                    {(i % 12) + 1}
                  </LegendTick>
                ))
              : null}
      </LegendGradientBar>
    </LegendShell>
  );
}
