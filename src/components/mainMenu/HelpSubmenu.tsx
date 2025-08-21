import { JSX, useMemo } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaBook, FaList, FaRegAddressCard, FaUsers } from 'react-icons/fa';
import { getDocuments } from '../../documents/index.js';
import { useAppSelector } from '../../hooks/useAppSelector.js';
import { useMessages } from '../../l10nInjector.js';
import { SubmenuHeader } from './SubmenuHeader.js';

export function HelpSubmenu(): JSX.Element {
  const m = useMessages();

  const language = useAppSelector((state) => state.l10n.language);

  const skCs = ['sk', 'cs'].includes(language);

  const legendLayers = useMemo(
    () => new Set(skCs ? ['A', 'K', 'T', 'C', 'X', 'O'] : ['X', 'O']),
    [skCs],
  );

  const layers = useAppSelector((state) => state.map.layers);

  return (
    <>
      <SubmenuHeader icon={<FaBook />} title={m?.mainMenu.help} />

      {layers.some((layer) => legendLayers.has(layer)) && (
        <Dropdown.Item href="#show=legend" eventKey="modal-legend">
          <FaList /> {m?.mainMenu.mapLegend}
        </Dropdown.Item>
      )}

      <Dropdown.Item eventKey="modal-about" href="#show=about">
        <FaRegAddressCard /> {m?.mainMenu.contacts}
      </Dropdown.Item>

      <Dropdown.Item href={m?.mainMenu.wikiLink} eventKey="url" target="_blank">
        <FaBook /> {m?.mainMenu.osmWiki}
      </Dropdown.Item>

      {skCs && (
        <>
          <Dropdown.Item
            href="https://groups.google.com/forum/#!forum/osm_sk"
            eventKey="url"
            target="_blank"
          >
            <FaUsers /> Fórum slovenskej OSM komunity
          </Dropdown.Item>

          <Dropdown.Divider />
        </>
      )}

      {getDocuments(language)
        .filter((item) => item.listed !== false)
        .map(({ key, icon, title }) => (
          <Dropdown.Item
            key={key}
            href={`?document=${key}`}
            eventKey={'document-' + key}
          >
            {icon} {title}
          </Dropdown.Item>
        ))}
    </>
  );
}
