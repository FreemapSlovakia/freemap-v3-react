import { Text } from '@features/l10n/Text.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { parseWikipediaTag } from '@shared/wikipediaTag.js';
import { type ReactElement, useState } from 'react';
import { Badge, Button } from 'react-bootstrap';
import { FaWikipediaW } from 'react-icons/fa';
import { useCached } from '../hooks/useCached.js';
import { useWikidataItem } from '../hooks/useWikidataItem.js';
import { fetchArticle, getJson } from '../model/article.js';
import { commonsFromTags } from '../model/commons.js';
import { isWikidataRef, type WikidataItem } from '../model/wikidata.js';
import { CommonsImages, useCommonsImages } from './CommonsImages.js';
import {
  ArticleThumbnail,
  articleUrl,
  WikiArticleBody,
} from './WikiArticleBody.js';
import { hasFacts, WikidataFacts } from './WikidataFacts.js';

type Tags = Record<string, string>;

interface ArticleRef {
  lang: string;
  title: string;
  /** Wikidata answered, so another edition is not looked for. */
  final: boolean;
}

/** The reader's edition where Wikidata knows it, else OSM's tag, else English. */
function pickArticle(
  tags: Tags,
  item: WikidataItem | undefined,
  language: string,
): ArticleRef | undefined {
  const own = item?.sitelinks[`${language}wiki`];

  if (own) {
    return { lang: language, title: own, final: true };
  }

  const tagged = parseWikipediaTag(tags['wikipedia']);

  if (tagged) {
    return { ...tagged, final: item !== undefined };
  }

  const en = item?.sitelinks['enwiki'];

  return en ? { lang: 'en', title: en, final: true } : undefined;
}

/** The object's Wikidata item: tagged, or the one its `wikipedia` article has. */
function wikidataRef(tags: Tags): string | undefined {
  // The first of several, as OSM separates them; `q42` as some write it.
  const qid = tags['wikidata']?.split(';')[0]?.trim().toUpperCase();

  if (qid && isWikidataRef(qid)) {
    return qid;
  }

  const tagged = parseWikipediaTag(tags['wikipedia']);

  return tagged
    ? `${tagged.lang.replaceAll('-', '_')}wiki:${tagged.title}`
    : undefined;
}

/** The object's Wikidata item and the Commons photos it and the tags name. */
function useObjectWiki(tags: Tags) {
  const loaded = useWikidataItem(wikidataRef(tags));

  const item = loaded.state === 'done' ? loaded.data : undefined;

  // Its item adds files, so asking before it is in would ask twice.
  const pending = loaded.state === 'loading';

  const fromTags = commonsFromTags(tags);

  const files = pending ? [] : [...fromTags.files, ...(item?.images ?? [])];

  const category = pending
    ? undefined
    : (fromTags.category ?? item?.commonsCategory);

  const commons = useCommonsImages(files, category);

  return { item, pending, files, category, commons };
}

/** Commons photos above an OSM object's tags. */
export function WikiObjectImages({ tags }: { tags: Tags }): ReactElement {
  const { files, category } = useObjectWiki(tags);

  return <CommonsImages files={files} category={category} />;
}

/** Wikidata facts and the Wikipedia article, below an OSM object's tags. */
export function WikiObjectSection({ tags }: { tags: Tags }): ReactElement {
  const language = useAppSelector((state) => state.l10n.language);

  const { item, pending, commons } = useObjectWiki(tags);

  // Wikidata may name the reader's own article; wait for it.
  const article = pending ? undefined : pickArticle(tags, item, language);

  // Only once the carousel above is known to have no photos, the article's would
  // repeat; while it loads, so it doesn't show and then vanish.
  const showThumbnail =
    commons.loaded.state === 'idle' ||
    commons.loaded.state === 'error' ||
    (commons.loaded.state === 'done' && commons.loaded.data.length === 0);

  return (
    <>
      {/* Parts the OSM source above doesn't cover. */}
      {(article || hasFacts(item)) && <hr />}

      {item && <WikidataFacts item={item} />}

      {article && (
        <div className="mb-3">
          <Article
            // Its own "Show more", per article.
            key={`${article.lang}:${article.title}`}
            article={article}
            showThumbnail={showThumbnail}
          />
        </div>
      )}
    </>
  );
}

function Article({
  article: { lang, title, final },
  showThumbnail,
}: {
  article: ArticleRef;
  showThumbnail: boolean;
}) {
  const language = useAppSelector((state) => state.l10n.language);

  // Times "Show more" was pressed: each one after a failure asks again.
  const [tries, setTries] = useState(0);

  const key = `article:${language}:${lang}:${title}`;

  // The opening, a few kB, at once.
  const intro = useCached(`${key}:intro`, () =>
    fetchArticle(getJson, lang, title, final ? lang : language, true),
  );

  const resolved = intro.state === 'done' ? intro.data : undefined;

  // Read outside the loader: the React Compiler reads a closure's member
  // dependencies at render, which would throw while `resolved` is unset.
  const fullLang = resolved?.lang ?? lang;

  const fullTitle = resolved?.langTitle ?? title;

  // The rest only when asked for, of the edition the opening found; not kept.
  const full = useCached(
    tries && resolved ? `${key}#${tries}` : null,
    () => fetchArticle(getJson, fullLang, fullTitle, fullLang, false),
    false,
  );

  const shown = full.state === 'done' ? full.data : resolved;

  return (
    <>
      <p className="fw-semibold mb-2">
        <FaWikipediaW /> {shown?.title ?? title}
        {(shown?.lang ?? lang) !== language && (
          <Badge bg="secondary" className="ms-2">
            {shown?.lang ?? lang}
          </Badge>
        )}
      </p>

      {shown ? (
        <>
          {showThumbnail && <ArticleThumbnail article={shown} />}

          <WikiArticleBody article={shown}>
            {full.state !== 'done' && (
              <Button
                size="sm"
                variant="secondary"
                disabled={full.state === 'loading'}
                onClick={() => {
                  setTries((n) => n + 1);

                  trackMatomo(['trackEvent', 'Wiki', 'article']);
                }}
              >
                <Text k="general.showMore" />
              </Button>
            )}
          </WikiArticleBody>
        </>
      ) : intro.state === 'error' ? (
        <a href={articleUrl(lang, title)} target="wikipedia">
          Wikipedia
        </a>
      ) : (
        <Text k="general.loading" />
      )}
    </>
  );
}
