import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import clsx from 'clsx';
import storage from 'local-storage-fallback';
import { type ReactElement, useState } from 'react';
import {
  FaAndroid,
  FaApple,
  FaFacebook,
  FaGithub,
  FaMastodon,
  FaYoutube,
} from 'react-icons/fa';
import { MdDarkMode, MdHdrAuto, MdLightMode } from 'react-icons/md';

type Props = {
  closeMenu: () => void;
};

export function SocialButtons({ closeMenu }: Props): ReactElement {
  const m = useMessages();

  const [currentTheme, setCurrentTheme] = useState(
    storage.getItem('fm.theme') ?? 'auto',
  );

  function setTheme(theme: 'dark' | 'light' | 'auto') {
    setCurrentTheme(theme);

    if (theme === 'auto') {
      storage.removeItem('fm.theme');
    } else {
      storage.setItem('fm.theme', theme);
    }

    window.applyTheme(theme);
  }

  return (
    <div className="mx-3 d-flex gap-2 fs-5">
      <LongPressTooltip label={m?.mainMenu.mastodon}>
        {({ props }) => (
          <a
            onClick={closeMenu}
            href="https://en.osm.town/@FreemapSlovakia"
            target="_blank"
            rel="noopener noreferrer"
            className="fm-mastodonb-icon"
            {...props}
          >
            <FaMastodon />
          </a>
        )}
      </LongPressTooltip>

      <LongPressTooltip label={m?.mainMenu.facebook}>
        {({ props }) => (
          <a
            onClick={closeMenu}
            href="https://www.facebook.com/FreemapSlovakia"
            target="_blank"
            rel="noopener noreferrer"
            className="fm-fb-icon"
            {...props}
          >
            <FaFacebook />
          </a>
        )}
      </LongPressTooltip>

      <LongPressTooltip label={m?.mainMenu.youtube}>
        {({ props }) => (
          <a
            onClick={closeMenu}
            href="https://www.youtube.com/channel/UCy0FrRnqJlc96dEpDIpNhIQ"
            target="_blank"
            rel="noopener noreferrer"
            className="fm-yt-icon"
            {...props}
          >
            <FaYoutube />
          </a>
        )}
      </LongPressTooltip>

      <LongPressTooltip label={m?.mainMenu.github}>
        {({ props }) => (
          <a
            onClick={closeMenu}
            href="https://github.com/FreemapSlovakia"
            target="_blank"
            rel="noopener noreferrer"
            className="fm-github-icon"
            {...props}
          >
            <FaGithub />
          </a>
        )}
      </LongPressTooltip>

      <LongPressTooltip label={m?.mainMenu.googlePlay}>
        {({ props }) => (
          <a
            onClick={closeMenu}
            href="https://play.google.com/store/apps/details?id=sk.bigware.freemap"
            target="_blank"
            rel="noopener noreferrer"
            className="fm-android-icon"
            {...props}
          >
            <FaAndroid />
          </a>
        )}
      </LongPressTooltip>

      <LongPressTooltip label={m?.mainMenu.appStore}>
        {({ props }) => (
          <a
            onClick={closeMenu}
            href="https://apps.apple.com/sk/app/freemap/id6760855105"
            target="_blank"
            rel="noopener noreferrer"
            className="fm-apple-icon flex-grow-1"
            {...props}
          >
            <FaApple />
          </a>
        )}
      </LongPressTooltip>

      <div className="d-flex border rounded px-1">
        {(['light', 'dark', 'auto'] as const).map((theme) => (
          <LongPressTooltip key={theme} label={m?.theme[theme]}>
            {({ props }) => (
              <button
                className={clsx(
                  'px-1',
                  'm-0',
                  'border-0',
                  'bg-transparent',
                  currentTheme === theme ? 'text-primary' : 'text-body',
                )}
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
