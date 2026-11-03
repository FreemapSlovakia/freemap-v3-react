import { setActiveModal } from '@app/store/actions.js';
import { decodeActiveModal } from '@app/store/activeModal.js';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { locusInstall, oruxMapsDownload } from '../model/actions.js';

/** Makes the app's own links in rendered markdown act in place. */
export function useMarkdownLinks(root: HTMLElement | null, loaded: boolean) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!loaded || !root) {
      return;
    }

    for (const a of root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
      a.onclick = (e) => {
        const { href } = a;

        e.preventDefault();

        const i = href.lastIndexOf('#');

        if (i === -1) {
          return;
        }

        const sp = new URLSearchParams(href.slice(i + 1));

        if (sp.size !== 1) {
          return;
        }

        const document = sp.get('document');

        const modal = decodeActiveModal(
          document === null ? (sp.get('show') ?? '') : `document/${document}`,
        );

        if (modal) {
          dispatch(setActiveModal(modal));
        }
      };
    }

    for (const a of root.querySelectorAll<HTMLAnchorElement>(
      'a[href^="locus-actions:"][href$="/locus/install"]',
    )) {
      a.onclick = (e) => {
        e.preventDefault();

        dispatch(locusInstall());
      };
    }

    for (const a of root.querySelectorAll<HTMLAnchorElement>(
      'a[href$="/oruxmaps/onlinemapsources.xml"]',
    )) {
      a.onclick = (e) => {
        e.preventDefault();

        dispatch(oruxMapsDownload());
      };
    }
  }, [loaded, root, dispatch]);
}
