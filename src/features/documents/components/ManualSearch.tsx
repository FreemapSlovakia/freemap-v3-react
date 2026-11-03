import { useMessages } from '@features/l10n/l10nInjector.js';
import { Text } from '@features/l10n/Text.js';
import { matchLabel } from '@shared/labelMatch.js';
import { type ReactElement, type ReactNode, useEffect, useState } from 'react';
import { ListGroup, Spinner } from 'react-bootstrap';
import type { MarkdownEntry } from 'virtual/markdown-dict.js';
import {
  type ManualHit,
  type ManualSection,
  searchSections,
  sectionsOf,
} from '@/manual/search.js';
import { loadManualChapter } from '../loadManualChapter.js';

/** A chapter and, from a text hit, which of its sections to scroll to. */
export type ManualTarget = { key: string; section: number };

/** Every chapter's sections, by `<key>.<lang>`; read once per session. */
const sectionCache = new Map<string, ManualSection[]>();

/**
 * The sections of all `chapters`, loaded once `enabled`: the text is in the
 * chapters' own chunks, fetched only for a search.
 */
function useManualSections(
  chapters: readonly MarkdownEntry[],
  enabled: boolean,
): ManualSection[] | undefined {
  // Tagged with the chapters they were read for, so another language's text is
  // never searched while this one's loads.
  const [loaded, setLoaded] = useState<{
    chapters: readonly MarkdownEntry[];
    sections: ManualSection[];
  }>();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;

    // A chapter that won't load (a stale chunk after a deploy) is left out of
    // the search; the others still count.
    void Promise.allSettled(
      chapters.map(async ({ key, lang }) => {
        const id = `${key}.${lang}`;

        let cached = sectionCache.get(id);

        if (!cached) {
          const { default: html } = await loadManualChapter(key, lang);

          cached = sectionsOf(key, html);

          sectionCache.set(id, cached);
        }

        return cached;
      }),
    ).then((results) => {
      if (!cancelled) {
        setLoaded({
          chapters,
          sections: results.flatMap((r) =>
            r.status === 'fulfilled' ? r.value : [],
          ),
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [chapters, enabled]);

  return enabled && loaded?.chapters === chapters ? loaded.sections : undefined;
}

export type ManualSearch = ReturnType<typeof useManualSearch>;

type Props = {
  search: ManualSearch;
  chapters: readonly MarkdownEntry[];
  onSelect: (target: ManualTarget) => void;
  className?: string;
};

/**
 * Chapters found by title or search-box keywords, ranked as the search box
 * ranks them, then the sections holding every word of the query.
 */
export function useManualSearch(
  query: string,
  chapters: readonly MarkdownEntry[],
) {
  const m = useMessages();

  const keywords = m?.search.commands.keywords;

  const sections = useManualSections(chapters, query.trim().length >= 2);

  const titleHits = chapters
    .flatMap((chapter) => {
      const hit = matchLabel(
        query,
        chapter.title ?? chapter.key,
        keywords?.[`manual-${chapter.key}`],
      );

      return hit ? [{ chapter, score: hit.score }] : [];
    })
    .toSorted((a, b) => b.score - a.score)
    .map(({ chapter }) => chapter);

  const textHits = sections ? searchSections(query, sections) : undefined;

  const first: ManualTarget | undefined = titleHits[0]
    ? { key: titleHits[0].key, section: 0 }
    : textHits?.[0];

  return { titleHits, textHits, first };
}

export function ManualSearchResults({
  search: { titleHits, textHits },
  chapters,
  onSelect,
  className,
}: Props): ReactElement {
  const byKey = new Map(chapters.map((chapter) => [chapter.key, chapter]));

  return (
    <div className={className}>
      <ListGroup variant="flush">
        {titleHits.map(({ key, icon, title }) => (
          <ListGroup.Item
            key={key}
            action
            href={`#show=manual/${key}`}
            onClick={(e) => {
              e.preventDefault();

              onSelect({ key, section: 0 });
            }}
          >
            {icon} {title}
          </ListGroup.Item>
        ))}

        {textHits?.map((hit) => (
          <ListGroup.Item
            key={`${hit.key}/${hit.section}`}
            action
            href={`#show=manual/${hit.key}`}
            onClick={(e) => {
              e.preventDefault();

              onSelect(hit);
            }}
          >
            <div className="small fw-semibold">
              {byKey.get(hit.key)?.icon} {byKey.get(hit.key)?.title}
              {hit.heading && <> › {hit.heading}</>}
            </div>

            <div className="small text-body-secondary">{marked(hit)}</div>
          </ListGroup.Item>
        ))}
      </ListGroup>

      {textHits === undefined ? (
        <div className="p-2 small text-body-secondary">
          <Spinner animation="border" size="sm" className="me-2" />
          <Text k="general.loading" />
        </div>
      ) : (
        titleHits.length + textHits.length === 0 && (
          <div className="p-2 small text-body-secondary">
            <Text k="search.noResults" />
          </div>
        )
      )}
    </div>
  );
}

function marked({ snippet, marks }: ManualHit): ReactNode[] {
  const out: ReactNode[] = [];

  let at = 0;

  for (const [start, end] of marks) {
    out.push(
      snippet.slice(at, start),
      <mark key={start}>{snippet.slice(start, end)}</mark>,
    );

    at = end;
  }

  out.push(snippet.slice(at));

  return out;
}
