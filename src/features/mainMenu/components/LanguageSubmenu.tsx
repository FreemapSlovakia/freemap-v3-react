import { useMessages } from '@features/l10n/l10nInjector.js';
import { Emoji } from '@shared/components/Emoji.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type Language, languages } from '@shared/langUtils.js';
import type { JSX } from 'react';
import { Dropdown } from 'react-bootstrap';
import { IoLanguage } from 'react-icons/io5';
import { LanguageLabel } from './LanguageLabel.js';
import { SubmenuHeader } from './SubmenuHeader.js';

const languageNames: Record<Language, string> = {
  sk: 'Slovensky',
  cs: 'Česky',
  pl: 'Polski',
  hu: 'Magyar',
  en: 'English',
  de: 'Deutsch',
  it: 'Italiano',
  sl: 'Slovenščina',
  fr: 'Français',
};

// The flag's country code matches the language code for most languages; only
// these differ.
const flagCountries: Partial<Record<Language, string>> = {
  cs: 'cz',
  en: 'gb',
  sl: 'si',
};

function toFlag(language: Language): string {
  const country = flagCountries[language] ?? language;

  return String.fromCodePoint(
    ...[...country.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 0x41),
  );
}

// Menu order depends on the domain: freemap.sk leads with Slovak (home site)
// then English; other domains (freemap.eu, …) lead with English. The remaining
// languages follow alphabetically by endonym. Deriving the tail by sorting
// `languages` keeps any newly added language in the menu automatically.
function getOrderedLanguages(): Language[] {
  const pinned: Language[] = window.location.hostname.endsWith('freemap.sk')
    ? ['sk', 'en']
    : ['en'];

  const rest = languages
    .filter((code) => !pinned.includes(code))
    .sort((a, b) => languageNames[a].localeCompare(languageNames[b]));

  return [...pinned, ...rest];
}

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

      {getOrderedLanguages().map((code) => (
        <Dropdown.Item
          key={code}
          as="button"
          eventKey={`lang-${code}`}
          active={chosenLanguage === code}
        >
          <Emoji>{toFlag(code)}</Emoji>&ensp;{languageNames[code]}
        </Dropdown.Item>
      ))}
    </>
  );
}
