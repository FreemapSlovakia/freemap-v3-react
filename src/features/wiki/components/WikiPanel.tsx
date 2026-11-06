import { selectFeature } from '@app/store/actions.js';
import { Text } from '@features/l10n/Text.js';
import { DockPanel } from '@shared/components/DockPanel.js';
import { wikiPage } from '@shared/components/OsmTagLinks.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Badge } from 'react-bootstrap';
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

        const href = `https://${lang}.wikipedia.org/wiki/${wikiPage(title)}`;

        return (
          <>
            <p className="lead fw-semibold">
              {/* One named tab for every article link. */}
              <a href={href} target="wikipedia">
                {label}
              </a>

              {/* No article in the UI language: this is another edition's. */}
              {typeof item !== 'string' && lang !== language && (
                <Badge bg="secondary" className="ms-2 align-middle">
                  {lang}
                </Badge>
              )}
            </p>

            {body}

            {typeof item !== 'string' && (
              // Attribution CC BY-SA requires of reused article text.
              <p className="small text-body-secondary mt-3 mb-0">
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
            )}
          </>
        );
      }}
    </DockPanel>
  );
}
