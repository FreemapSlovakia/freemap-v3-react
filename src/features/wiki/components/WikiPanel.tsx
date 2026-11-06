import { selectFeature } from '@app/store/actions.js';
import { Text } from '@features/l10n/Text.js';
import { DockPanel } from '@shared/components/DockPanel.js';
import { wikiPage } from '@shared/components/OsmTagLinks.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { FaWikipediaW } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { selectedWikiId } from '../model/selectors.js';

/** The selected Wikipedia article's panel. */
export default function WikiPanel(): ReactElement {
  const dispatch = useDispatch();

  const id = useAppSelector(selectedWikiId);

  const preview = useAppSelector((state) => state.wiki.preview);

  // The `<lang>:<title>` the preview is loading for.
  const loading = useAppSelector((state) => state.wiki.loading);

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
        let lang, title, label, body;

        if (typeof item === 'string') {
          [lang = '', title = ''] = item.split(/:(.*)/);

          label = title;

          body = <Text k="general.loading" />;
        } else {
          ({ lang, langTitle: title, title: label } = item);

          body = (
            <>
              {item.thumbnail && (
                <img
                  src={item.thumbnail.source}
                  width={item.thumbnail.width}
                  height={item.thumbnail.height}
                  alt={item.title}
                  className="mb-3 mw-100 h-auto rounded"
                />
              )}

              {/* Wikipedia's own extract, as its API sends it. */}
              <div dangerouslySetInnerHTML={{ __html: item.extract }} />
            </>
          );
        }

        return (
          <>
            <p className="lead fw-semibold">
              <a
                href={`https://${lang}.wikipedia.org/wiki/${wikiPage(title)}`}
                // One named tab for every article link.
                target="wikipedia"
              >
                {label}
              </a>
            </p>

            {body}
          </>
        );
      }}
    </DockPanel>
  );
}
