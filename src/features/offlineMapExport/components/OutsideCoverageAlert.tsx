import { setActiveModal } from '@app/store/actions.js';
import type { RootState } from '@app/store/store.js';
import { mapSetBounds } from '@features/map/model/actions.js';
import { fetchCoveredCountries } from '@features/map/model/fetchCoveredCountries.js';
import {
  type Bbox,
  mapAreaSelectConfirm,
} from '@features/mapArea/model/actions.js';
import { useCountryList } from '@shared/hooks/useCountryList.js';
import { flaggedCountries } from '@shared/mapDefinitions.js';
import { coverageCountries } from '@shared/mapLibrary/coverage.js';
import { type ReactElement, useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { useStore } from 'react-redux';
import { useOfflineMapExportMessages } from '../translations/useOfflineMapExportMessages.js';

type Props = {
  mapDef: { type: string; countries?: string[]; bbox?: unknown } | undefined;
  bbox: Bbox | undefined;
  /** Off while the form is hidden, so nothing is asked for. */
  active: boolean;
};

/** Warns that a map limited to some countries leaves the rest of the area empty. */
export function OutsideCoverageAlert({
  mapDef,
  bbox,
  active,
}: Props): ReactElement | null {
  const ome = useOfflineMapExportMessages();

  // the Europe-wide list is no limit
  const coverage =
    mapDef && flaggedCountries(mapDef) && coverageCountries(mapDef);

  const store = useStore<RootState>();

  const lookUp = active && coverage !== undefined ? bbox : undefined;

  // with the box it answers for, so a moved area never shows a stale answer
  const [areaCountries, setAreaCountries] = useState<{
    bbox: Bbox;
    countries: string[];
  }>();

  const answered = areaCountries?.bbox === lookUp;

  useEffect(() => {
    if (!lookUp || answered) {
      return;
    }

    let cancelled = false;

    fetchCoveredCountries(store.getState, lookUp, [
      setActiveModal,
      mapAreaSelectConfirm,
      mapSetBounds,
    ])
      .then((countries) => {
        if (!cancelled) {
          setAreaCountries({ bbox: lookUp, countries });
        }
      })
      // no warning rather than a wrong one
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [store, lookUp, answered]);

  const countriesInArea =
    lookUp && answered ? areaCountries?.countries : undefined;

  const outsideCoverage =
    coverage &&
    countriesInArea &&
    (countriesInArea.length === 0 ||
      countriesInArea.some((country) => !coverage.includes(country)));

  const coverageNames = useCountryList(coverage);

  return outsideCoverage && coverageNames ? (
    <Alert variant="warning">{ome?.outsideCoverage(coverageNames)}</Alert>
  ) : null;
}
