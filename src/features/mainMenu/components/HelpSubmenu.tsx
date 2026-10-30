import { useMessages } from '@features/l10n/l10nInjector.js';
import { Text } from '@features/l10n/Text.js';
import { hasLegend } from '@features/legend/legendLayers.js';
import {
  drawnTypesSelector,
  libraryIndexSelector,
  resolvedCustomLayersSelector,
} from '@features/mapLibrary/model/selectors.js';
import { MenuLabel } from '@shared/components/MenuLabel.js';
import { OnlineOnlyItem } from '@shared/components/OnlineOnlyItem.js';
import { SubmenuHeader } from '@shared/components/SubmenuHeader.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import {
  documentMenuItemProps,
  modalMenuItemProps,
} from '@shared/hooks/useMenuHandler.js';
import type { JSX } from 'react';
import { Dropdown } from 'react-bootstrap';
import {
  FaBook,
  FaList,
  FaPowerOff,
  FaRegAddressCard,
  FaRegQuestionCircle,
  FaUsers,
} from 'react-icons/fa';
import { getDocuments } from '@/documents/index.js';

export function HelpSubmenu(): JSX.Element {
  const m = useMessages();

  const language = useAppSelector((state) => state.l10n.language);

  const skCs = ['sk', 'cs'].includes(language);

  const customLayers = useAppSelector(resolvedCustomLayersSelector);

  const layers = useAppSelector(drawnTypesSelector);

  const libraryIndex = useAppSelector(libraryIndexSelector);

  return (
    <>
      <SubmenuHeader icon={<FaBook />} title={m?.mainMenu.help} />

      <Dropdown.Item {...modalMenuItemProps('manual')}>
        <FaRegQuestionCircle />
        <MenuLabel>
          <Text k="mainMenu.manual" />
        </MenuLabel>
      </Dropdown.Item>

      {hasLegend(layers, libraryIndex, customLayers) && (
        <OnlineOnlyItem {...modalMenuItemProps('legend')}>
          <FaList />
          <MenuLabel>
            <Text k="mainMenu.mapLegend" />
          </MenuLabel>
        </OnlineOnlyItem>
      )}

      <Dropdown.Item {...modalMenuItemProps('about')}>
        <FaRegAddressCard />
        <MenuLabel>
          <Text k="mainMenu.contacts" />
        </MenuLabel>
      </Dropdown.Item>

      <OnlineOnlyItem
        href={m?.mainMenu.wikiLink}
        eventKey="url"
        target="_blank"
      >
        <FaBook />
        <MenuLabel>
          <Text k="mainMenu.osmWiki" />
        </MenuLabel>
      </OnlineOnlyItem>

      {skCs && (
        <>
          <OnlineOnlyItem
            href="https://groups.google.com/forum/#!forum/osm_sk"
            eventKey="url"
            target="_blank"
          >
            <FaUsers />
            <MenuLabel>Fórum slovenskej OSM komunity</MenuLabel>
          </OnlineOnlyItem>

          <Dropdown.Divider />
        </>
      )}

      {getDocuments(language)
        .filter((item) => item.listed !== false)
        .map(({ key, icon, title }) => (
          <Dropdown.Item key={key} {...documentMenuItemProps(key)}>
            {icon}
            <MenuLabel>{title}</MenuLabel>
          </Dropdown.Item>
        ))}

      <Dropdown.Divider />

      <Dropdown.Item as="button" eventKey="reset-app" className="text-danger">
        <FaPowerOff />
        <MenuLabel>
          <Text k="mapLayers.resetApp" />
        </MenuLabel>
      </Dropdown.Item>
    </>
  );
}
