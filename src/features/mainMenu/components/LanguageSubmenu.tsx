import { useMessages } from '@features/l10n/l10nInjector.js';
import { Menu } from '@mantine/core';
import { Emoji } from '@shared/components/Emoji.js';
import { useMenuSelect } from '@shared/components/menuSelectContext.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { JSX } from 'react';
import { IoLanguage } from 'react-icons/io5';
import { LanguageLabel } from './LanguageLabel.js';
import { SubmenuHeader } from './SubmenuHeader.js';

export function LanguageSubmenu(): JSX.Element {
  const m = useMessages();

  const chosenLanguage = useAppSelector((state) => state.l10n.chosenLanguage);

  const select = useMenuSelect();

  return (
    <>
      <SubmenuHeader
        icon={<IoLanguage />}
        title={<LanguageLabel>{(language) => language}</LanguageLabel>}
      />

      <Menu.Item
        color={chosenLanguage === null ? 'blue' : undefined}
        onClick={() => select('lang-')}
      >
        {m?.mainMenu.automaticLanguage}
      </Menu.Item>

      <Menu.Item
        leftSection={<Emoji>🇸🇰</Emoji>}
        color={chosenLanguage === 'sk' ? 'blue' : undefined}
        onClick={() => select('lang-sk')}
      >
        Slovensky
      </Menu.Item>

      <Menu.Item
        leftSection={<Emoji>🇨🇿</Emoji>}
        color={chosenLanguage === 'cs' ? 'blue' : undefined}
        onClick={() => select('lang-cs')}
      >
        Česky
      </Menu.Item>

      <Menu.Item
        leftSection={<Emoji>🇵🇱</Emoji>}
        color={chosenLanguage === 'pl' ? 'blue' : undefined}
        onClick={() => select('lang-pl')}
      >
        Polski
      </Menu.Item>

      <Menu.Item
        leftSection={<Emoji>🇭🇺</Emoji>}
        color={chosenLanguage === 'hu' ? 'blue' : undefined}
        onClick={() => select('lang-hu')}
      >
        Magyar
      </Menu.Item>

      <Menu.Item
        leftSection={<Emoji>🇬🇧</Emoji>}
        color={chosenLanguage === 'en' ? 'blue' : undefined}
        onClick={() => select('lang-en')}
      >
        English
      </Menu.Item>

      <Menu.Item
        leftSection={<Emoji>🇩🇪</Emoji>}
        color={chosenLanguage === 'de' ? 'blue' : undefined}
        onClick={() => select('lang-de')}
      >
        Deutsch
      </Menu.Item>

      <Menu.Item
        leftSection={<Emoji>🇮🇹</Emoji>}
        color={chosenLanguage === 'it' ? 'blue' : undefined}
        onClick={() => select('lang-it')}
      >
        Italiano
      </Menu.Item>
    </>
  );
}
