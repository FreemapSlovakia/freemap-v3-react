import { useMessages } from 'fm3/l10nInjector';
import { ReactElement } from 'react';
import { FaFacebook, FaGithub, FaTwitter, FaYoutube } from 'react-icons/fa';
import { useMenuClose } from './SubmenuHeader';

type Props = {
  className?: string;
};

export function SocialButtons({ className }: Props): ReactElement {
  const closeMenu = useMenuClose();

  const m = useMessages();

  return (
    <div style={{ fontSize: '1.2rem' }} className={className}>
      <a
        onSelect={closeMenu}
        href="https://www.facebook.com/FreemapSlovakia"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#3b5998' }}
        title={m?.mainMenu.facebook}
      >
        <FaFacebook />
      </a>{' '}
      <a
        onSelect={closeMenu}
        href="https://twitter.com/FreemapSlovakia"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#0084b4' }}
        title={m?.mainMenu.twitter}
      >
        <FaTwitter />
      </a>{' '}
      <a
        onSelect={closeMenu}
        href="https://www.youtube.com/channel/UCy0FrRnqJlc96dEpDIpNhIQ"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#ff0000' }}
        title={m?.mainMenu.youtube}
      >
        <FaYoutube />
      </a>{' '}
      <a
        onSelect={closeMenu}
        href="https://github.com/FreemapSlovakia"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#333' }}
        title={m?.mainMenu.github}
      >
        <FaGithub />
      </a>
    </div>
  );
}
