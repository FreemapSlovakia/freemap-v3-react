import { isNetworkError } from '@app/httpRequest.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { PremiumGem } from '@features/premium/components/PremiumGem.js';
import { isPremium } from '@features/premium/premium.js';
import { usePremiumMessages } from '@features/premium/translations/usePremiumMessages.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import { OfflineBadge } from '@shared/components/OfflineBadge.js';
import { hasSubMeterPrecision } from '@shared/elevationSources.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useNumberFormat } from '@shared/hooks/useNumberFormat.js';
import type { ReactElement } from 'react';
import { Spinner } from 'react-bootstrap';
import { FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { addError } from '@/translations/messagesInterface.js';
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
  /**
   * Why the read failed. Shown in place of the value, so a failure that the
   * rest of the toast survives (being offline, most of all) is answered here
   * instead of by a danger toast beside it.
   */
  error?: unknown;
};

export type ElevationValueProps = ElevationReading & {
  label: string | undefined;
  className?: string;
};

/**
 * The single-point elevation line: a spinner while it is read, a warning
 * carrying the reason where the read failed, an em dash where the API has no
 * data, otherwise the value with the terrain model behind it and the premium
 * offer of a finer one.
 */
export function ElevationValue({
  elevation,
  loading,
  sources: reportedSources,
  error,
  label,
  className,
}: ElevationValueProps): ReactElement | null {
  // A decimal only where a national LiDAR model answered; off SRTM or GEDTM30 it
  // would be noise, and every other elevation readout writes whole metres.
  const nfEle = useNumberFormat({
    minimumFractionDigits: 0,
    maximumFractionDigits: hasSubMeterPrecision(reportedSources) ? 1 : 0,
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

  const errorText =
    m && ecm ? addError(m, ecm.fetchError, error) : String(error ?? '');

  const sourceHint =
    ecm && sourceNames ? `${ecm.elevationSource}: ${sourceNames}` : undefined;

  if (!loading && elevation === undefined && error === undefined) {
    return null;
  }

  return (
    <div className={className}>
      {label}:{' '}
      {loading ? (
        <Spinner animation="border" size="sm" />
      ) : error !== undefined ? (
        // A read that never reached the server wears the app's offline mark, so
        // it reads as the same thing everywhere; anything else is an error.
        isNetworkError(error) ? (
          <OfflineBadge offline hint={errorText} />
        ) : (
          <GlyphMarker hint={errorText} color="danger">
            <FaExclamationTriangle />
          </GlyphMarker>
        )
      ) : elevation == null ? (
        <span className="text-muted">—</span>
      ) : (
        <>
          <b>{nfEle.format(elevation)}</b>&nbsp;{m?.general.masl}
          {sourceHint && (
            <GlyphMarker
              hint={sourceHint}
              color="body-secondary"
              className="ms-1"
            >
              <FaInfoCircle />
            </GlyphMarker>
          )}
          <PremiumGem
            hint={premium ? undefined : prm?.higherPrecisionElevation}
          />
        </>
      )}
    </div>
  );
}
