import { useMessages } from '@features/l10n/l10nInjector.js';
import { Emoji } from '@shared/components/Emoji.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { JSX } from 'react';
import { Dropdown } from 'react-bootstrap';
import { IoLanguage } from 'react-icons/io5';
import { languageItems } from './languageItems.js';
import { SubmenuHeader } from './SubmenuHeader.js';

export function LanguageSubmenu(): JSX.Element {
  const m = useMessages();

  const chosenLanguage = useAppSelector((state) => state.l10n.chosenLanguage);

  return (
    <>
      <SubmenuHeader icon={<IoLanguage />} title={m?.mainMenu.language} />

      <Dropdown.Item
        as="button"
        eventKey="lang-"
        active={chosenLanguage === null}
      >
        {m?.mainMenu.automaticLanguage}
      </Dropdown.Item>

      {languageItems.map(({ code, name, flag }) => (
        <Dropdown.Item
          key={code}
          as="button"
          eventKey={`lang-${code}`}
          active={chosenLanguage === code}
        >
          <Emoji>{flag}</Emoji>&ensp;{name}
        </Dropdown.Item>
      ))}
    </>
  );
}
