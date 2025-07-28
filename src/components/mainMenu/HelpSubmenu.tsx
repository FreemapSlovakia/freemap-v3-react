import { JSX } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaBook, FaRegAddressCard, FaRegMap, FaUsers } from 'react-icons/fa';
import { getDocuments } from '../../documents/index.js';
import { useAppSelector } from '../../hooks/useAppSelector.js';
import { useMessages } from '../../l10nInjector.js';
import { SubmenuHeader } from './SubmenuHeader.js';

export function HelpSubmenu(): JSX.Element {
  const m = useMessages();

  const language = useAppSelector((state) => state.l10n.language);

  const skCz = ['sk', 'cs'].includes(language);

  const layers = useAppSelector((state) => state.map.layers);

  return (
    <>
      <SubmenuHeader icon={<FaBook />} title={m?.mainMenu.help} />

      {(skCz ? ['A', 'K', 'T', 'C', 'X', 'O'] : ['X', 'O']).includes(
        layers[0],
      ) && (
        <Dropdown.Item href="#show=legend" eventKey="modal-legend">
          <FaRegMap /> {m?.mainMenu.mapLegend}
        </Dropdown.Item>
      )}

      <Dropdown.Item eventKey="modal-about" href="#show=about">
        <FaRegAddressCard /> {m?.mainMenu.contacts}
      </Dropdown.Item>

      <Dropdown.Item href={m?.mainMenu.wikiLink} eventKey="url" target="_blank">
        <FaBook /> {m?.mainMenu.osmWiki}
      </Dropdown.Item>

      {skCz && (
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
