import { useMessages } from '@features/l10n/l10nInjector.js';
import { formatDistance } from '@shared/distanceFormatter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import type { ReactElement } from 'react';
import type { PanoramaProbe } from '../model/actions.js';
import { usePanoramaMessages } from '../translations/usePanoramaMessages.js';
import type { PanoramaAim } from '../viewStore.js';

/** The whole mark, or the figures alone — a mark being dragged has no name. */
export type PanoramaReadout = Pick<PanoramaProbe, 'distance' | 'azimuth'> &
  Partial<Pick<PanoramaProbe, 'peak' | 'ele'>>;

/**
 * What a mark reads as: where a gesture on the map is holding it, or where the
 * store says it was left. Said in the same words in the marker's tooltip and in
 * the panel's own box, which is the point of it being one function.
 */
export function readoutOf(
  aim: PanoramaAim | null,
  probe: PanoramaProbe | null,
): PanoramaReadout | null {
  return aim?.mark
    ? {
        distance: aim.mark.distance,
        azimuth: aim.azimuth,
        ele: aim.mark.seen?.ele,
      }
    : probe;
}

type Props = {
  probe: PanoramaReadout;
};

/**
 * What was read out of the picture: a summit's name and elevation where it was
 * picked by name, and how far off and which way it stands either way.
 *
 * One component because it is said in two places at once — over the picture and
 * in the map marker's tooltip — and two copies of the same four formatters
 * drift: how a summit is written is one decision, not two.
 */
export function PanoramaProbeReadout({ probe }: Props): ReactElement {
  const m = usePanoramaMessages();

  const gm = useMessages();

  const language = useAppSelector((state) => state.l10n.language);

  // Plain, not the `meter` unit style: `general.masl` follows it and says both
  // the unit and what it is measured from.
  const nfEle = useNumberFormat({ maximumFractionDigits: 0 });

  const nfDeg = useNumberFormat({
    style: 'unit',
    unit: 'degree',
    unitDisplay: 'narrow',
    maximumFractionDigits: 0,
  });

  const title = probe.peak
    ? m?.peak.title({
        name: probe.peak.name,
        ele:
          probe.peak.ele === null
            ? null
            : `${nfEle.format(probe.peak.ele)} ${gm?.general.masl ?? ''}`,
      })
    : null;

  const figures = m?.peak.figures({
    distance: formatDistance(probe.distance, language),
    azimuth: nfDeg.format(probe.azimuth),
  });

  return (
    <>
      {title && <div>{title}</div>}

      {/* Guarded like the title: the messages load as their own chunk, and an
          unguarded div opens the tooltip as an empty box until they land. */}
      {figures && <div>{figures}</div>}

      {/* Read off the picture rather than measured — a row of pixels and a
          distance — so it wears a `~`. A summit says its own, which the terrain
          model answered and the title carries. */}
      {!probe.peak && probe.ele !== undefined && (
        <div>
          ~{nfEle.format(probe.ele)} {gm?.general.masl}
        </div>
      )}
    </>
  );
}
