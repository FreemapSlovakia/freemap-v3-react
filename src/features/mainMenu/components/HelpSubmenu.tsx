import { useMessages } from '@features/l10n/l10nInjector.js';
import { Menu } from '@mantine/core';
import { useMenuSelect } from '@shared/components/menuSelectContext.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type JSX, useMemo } from 'react';
import { FaBook, FaList, FaRegAddressCard, FaUsers } from 'react-icons/fa';
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

  const select = useMenuSelect();

  return (
    <>
      <SubmenuHeader icon={<FaBook />} title={m?.mainMenu.help} />

      {layers.some((layer) => legendLayers.has(layer)) && (
        <Menu.Item
          component="a"
          href="#show=legend"
          leftSection={<FaList />}
          onClick={(e) => {
            e.preventDefault();
            select('modal-legend');
          }}
        >
          {m?.mainMenu.mapLegend}
        </Menu.Item>
      )}

      <Menu.Item
        component="a"
        href="#show=about"
        leftSection={<FaRegAddressCard />}
        onClick={(e) => {
          e.preventDefault();
          select('modal-about');
        }}
      >
        {m?.mainMenu.contacts}
      </Menu.Item>

      <Menu.Item
        component="a"
        href={m?.mainMenu.wikiLink}
        target="_blank"
        leftSection={<FaBook />}
      >
        {m?.mainMenu.osmWiki}
      </Menu.Item>

      {skCs && (
        <>
          <Menu.Item
            component="a"
            href="https://groups.google.com/forum/#!forum/osm_sk"
            target="_blank"
            leftSection={<FaUsers />}
          >
            Fórum slovenskej OSM komunity
          </Menu.Item>

          <Menu.Divider />
        </>
      )}

      {getDocuments(language)
        .filter((item) => item.listed !== false)
        .map(({ key, icon, title }) => (
          <Menu.Item
            key={key}
            component="a"
            href={`?document=${key}`}
            leftSection={icon}
            onClick={(e) => {
              e.preventDefault();
              select('document-' + key);
            }}
          >
            {title}
          </Menu.Item>
        ))}
    </>
  );
}
