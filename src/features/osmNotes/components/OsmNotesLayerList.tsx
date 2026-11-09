import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  type Item,
  ItemList,
  type ItemSortOption,
  latLonBbox,
} from '@features/mapSettings/components/ItemList.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { type ReactElement, useMemo } from 'react';
import {
  FaRegCalendarAlt,
  FaRegClock,
  FaRegComment,
  FaRegComments,
  FaStickyNote,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { OSM_NOTES_LIMIT } from '../api.js';
import { osmNotesSetListSort } from '../model/actions.js';
import { shownOsmNotesSelector } from '../model/selectors.js';
import {
  type OsmNotesListSort,
  OsmNotesListSortSchema,
} from '../model/settingsReducer.js';
import { useOsmNotesMessages } from '../translations/useOsmNotesMessages.js';

const SORTS: Record<
  OsmNotesListSort,
  Pick<ItemSortOption, 'icon' | 'key' | 'desc'>
> = {
  newest: { icon: <FaRegCalendarAlt />, key: 'opened', desc: true },
  oldest: { icon: <FaRegCalendarAlt />, key: 'opened' },
  active: { icon: <FaRegClock />, desc: true },
  comments: { icon: <FaRegComments />, desc: true },
};

/** The notes the layer shows, on its page in the map layers panel. */
export function OsmNotesLayerList(): ReactElement {
  const dispatch = useDispatch();

  const nm = useOsmNotesMessages();

  const m = useMessages();

  const notes = useAppSelector(shownOsmNotesSelector);

  const loaded = useAppSelector((state) => state.osmNotes.notes.length);

  const loadState = useAppSelector((state) => state.osmNotes.loadState);

  const sort = useAppSelector((state) => state.osmNotesSettings.listSort);

  const dateFormat = useDateTimeFormat({ dateStyle: 'medium' });

  // Kept while the notes are, so the list's search and sort keep theirs.
  const items = useMemo(
    () =>
      notes.map((note): Item => {
        const [first, ...rest] = note.comments;

        // A close or reopen without a word isn't a reply.
        const replies = rest.filter((comment) => comment.text.trim());

        const last = note.comments.at(-1);

        const text = first?.text.replace(/\s+/g, ' ').trim() ?? '';

        // The date the order is by: the last activity's where sorted by it.
        const dated = sort === 'active' ? last : first;

        return {
          key: String(note.id),
          icon: <FaStickyNote />,
          label: text || `#${note.id}`,
          muted: !text,
          subline: (
            <>
              {first?.user ?? nm?.anonymous}
              {dated && ` · ${dateFormat.format(new Date(dated.date))}`}
              {replies.length > 0 && (
                <>
                  {' · '}
                  <FaRegComment /> {replies.length}
                </>
              )}
            </>
          ),
          search: note.comments
            .map((comment) => `${comment.user ?? ''} ${comment.text}`)
            .join(' '),
          sortKeys: {
            opened: first && Date.parse(first.date),
            active: last && Date.parse(last.date),
            comments: replies.length,
          },
          selects: { type: 'osm-note', id: note.id },
          onPick: () => trackMatomo(['trackEvent', 'OsmNotes', 'show', 'list']),
          bbox: () => latLonBbox([note]),
        };
      }),
    [notes, sort, dateFormat, nm],
  );

  const sortOptions = useMemo(
    () =>
      OsmNotesListSortSchema.options.map((id) => ({
        id,
        label: nm?.list.sorts[id],
        ...SORTS[id],
      })),
    [nm],
  );

  return (
    <ItemList
      items={items}
      // Zoomed out, or over a view too large for the API: a closer one loads.
      empty={
        {
          loading: m?.general.loading,
          loaded: nm?.list.none,
          failed: nm?.list.failed,
          unavailable: nm?.list.zoomIn,
        }[loadState]
      }
      onSearchStart={() =>
        trackMatomo(['trackEvent', 'OsmNotes', 'listSearch'])
      }
      footer={
        // Failed with notes of an earlier view still listed, it says so too.
        loadState === 'failed' && notes.length > 0 ? (
          <p className="small text-danger mt-2 mb-0">{nm?.list.failed}</p>
        ) : (
          loaded >= OSM_NOTES_LIMIT && (
            <p className="small text-muted mt-2 mb-0">
              {nm?.list.capped({ count: loaded })}
            </p>
          )
        )
      }
      sort={{
        options: sortOptions,
        value: sort,
        onChange: (id) => {
          const next = OsmNotesListSortSchema.parse(id);

          trackMatomo(['trackEvent', 'OsmNotes', 'listSort', next]);

          dispatch(osmNotesSetListSort(next));
        },
      }}
    />
  );
}
