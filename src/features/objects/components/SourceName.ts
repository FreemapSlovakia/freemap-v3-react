import { useMessages } from '@features/l10n/l10nInjector.js';
import type { SearchResult } from '@features/search/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { mapIndexById } from '@shared/mapLibrary/mapIndex.js';

type Props = {
  result: SearchResult;
};

export function SourceName({ result }: Props) {
  const m = useMessages();

  const isWms = result.source.startsWith('wms:');

  const customLayerDefs = useAppSelector((state) => state.map.customLayers);

  const wmsType = isWms ? result.source.slice(4) : undefined;

  const wmsMapName =
    wmsType === undefined
      ? null
      : mapIndexById[wmsType]
        ? m?.mapLayers.letters[wmsType]
        : customLayerDefs.find((def) => def.type === wmsType)?.name;

  return (
    (m?.search.sources[isWms ? 'wms:' : result.source] ?? '') +
    (wmsMapName ? ` ${wmsMapName}` : '')
  );
}
