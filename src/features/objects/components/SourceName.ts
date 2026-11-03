import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  mapByIdSelector,
  mapEntryOf,
} from '@features/mapLibrary/model/selectors.js';
import type { SearchResult } from '@features/search/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { layerName } from '@shared/layerName.js';

type Props = {
  result: SearchResult;
};

export function SourceName({ result }: Props) {
  const m = useMessages();

  const isWms = result.source.startsWith('wms:');

  const wmsType = isWms ? result.source.slice(4) : undefined;

  const wmsDef = useAppSelector((state) =>
    wmsType === undefined
      ? undefined
      : mapEntryOf(mapByIdSelector(state)[wmsType]),
  );

  const wmsMapName = wmsDef && layerName(wmsDef, m);

  return (
    (m?.search.sources[isWms ? 'wms:' : result.source] ?? '') +
    (wmsMapName ? ` ${wmsMapName}` : '')
  );
}
