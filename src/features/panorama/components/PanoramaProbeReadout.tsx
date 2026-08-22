import { useMessages } from '@features/l10n/l10nInjector.js';
import { formatDistance } from '@shared/distanceFormatter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import type { ReactElement } from 'react';
import type { PanoramaProbe } from '../model/actions.js';
import { usePanoramaMessages } from '../translations/usePanoramaMessages.js';

type Props = {
  probe: PanoramaProbe;
  /** Stacks the name over the figures, for a tooltip; inline for a footer row. */
  stacked?: boolean;
};

/**
 * What was read out of the picture: a summit's name and elevation where it was
 * picked by name, and how far off and which way it stands either way.
 *
 * One component because it is said in two places at once — the panel's footer
 * and the map marker's tooltip — and two copies of the same four formatters
 * drift: how a summit is written is one decision, not two.
 */
export function PanoramaProbeReadout({ probe, stacked }: Props): ReactElement {
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

  return stacked ? (
    <>
      {title && <div>{title}</div>}

      <div>{figures}</div>
    </>
  ) : (
    <>
      {title}
      {title && ' — '}
      {figures}
    </>
  );
}
