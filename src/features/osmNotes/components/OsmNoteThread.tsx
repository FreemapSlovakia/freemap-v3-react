import { osmElementOpen } from '@features/osm/model/osmElementOpen.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { inAppLink } from '@shared/inAppLink.js';
import { parseOsmElementId } from '@shared/osmElementIds.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { ReactElement, ReactNode } from 'react';
import { AlertLink } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import type { OsmNote } from '../model/actions.js';
import { useOsmNotesMessages } from '../translations/useOsmNotesMessages.js';

interface Props {
  note: OsmNote;
}

// Trailing punctuation belongs to the sentence, not the URL.
const URL_RE = /https?:\/\/[^\s<>"]+[^\s<>".,;:!?)'\]]/g;

const OSM_HOST_RE = /^(www\.)?(openstreetmap\.org|osm\.org)$/;

function useLinkify(showOnMap: string | undefined) {
  const dispatch = useDispatch();

  return (text: string): ReactNode[] => {
    const parts: ReactNode[] = [];

    let last = 0;

    for (const match of text.matchAll(URL_RE)) {
      let url = match[0];

      // A `)` closing a `(` of the URL's own is part of it: `…/Foo_(bar)`.
      if (
        text[match.index + url.length] === ')' &&
        url.split('(').length > url.split(')').length
      ) {
        url += ')';
      }

      parts.push(text.slice(last, match.index));

      last = match.index + url.length;

      const id = OSM_HOST_RE.test(URL.parse(url)?.hostname ?? '')
        ? parseOsmElementId(url)
        : null;

      parts.push(
        <AlertLink
          key={match.index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {url}
        </AlertLink>,
      );

      if (id) {
        parts.push(
          ' (',
          <AlertLink
            key={`${match.index}-map`}
            {...inAppLink(`#osm-${id.elementType}=${id.id}`, () => {
              for (const action of osmElementOpen(id)) {
                dispatch(action);
              }

              trackMatomo(['trackEvent', 'OsmNotes', 'openElement']);
            })}
          >
            {showOnMap}
          </AlertLink>,
          ')',
        );
      }
    }

    parts.push(text.slice(last));

    return parts;
  };
}

export function OsmNoteThread({ note }: Props): ReactElement {
  const m = useOsmNotesMessages();

  const linkify = useLinkify(m?.showOnMap);

  const dateFormat = useDateTimeFormat({
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div style={{ maxHeight: '40vh', overflowY: 'auto' }}>
      {note.comments.map((comment, i) => (
        <div key={i} className={i ? 'mt-2' : undefined}>
          <div className="small">
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
