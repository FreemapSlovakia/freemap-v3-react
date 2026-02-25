import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { type ReactElement, useState } from 'react';
import { FaFacebook, FaGithub, FaMastodon, FaYoutube } from 'react-icons/fa';
import { MdDarkMode, MdHdrAuto, MdLightMode } from 'react-icons/md';

type Props = {
  closeMenu: () => void;
};

export function SocialButtons({ closeMenu }: Props): ReactElement {
  const m = useMessages();

  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem('fm.theme') ?? 'auto',
  );

  function setTheme(theme: 'dark' | 'light' | 'auto') {
    setCurrentTheme(theme);

    window.applyTheme(theme);
  }

  return (
    <div className="mx-3 d-flex gap-2 fs-5">
      <a
        onClick={closeMenu}
        href="https://en.osm.town/@FreemapSlovakia"
        target="_blank"
        rel="noopener noreferrer"
        className="fm-mastodonb-icon"
        title="Mastodon"
      >
        <FaMastodon />
      </a>

      <a
        onClick={closeMenu}
        href="https://www.facebook.com/FreemapSlovakia"
        target="_blank"
        rel="noopener noreferrer"
        className="fm-fb-icon"
        title={m?.mainMenu.facebook}
      >
        <FaFacebook />
      </a>

      <a
        onClick={closeMenu}
        href="https://www.youtube.com/channel/UCy0FrRnqJlc96dEpDIpNhIQ"
        target="_blank"
        rel="noopener noreferrer"
        className="fm-yt-icon"
        title={m?.mainMenu.youtube}
      >
        <FaYoutube />
      </a>

      <a
        onClick={closeMenu}
        href="https://github.com/FreemapSlovakia"
        target="_blank"
        rel="noopener noreferrer"
        className="fm-gh-icon flex-grow-1"
        title={m?.mainMenu.github}
      >
        <FaGithub />
      </a>

      <div className="d-flex border rounded px-1">
        {(['light', 'dark', 'auto'] as const).map((theme) => (
          <LongPressTooltip key={theme} label={m?.theme[theme]}>
            {({ props }) => (
              <button
                className={
                  'px-1 m-0 border-0 bg-transparent ' +
                  (currentTheme === theme ? 'text-primary' : 'text-body')
                }
                type="button"
                onClick={() => setTheme(theme)}
                {...props}
              >
                {
                  {
                    light: <MdLightMode />,
                    dark: <MdDarkMode />,
                    auto: <MdHdrAuto />,
                  }[theme]
                }
              </button>
            )}
          </LongPressTooltip>
        ))}
      </div>
    </div>
  );
}
