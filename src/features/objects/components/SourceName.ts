import { useMessages } from '@features/l10n/l10nInjector.js';
import { SearchResult } from '@features/search/model/actions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { integratedLayerDefs } from '@shared/mapDefinitions.js';

type Props = {
  result: SearchResult;
};

export function SourceName({ result }: Props) {
  const m = useMessages();

  const isWms = result.source.startsWith('wms:');

  const customLayerDefs = useAppSelector((state) => state.map.customLayers);

  const wmsLayerDefs = !isWms
    ? undefined
    : [
        ...integratedLayerDefs.map((def) => ({
          ...def,
          custom: false as const,
        })),
        ...customLayerDefs.map((def) => ({ ...def, custom: true as const })),
      ].filter((def) => def.technology === 'wms');

  const wmsDef = wmsLayerDefs?.find(
    (def) => def.type === result.source.slice(4),
  );

  const wmsMapName = !wmsDef
    ? null
    : wmsDef.custom
      ? wmsDef.name
      : m?.mapLayers.letters[wmsDef.type];

  return (
    (m?.search.sources[isWms ? 'wms:' : result.source] ?? '') +
    (wmsMapName ? ' ' + wmsMapName : '')
  );
}
