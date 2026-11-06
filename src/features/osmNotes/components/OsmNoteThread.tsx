import { encodePanel } from '@app/url/panelParam.js';
import { osmElementOpen } from '@features/osm/model/osmElementOpen.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { inAppLink } from '@shared/inAppLink.js';
import { linkify } from '@shared/linkify.js';
import { parseOsmElementId } from '@shared/osmElementIds.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { Fragment, type ReactElement, type ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import type { OsmNote } from '../model/actions.js';
import { useOsmNotesMessages } from '../translations/useOsmNotesMessages.js';

interface Props {
  note: OsmNote;
}

const OSM_HOST_RE = /^(www\.)?(openstreetmap\.org|osm\.org)$/;

function useLinkify(showOnMap: string | undefined) {
  const dispatch = useDispatch();

  return (text: string): ReactNode[] =>
    linkify(text, (url, key) => {
      const id = OSM_HOST_RE.test(URL.parse(url)?.hostname ?? '')
        ? parseOsmElementId(url)
        : null;

      return (
        <Fragment key={key}>
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url}
          </a>

          {id && (
            <>
              {' ('}
              <a
                {...inAppLink(
                  // Kept, as the click keeps it.
                  `#osm-${id.elementType}=${id.id}&panel=${encodePanel({ type: 'osm', id })}`,
                  () => {
                    for (const action of osmElementOpen(id)) {
                      dispatch(action);
                    }

                    trackMatomo(['trackEvent', 'OsmNotes', 'openElement']);
                  },
                )}
              >
                {showOnMap}
              </a>
              {')'}
            </>
          )}
        </Fragment>
      );
    });
}

export function OsmNoteThread({ note }: Props): ReactElement {
  const m = useOsmNotesMessages();

  const linkify = useLinkify(m?.showOnMap);

  const dateFormat = useDateTimeFormat({
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div>
      {note.comments.map((comment, i) => (
        <div key={i} className={i ? 'mt-2' : undefined}>
          <div className="small mb-2">
            {m?.actions[comment.action]} · <b>{comment.user ?? m?.anonymous}</b>{' '}
            · {dateFormat.format(new Date(comment.date))}
          </div>

          {comment.text && (
            <div style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
              {linkify(comment.text)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
