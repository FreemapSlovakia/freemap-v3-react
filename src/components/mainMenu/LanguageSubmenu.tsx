import { JSX } from 'react';
import { Dropdown } from 'react-bootstrap';
import { FaLanguage } from 'react-icons/fa';
import { useAppSelector } from '../../hooks/reduxSelectHook.js';
import { useMessages } from '../../l10nInjector.js';
import { SubmenuHeader } from './SubmenuHeader.js';

export function LanguageSubmenu(): JSX.Element {
  const m = useMessages();

  const chosenLanguage = useAppSelector((state) => state.l10n.chosenLanguage);

  return (
    <>
      <SubmenuHeader
        icon={<FaLanguage />}
        title="Language / Jazyk / Nyelv / Lingua"
      />

      <Dropdown.Item
        as="button"
        eventKey="lang-"
        active={chosenLanguage === null}
      >
        {m?.mainMenu.automaticLanguage}
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="lang-en"
        active={chosenLanguage === 'en'}
      >
        🇬🇧 English
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="lang-sk"
        active={chosenLanguage === 'sk'}
      >
        🇸🇰 Slovensky
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="lang-cs"
        active={chosenLanguage === 'cs'}
      >
        🇨🇿 Česky
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="lang-hu"
        active={chosenLanguage === 'hu'}
      >
        🇭🇺 Magyar
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="lang-it"
        active={chosenLanguage === 'it'}
      >
        🇮🇹 Italiano
      </Dropdown.Item>
    </>
  );
}
