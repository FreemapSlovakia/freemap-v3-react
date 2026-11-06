import { selectFeature } from '@app/store/actions.js';
import { Text } from '@features/l10n/Text.js';
import { DockPanel } from '@shared/components/DockPanel.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Badge } from 'react-bootstrap';
import { FaWikipediaW } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useWikidataItem } from '../hooks/useWikidataItem.js';
import type { WikiPreview } from '../model/actions.js';
import { selectedWikiId } from '../model/selectors.js';
import { CommonsImages } from './CommonsImages.js';
import {
  ArticleThumbnail,
  articleUrl,
  WikiArticleBody,
} from './WikiArticleBody.js';
import { WikidataFacts } from './WikidataFacts.js';

/** The selected Wikipedia article's panel. */
export default function WikiPanel(): ReactElement {
  const dispatch = useDispatch();

  const id = useAppSelector(selectedWikiId);

  const preview = useAppSelector((state) => state.wiki.preview);

  // The `<lang>:<title>` the preview is loading for.
  const loading = useAppSelector((state) => state.wiki.loading);

  const language = useAppSelector((state) => state.l10n.language);

  const point = useAppSelector((state) =>
    id === null ? undefined : state.wiki.points.find((p) => p.wikipedia === id),
  );

  return (
    <DockPanel
      item={preview ?? loading}
      show={id !== null}
      icon={<FaWikipediaW />}
      title={() => 'Wikipedia'}
      keepVisible={() => point}
      onClose={() => dispatch(selectFeature(null))}
    >
      {(item) => {
        let lang, title, label;

        if (typeof item === 'string') {
          [lang = '', title = ''] = item.split(/:(.*)/);

          label = title;
        } else {
          ({ lang, langTitle: title, title: label } = item);
        }

        return (
          <>
            <p className="lead fw-semibold">
              {/* One named tab for every article link. */}
              <a href={articleUrl(lang, title)} target="wikipedia">
                {label}
              </a>

              {/* No article in the UI language: this is another edition's. */}
              {typeof item !== 'string' && lang !== language && (
                <Badge bg="secondary" className="ms-2 align-middle">
                  {lang}
                </Badge>
              )}
            </p>

            {typeof item === 'string' ? (
              <Text k="general.loading" />
            ) : (
              <Article article={item} />
            )}
          </>
        );
      }}
    </DockPanel>
  );
}

function Article({ article }: { article: WikiPreview }) {
  const loaded = useWikidataItem(article.wikidata);

  const item = loaded.state === 'done' ? loaded.data : undefined;

  const thumbnail = <ArticleThumbnail article={article} />;

  return (
    <>
      {loaded.state === 'loading' ? (
        thumbnail
      ) : (
        // The article's picture first; a local, non-Commons one stays alone.
        <CommonsImages
          files={[
            ...(article.pageimage ? [article.pageimage] : []),
            ...(item?.images ?? []),
          ]}
          category={item?.commonsCategory}
          fallback={thumbnail}
        />
      )}

      {item && <WikidataFacts item={item} />}

      <WikiArticleBody article={article} />
    </>
  );
}
