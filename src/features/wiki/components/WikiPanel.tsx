import { selectFeature } from '@app/store/actions.js';
import { Text } from '@features/l10n/Text.js';
import { DockPanel } from '@shared/components/DockPanel.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { type ReactElement, useMemo } from 'react';
import { FaWikipediaW } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import type { WikiPreview } from '../model/actions.js';
import { selectedWikiId } from '../model/selectors.js';

/** The article's preview, or the `<lang>:<title>` it is loading for. */
type Item = { preview: WikiPreview } | { loading: string };

// Escaped, or a `?` or `#` in the title would end the path.
const articleUrl = (lang: string, title: string) =>
  `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(
    title.replaceAll(' ', '_'),
  ).replaceAll('%2F', '/')}`;

/** The selected Wikipedia article's panel. */
export default function WikiPanel(): ReactElement {
  const dispatch = useDispatch();

  const id = useAppSelector(selectedWikiId);

  const preview = useAppSelector((state) => state.wiki.preview);

  const loading = useAppSelector((state) => state.wiki.loading);

  const point = useAppSelector((state) =>
    state.wiki.points.find((p) => p.wikipedia === id),
  );

  const item = useMemo<Item | null>(
    () => (preview ? { preview } : loading ? { loading } : null),
    [preview, loading],
  );

  return (
    <DockPanel
      item={item}
      show={id !== null}
      icon={<FaWikipediaW />}
      title={() => 'Wikipedia'}
      keepVisible={() => point}
      onClose={() => dispatch(selectFeature(null))}
    >
      {(item) => {
        if ('loading' in item) {
          const [lang = '', title = ''] = item.loading.split(/:(.*)/);

          return (
            <>
              <p className="lead fw-semibold">
                <a href={articleUrl(lang, title)} target="wikipedia">
                  {title}
                </a>
              </p>

              <Text k="general.loading" />
            </>
          );
        }

        const { preview } = item;

        return (
          <>
            <p className="lead fw-semibold">
              <a
                href={articleUrl(preview.lang, preview.langTitle)}
                // One named tab for every article link.
                target="wikipedia"
              >
                {preview.title}
              </a>
            </p>

            {preview.thumbnail && (
              <img
                src={preview.thumbnail.source}
                width={preview.thumbnail.width}
                height={preview.thumbnail.height}
                alt={preview.title}
                className="mb-3 mw-100 h-auto rounded"
              />
            )}

            {/* Wikipedia's own extract, as its API sends it. */}
            <div dangerouslySetInnerHTML={{ __html: preview.extract }} />
          </>
        );
      }}
    </DockPanel>
  );
}
