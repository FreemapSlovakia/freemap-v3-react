import { useMessages } from '@features/l10n/l10nInjector.js';
import { expandSite, siteOf } from '@shared/sites.js';
import { useEffect } from 'react';
import { useDocumentSubTitle } from '../hooks/useDocumentTitle.js';

// Keeps the document title and social meta in sync with the current language
// and the active modal's title. The title prefix is contributed per-modal via
// `useDocumentTitle`; here we only read the resolved value and update the
// static tags that `index.ejs` renders (mutated in place, never re-created, so
// the build-time SEO/prerender markup stays intact). The portal name in the
// title follows the domain, not the language, so every language served from
// freemap.sk says Freemap Slovakia.
export function useHtmlMeta(): void {
  const m = useMessages();

  const subTitle = useDocumentSubTitle();

  useEffect(() => {
    if (!m) {
      return;
    }

    const { head } = document;

    const { description } = m.main;

    const title = expandSite(m.main.title, siteOf(location.hostname));

    const titleElement = head.querySelector('title');

    const fullTitle = (subTitle ? `${subTitle} | ` : '') + title;

    if (titleElement) {
      titleElement.innerText = fullTitle;
    }

    document.title = fullTitle;

    head
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', description);

    head
      .querySelector('meta[property="og:title"]')
      ?.setAttribute('content', fullTitle);

    head
      .querySelector('meta[property="og:description"]')
      ?.setAttribute('content', description);
  }, [m, subTitle]);
}
