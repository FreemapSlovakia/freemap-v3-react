import { documents } from 'fm3/documents';
import { useAppSelector } from 'fm3/hooks/reduxSelectHook';
import { useMessages } from 'fm3/l10nInjector';
import Dropdown from 'react-bootstrap/Dropdown';
import { FaBook, FaRegAddressCard, FaRegMap, FaUsers } from 'react-icons/fa';
import { SubmenuHeader } from './SubmenuHeader';

export function HelpSubmenu(): JSX.Element {
  const m = useMessages();

  const language = useAppSelector((state) => state.l10n.language);

  const skCz = ['sk', 'cs'].includes(language);

  const mapType = useAppSelector((state) => state.map.mapType);

  return (
    <>
      <SubmenuHeader icon={<FaBook />} title={m?.mainMenu.help} />

      {(skCz ? ['A', 'K', 'T', 'C', 'X', 'O'] : ['X', 'O']).includes(
        mapType,
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

          {documents.map(([key, name, icon, hidden]) =>
            hidden ? null : (
              <Dropdown.Item
                key={key}
                href={`?tip=${key}`}
                eventKey={'document-' + key}
              >
                {icon} {name}
              </Dropdown.Item>
            ),
          )}
        </>
      )}
    </>
  );
}
