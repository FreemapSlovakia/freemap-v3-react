import { useMessages } from '@features/l10n/l10nInjector.js';
import { OnlineOnlyItem } from '@shared/components/OnlineOnlyItem.js';
import { SubmenuHeader } from '@shared/components/SubmenuHeader.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import {
  documentMenuItemProps,
  modalMenuItemProps,
} from '@shared/hooks/useMenuHandler.js';
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
        <OnlineOnlyItem {...modalMenuItemProps('legend')}>
          <FaList /> {m?.mainMenu.mapLegend}
        </OnlineOnlyItem>
      )}

      <Dropdown.Item {...modalMenuItemProps('about')}>
        <FaRegAddressCard /> {m?.mainMenu.contacts}
      </Dropdown.Item>

      <OnlineOnlyItem
        href={m?.mainMenu.wikiLink}
        eventKey="url"
        target="_blank"
      >
        <FaBook /> {m?.mainMenu.osmWiki}
      </OnlineOnlyItem>

      {skCs && (
        <>
          <OnlineOnlyItem
            href="https://groups.google.com/forum/#!forum/osm_sk"
            eventKey="url"
            target="_blank"
          >
            <FaUsers /> Fórum slovenskej OSM komunity
          </OnlineOnlyItem>

          <Dropdown.Divider />
        </>
      )}

      {getDocuments(language)
        .filter((item) => item.listed !== false)
        .map(({ key, icon, title }) => (
          <Dropdown.Item key={key} {...documentMenuItemProps(key)}>
            {icon} {title}
          </Dropdown.Item>
        ))}

      <Dropdown.Divider />

      <Dropdown.Item as="button" eventKey="reset-app" className="text-danger">
        <FaPowerOff /> {m?.mapLayers.resetApp}
      </Dropdown.Item>
    </>
  );
}
