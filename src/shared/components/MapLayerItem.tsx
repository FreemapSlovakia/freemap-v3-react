import { useMessages } from '@features/l10n/l10nInjector.js';
import { countryCodeToFlag, Emoji } from '@shared/components/Emoji.js';
import { ExperimentalFunction } from '@shared/components/ExperimentalFunction.js';
import type { ReactElement } from 'react';
import { FaHistory } from 'react-icons/fa';
import { TbLayersSelected, TbLayersSelectedBottom } from 'react-icons/tb';

type MapLayerItemDef = {
  type: string;
  layer: 'base' | 'overlay';
  icon?: ReactElement;
  name?: string;
  countries?: string[];
  superseededBy?: string;
  experimental?: boolean;
};

export function MapLayerItem({ def }: { def: MapLayerItemDef }): ReactElement {
  const m = useMessages();

  return (
    <>
      {def.layer === 'base' ? (
        <TbLayersSelected className="opacity-50" />
      ) : (
        <TbLayersSelectedBottom className="opacity-50" />
      )}

      <span className="px-2">{def.icon}</span>

      {m?.mapLayers.letters[def.type] ?? def.name ?? def.type}

      {def.type !== 'X' &&
        def.countries?.map((country) => (
          <Emoji className="ms-1" key={country}>
            {countryCodeToFlag(country)}
          </Emoji>
        ))}

      {def.superseededBy && (
        <FaHistory className="text-warning ms-1" title={m?.maps.legacy} />
      )}

      {def.experimental && (
        <ExperimentalFunction data-interactive="1" className="ms-1" />
      )}
    </>
  );
}
