import { Text } from '@features/l10n/Text.js';
import { useObjectsMessages } from '@features/objects/translations/useObjectsMessages.js';
import { wikiPage } from '@shared/components/OsmTagLinks.js';
import type { ReactElement, ReactNode } from 'react';
import type { WikiPreview } from '../model/actions.js';

export function articleUrl(lang: string, title: string): string {
  return `https://${lang}.wikipedia.org/wiki/${wikiPage(title)}`;
}

type Props = {
  article: WikiPreview;
  /** Between the text and its credit, as History is above the OSM source. */
  children?: ReactNode;
};

/** The article's own picture, where it has one. */
export function ArticleThumbnail({
  article,
}: {
  article: WikiPreview;
}): ReactElement | null {
  return article.thumbnail ? (
    <img
      src={article.thumbnail.source}
      width={article.thumbnail.width}
      height={article.thumbnail.height}
      alt={article.title}
      className="mb-3 mw-100 h-auto rounded"
    />
  ) : null;
}

/** The article's extract, credited as CC BY-SA requires of reused text. */
export function WikiArticleBody({ article, children }: Props): ReactElement {
  const om = useObjectsMessages();

  const href = articleUrl(article.lang, article.langTitle);

  return (
    <>
      {/* Wikipedia's own extract, tidied by `cleanExtract`. */}
      <div dangerouslySetInnerHTML={{ __html: article.extract }} />

      {children && <p className="mb-2">{children}</p>}

      <p className="mb-0">
        <Text m={om} k="source" />:{' '}
        {/* One named tab for every article link. */}
        <a href={href} target="wikipedia">
          Wikipedia
        </a>
        {' · '}
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noopener noreferrer"
        >
          CC BY-SA 4.0
        </a>
      </p>
    </>
  );
}
