import { l10nSetChosenLanguage } from 'fm3/actions/l10nActions';
import { useMessages } from 'fm3/l10nInjector';
import { useCallback } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { FaLanguage } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { SubmenuHeader, useMenuClose } from './SubmenuHeader';

export function LanguageSubmenu(): JSX.Element {
  const m = useMessages();

  const chosenLanguage = useSelector((state) => state.l10n.chosenLanguage);

  const dispatch = useDispatch();

  const closeMenu = useMenuClose();

  const handleLanguageClick = useCallback(
    (language: string | null) => {
      closeMenu();

      dispatch(l10nSetChosenLanguage(language));
    },
    [closeMenu, dispatch],
  );

  return (
    <>
      <SubmenuHeader icon={<FaLanguage />} title="Language / Jazyk / Nyelv" />

      <Dropdown.Item
        as="button"
        onSelect={handleLanguageClick}
        active={chosenLanguage === null}
      >
        {m?.mainMenu.automaticLanguage}
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="en"
        onSelect={handleLanguageClick}
        active={chosenLanguage === 'en'}
      >
        English
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="sk"
        onSelect={handleLanguageClick}
        active={chosenLanguage === 'sk'}
      >
        Slovensky
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="cs"
        onSelect={handleLanguageClick}
        active={chosenLanguage === 'cs'}
      >
        Česky
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        onSelect={handleLanguageClick}
        eventKey="hu"
        active={chosenLanguage === 'hu'}
      >
        Magyar
      </Dropdown.Item>
    </>
  );
}
