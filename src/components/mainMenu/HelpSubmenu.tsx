import { Modal, setActiveModal } from 'fm3/actions/mainActions';
import { tipsShow } from 'fm3/actions/tipsActions';
import { useMessages } from 'fm3/l10nInjector';
import { TipKey, tips } from 'fm3/tips';
import { SyntheticEvent, useCallback } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import {
  FaBook,
  FaRegAddressCard,
  FaRegLightbulb,
  FaRegMap,
  FaUsers,
} from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { is } from 'typescript-is';
import { SubmenuHeader, useMenuClose } from './SubmenuHeader';

export function HelpSubmenu(): JSX.Element {
  const m = useMessages();

  const language = useSelector((state) => state.l10n.language);

  const skCz = ['sk', 'cs'].includes(language);

  const mapType = useSelector((state) => state.map.mapType);

  const dispatch = useDispatch();

  const closeMenu = useMenuClose();

  const showModal = useCallback(
    (modal: string | null, e: SyntheticEvent<unknown>) => {
      e.preventDefault();

      closeMenu();

      if (is<Modal>(modal)) {
        dispatch(setActiveModal(modal));
      }
    },
    [closeMenu, dispatch],
  );

  const handleTipSelect = useCallback(
    (tip: string | null, e: SyntheticEvent<unknown>) => {
      e.preventDefault();

      closeMenu();

      if (is<TipKey>(tip)) {
        dispatch(tipsShow(tip));
      }
    },
    [closeMenu, dispatch],
  );

  return (
    <>
      <SubmenuHeader icon={<FaBook />} title={m?.mainMenu.help} />

      {(skCz ? ['A', 'K', 'T', 'C', 'X', 'O'] : ['X', 'O']).includes(
        mapType,
      ) && (
        <Dropdown.Item
          href="?show=legend"
          eventKey="legend"
          onSelect={showModal}
        >
          <FaRegMap /> {m?.mainMenu.mapLegend}
        </Dropdown.Item>
      )}

      <Dropdown.Item eventKey="about" href="?show=about" onSelect={showModal}>
        <FaRegAddressCard /> {m?.mainMenu.contacts}
      </Dropdown.Item>

      <Dropdown.Item
        href={m?.mainMenu.wikiLink}
        onSelect={closeMenu}
        target="_blank"
      >
        <FaBook /> {m?.mainMenu.osmWiki}
      </Dropdown.Item>

      {skCz && (
        <Dropdown.Item
          href="https://groups.google.com/forum/#!forum/osm_sk"
          onSelect={closeMenu}
          target="_blank"
        >
          <FaUsers /> Fórum slovenskej OSM komunity
        </Dropdown.Item>
      )}

      {skCz && (
        <>
          <Dropdown.Divider />
          <Dropdown.Header>
            <FaRegLightbulb /> {m?.mainMenu.tips}
          </Dropdown.Header>
          {tips.map(([key, name, icon, hidden]) =>
            hidden ? null : (
              <Dropdown.Item
                key={key}
                href={`?tip=${key}`}
                onSelect={handleTipSelect}
                eventKey={key}
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
