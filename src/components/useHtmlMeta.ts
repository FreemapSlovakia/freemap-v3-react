import { useMessages } from 'fm3/l10nInjector';
import { useEffect } from 'react';

export function useHtmlMeta(): void {
  const m = useMessages();

  useEffect(() => {
    if (!m) {
      return;
    }

    const { head } = document;

    const { title, description } = m.main;

    const titleElement = head.querySelector('title');

    if (titleElement) {
      titleElement.innerText = title;
    }

    document.title = title;

    head
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', description);

    head
      .querySelector('meta[property="og:title"]')
      ?.setAttribute('content', title);

    head
      .querySelector('meta[property="og:description"]')
      ?.setAttribute('content', description);
  }, [m]);
}
