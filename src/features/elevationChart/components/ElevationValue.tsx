import { useMessages } from '@features/l10n/l10nInjector.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { isPremium } from '@features/premium/premium.js';
import { usePremiumMessages } from '@features/premium/translations/usePremiumMessages.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import type { ReactElement } from 'react';
import { Spinner } from 'react-bootstrap';
import { FaInfoCircle } from 'react-icons/fa';
import {
  elevationSourceNames,
  useElevationSources,
} from '../hooks/useElevationSources.js';
import { useElevationChartMessages } from '../translations/useElevationChartMessages.js';

/** One point's elevation as it travels from the API read to the readout. */
export type ElevationReading = {
  elevation: number | null | undefined;
  loading: boolean;
  /**
   * Terrain-model tokens the elevation API reported for this point — see
   * `elevationSourcesFromTokens`. Empty until the readout arrives, or when the
   * API names none.
   */
  sources: string[];
};

export type ElevationValueProps = ElevationReading & {
  label: string | undefined;
  className?: string;
};

/**
 * The single-point elevation line: a spinner while it is read, an em dash where
 * the API has no data, otherwise the value with the terrain model behind it and
 * the premium offer of a finer one.
 */
export function ElevationValue({
  elevation,
  loading,
  sources: reportedSources,
  label,
  className,
}: ElevationValueProps): ReactElement | null {
  const nf01 = useNumberFormat({
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  const m = useMessages();

  const ecm = useElevationChartMessages();

  const prm = usePremiumMessages();

  const premium = useAppSelector((state) => isPremium(state.auth.user));

  // A point readout always comes from the elevation API, so it names the terrain
  // model behind the number. Its own icon, not the gem's tooltip: the two say
  // different things — what this reading came from, and what premium would read
  // it from instead.
  const sources = useElevationSources('terrain-model', reportedSources);

  const sourceNames = elevationSourceNames(sources);

  const sourceHint =
    ecm && sourceNames ? `${ecm.elevationSource}: ${sourceNames}` : undefined;

  if (!loading && elevation === undefined) {
    return null;
  }

  return (
    <div className={className}>
      {label}:{' '}
      {loading ? (
        <Spinner animation="border" size="sm" />
      ) : elevation == null ? (
        <span className="text-muted">—</span>
      ) : (
        <>
          <b>{nf01.format(elevation)}</b>&nbsp;{m?.general.masl}
          {sourceHint && (
            <LongPressTooltip label={sourceHint}>
              {({ props }) => (
                <span
                  className="ms-1 text-body-secondary fm-cursor-help"
                  {...props}
                >
                  <FaInfoCircle />
                </span>
              )}
            </LongPressTooltip>
          )}
          <PremiumGem
            className="ms-1"
            hint={premium ? undefined : prm?.higherPrecisionElevation}
          />
        </>
      )}
    </div>
  );
}
