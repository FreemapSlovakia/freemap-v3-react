import { useMessages } from '@features/l10n/l10nInjector.js';
import { Emoji } from '@shared/components/Emoji.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { JSX } from 'react';
import { Dropdown } from 'react-bootstrap';
import { IoLanguage } from 'react-icons/io5';
import { LanguageLabel } from './LanguageLabel.js';
import { SubmenuHeader } from './SubmenuHeader.js';

export function LanguageSubmenu(): JSX.Element {
  const m = useMessages();

  const chosenLanguage = useAppSelector((state) => state.l10n.chosenLanguage);

  return (
    <>
      <SubmenuHeader
        icon={<IoLanguage />}
        title={<LanguageLabel>{(language) => language}</LanguageLabel>}
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
        eventKey="lang-sk"
        active={chosenLanguage === 'sk'}
      >
        <Emoji>🇸🇰</Emoji>&ensp;Slovensky
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="lang-cs"
        active={chosenLanguage === 'cs'}
      >
        <Emoji>🇨🇿</Emoji>&ensp;Česky
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="lang-pl"
        active={chosenLanguage === 'pl'}
      >
        <Emoji>🇵🇱</Emoji>&ensp;Polski
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="lang-hu"
        active={chosenLanguage === 'hu'}
      >
        <Emoji>🇭🇺</Emoji>&ensp;Magyar
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="lang-en"
        active={chosenLanguage === 'en'}
      >
        <Emoji>🇬🇧</Emoji>&ensp;English
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="lang-de"
        active={chosenLanguage === 'de'}
      >
        <Emoji>🇩🇪</Emoji>&ensp;Deutsch
      </Dropdown.Item>

      <Dropdown.Item
        as="button"
        eventKey="lang-it"
        active={chosenLanguage === 'it'}
      >
        <Emoji>🇮🇹</Emoji>&ensp;Italiano
      </Dropdown.Item>
    </>
  );
}
