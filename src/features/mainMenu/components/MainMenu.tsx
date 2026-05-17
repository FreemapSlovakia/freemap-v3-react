import { useMessages } from '@features/l10n/l10nInjector.js';
import { Kbd, Menu } from '@mantine/core';
import { useMenuSelect } from '@shared/components/menuSelectContext.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { toolDefinitions } from '@shared/toolDefinitions.js';
import { type ReactElement } from 'react';
import {
  FaBook,
  FaBullseye,
  FaCamera,
  FaChevronRight,
  FaCode,
  FaDownload,
  FaEraser,
  FaExternalLinkAlt,
  FaHeart,
  FaMobileAlt,
  FaPencilRuler,
  FaPrint,
  FaRegMap,
  FaSignInAlt,
  FaUser,
} from 'react-icons/fa';
import { IoLanguage } from 'react-icons/io5';
import { LanguageLabel } from './LanguageLabel.js';

export function MainMenu(): ReactElement {
  const user = useAppSelector((state) => state.auth.user);

  const galleryActive = useAppSelector((state) =>
    state.map.layers.includes('I'),
  );

  const tool = useAppSelector((state) => state.main.tool);

  const toolDef = toolDefinitions.find((t) => t.tool === tool);

  const m = useMessages();

  const select = useMenuSelect();

  return (
    <>
      <Menu.Item
        leftSection={<IoLanguage />}
        rightSection={<FaChevronRight />}
        onClick={() => select('submenu-language')}
      >
        <LanguageLabel>{(language) => language}</LanguageLabel>
      </Menu.Item>

      {user ? (
        <Menu.Item
          component="a"
          href="#show=account"
          leftSection={<FaUser />}
          rightSection={
            <>
              <Kbd>e</Kbd> <Kbd>a</Kbd>
            </>
          }
          onClick={(e) => {
            e.preventDefault();
            select('modal-account');
          }}
        >
          {m?.mainMenu.account}
        </Menu.Item>
      ) : (
        <Menu.Item
          leftSection={<FaSignInAlt />}
          onClick={() => select('modal-login')}
        >
          {m?.mainMenu.logIn}
        </Menu.Item>
      )}

      <Menu.Divider />

      <Menu.Item
        leftSection={<FaEraser />}
        rightSection={
          <>
            <Kbd>g</Kbd> <Kbd>c</Kbd>
          </>
        }
        onClick={() => select('clear-map-features')}
      >
        {m?.main.clearMap}
      </Menu.Item>

      <Menu.Item
        component="a"
        href="?layers=I"
        leftSection={<FaCamera />}
        rightSection={<Kbd>⇧f</Kbd>}
        color={galleryActive ? 'blue' : undefined}
        onClick={(e) => {
          e.preventDefault();
          select('gallery');
        }}
      >
        {m?.tools.photos}
      </Menu.Item>

      <Menu.Item
        leftSection={<FaRegMap />}
        rightSection={
          <>
            <Kbd>g</Kbd> <Kbd>m</Kbd>
          </>
        }
        onClick={() => select('modal-maps')}
      >
        {m?.tools.maps}
      </Menu.Item>

      <Menu.Item
        leftSection={<FaPencilRuler />}
        onClick={() => select('drawing')}
      >
        {m?.tools.measurement}
      </Menu.Item>

      {toolDefinitions
        .filter(({ draw }) => !draw)
        .map(
          ({ tool: newTool, icon, msgKey, kbd }) =>
            newTool && (
              <Menu.Item
                key={newTool}
                component="a"
                href={`?tool=${tool}`}
                leftSection={icon}
                rightSection={
                  kbd ? (
                    <>
                      <Kbd>g</Kbd>{' '}
                      <Kbd>{kbd.replace(/Key/, '').toLowerCase()}</Kbd>
                    </>
                  ) : null
                }
                color={toolDef?.tool === newTool ? 'blue' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  select('tool-' + newTool);
                }}
              >
                {m?.tools[msgKey]}
              </Menu.Item>
            ),
        )}

      <Menu.Item
        leftSection={<FaBullseye />}
        rightSection={<FaChevronRight />}
        onClick={() => select('submenu-tracking')}
      >
        {m?.tools.tracking}
      </Menu.Item>

      <Menu.Divider />

      <Menu.Item
        leftSection={<FaExternalLinkAlt />}
        rightSection={<FaChevronRight />}
        onClick={() => select('submenu-openExternally')}
      >
        {m?.external.openInExternal}
      </Menu.Item>

      <Menu.Item
        component="a"
        href="#show=export-map"
        leftSection={<FaPrint />}
        rightSection={
          <>
            <Kbd>e</Kbd> <Kbd>p</Kbd>
          </>
        }
        onClick={(e) => {
          e.preventDefault();
          select('modal-export-map');
        }}
      >
        {m?.mainMenu.mapExport}
      </Menu.Item>

      <Menu.Item
        component="a"
        href="#show=export-map-features"
        leftSection={<FaDownload />}
        rightSection={
          <>
            <Kbd>e</Kbd> <Kbd>g</Kbd>
          </>
        }
        onClick={(e) => {
          e.preventDefault();
          select('modal-export-map-features');
        }}
      >
        {m?.mainMenu.mapFeaturesExport}
      </Menu.Item>

      <Menu.Item
        component="a"
        href="#document=exports"
        leftSection={<FaMobileAlt />}
        onClick={(e) => {
          e.preventDefault();
          select('document-exports');
        }}
      >
        {m?.mainMenu.mapExports}
      </Menu.Item>

      <Menu.Item
        component="a"
        href="#show=download-map"
        leftSection={<FaDownload />}
        rightSection={
          <>
            <Kbd>e</Kbd> <Kbd>m</Kbd>
          </>
        }
        onClick={(e) => {
          e.preventDefault();
          select('modal-download-map');
        }}
      >
        {m?.downloadMap.downloadMap}
      </Menu.Item>

      <Menu.Item
        component="a"
        href="#show=embed"
        leftSection={<FaCode />}
        rightSection={
          <>
            <Kbd>e</Kbd> <Kbd>e</Kbd>
          </>
        }
        onClick={(e) => {
          e.preventDefault();
          select('modal-embed');
        }}
      >
        {m?.mainMenu.embedMap}
      </Menu.Item>

      <Menu.Divider />

      <Menu.Item
        leftSection={<FaBook />}
        rightSection={<FaChevronRight />}
        onClick={() => select('submenu-help')}
      >
        {m?.mainMenu.help}
      </Menu.Item>

      <Menu.Item
        component="a"
        href="#show=support-us"
        leftSection={<FaHeart color="red" />}
        rightSection={<FaHeart color="red" />}
        onClick={(e) => {
          e.preventDefault();
          select('modal-support-us');
        }}
      >
        {m?.mainMenu.supportUs}
      </Menu.Item>
    </>
  );
}
