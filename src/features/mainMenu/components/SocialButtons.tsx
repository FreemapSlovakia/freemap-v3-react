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
import {
  MdDarkMode,
  MdHdrAuto,
  MdLightMode,
  MdMonitorHeart,
} from 'react-icons/md';
import classes from './SocialButtons.module.css';

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
    <div className="mx-3 d-flex gap-2 fs-5 flex-wrap">
      <LongPressTooltip label={m?.mainMenu.mastodon}>
        {({ props }) => (
          <a
            onClick={closeMenu}
            href="https://en.osm.town/@FreemapSlovakia"
            target="_blank"
            rel="noopener noreferrer"
            className={classes['mastodon-icon']}
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
            className={classes['fb-icon']}
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
            className={classes['yt-icon']}
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
            className={classes['github-icon']}
            {...props}
          >
            <FaGithub />
          </a>
        )}
      </LongPressTooltip>

      <div className="vr" />

      <LongPressTooltip label={m?.mainMenu.googlePlay}>
        {({ props }) => (
          <a
            onClick={closeMenu}
            href="https://play.google.com/store/apps/details?id=sk.bigware.freemap"
            target="_blank"
            rel="noopener noreferrer"
            className={classes['android-icon']}
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
            className={classes['apple-icon']}
            {...props}
          >
            <FaApple />
          </a>
        )}
      </LongPressTooltip>

      <div className="vr" />

      <LongPressTooltip label={m?.mainMenu.status}>
        {({ props }) => (
          <a
            onClick={closeMenu}
            href="https://status.freemap.sk/status/all"
            target="_blank"
            rel="noopener noreferrer"
            className={classes['apple-icon']}
            {...props}
          >
            <MdMonitorHeart />
          </a>
        )}
      </LongPressTooltip>

      <div className="flex-grow-1" />

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
