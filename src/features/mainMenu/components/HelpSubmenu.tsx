import { useMessages } from '@features/l10n/l10nInjector.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { modalMenuItemProps } from '@shared/hooks/useMenuHandler.js';
import { type JSX, useMemo } from 'react';
import { Dropdown } from 'react-bootstrap';
import {
  FaBook,
  FaList,
  FaPowerOff,
  FaRegAddressCard,
  FaUsers,
} from 'react-icons/fa';
import { getDocuments } from '@/documents/index.js';
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
        <Dropdown.Item {...modalMenuItemProps('legend')}>
          <FaList /> {m?.mainMenu.mapLegend}
        </Dropdown.Item>
      )}

      <Dropdown.Item {...modalMenuItemProps('about')}>
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
            eventKey={`document-${key}`}
          >
            {icon} {title}
          </Dropdown.Item>
        ))}

      <Dropdown.Divider />

      <Dropdown.Item eventKey="reset-app" className="text-danger">
        <FaPowerOff /> {m?.mapLayers.resetApp}
      </Dropdown.Item>
    </>
  );
}
