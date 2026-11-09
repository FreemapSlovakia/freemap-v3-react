import { selectFeature } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  getIdNoteUrl,
  getOsmNoteUrl,
} from '@features/openInExternalApp/externalUrlUtils.js';
import { DockPanel } from '@shared/components/DockPanel.js';
import { FmModalFooter } from '@shared/components/FmModalFooter.js';
import { ActionsToggle, OpenInMenu } from '@shared/components/PanelMenus.js';
import { ResponsiveActions } from '@shared/components/ResponsiveActions.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useDateTimeFormat } from '@shared/hooks/useDateTimeFormat.js';
import { usePlaceActions } from '@shared/hooks/usePlaceActions.js';
import type { ReactElement } from 'react';
import { ButtonToolbar } from 'react-bootstrap';
import { FaStickyNote } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import type { OsmNote } from '../model/actions.js';
import { selectedOsmNoteId } from '../model/selectors.js';
import { useOsmNotesMessages } from '../translations/useOsmNotesMessages.js';
import { OsmNoteThread } from './OsmNoteThread.js';

/** The selected OSM note's panel: what can be done with its place, and its thread. */
export default function OsmNoteSelection(): ReactElement {
  const dispatch = useDispatch();

  const m = useOsmNotesMessages();

  const note = useAppSelector((state) => state.osmNotes.selected);

  // By the id, which stays while the next note loads.
  const shown = useAppSelector((state) => selectedOsmNoteId(state) !== null);

  return (
    <DockPanel
      item={note}
      show={shown}
      icon={<FaStickyNote />}
      label={m?.selection}
      // What it is about, as its first comment says.
      title={(note) => note.comments[0]?.text || m?.selection}
      summary={(note) => <NoteSummary note={note} />}
      manual="osm-notes"
      keepVisible={({ lat, lon }) => ({ lat, lon })}
      onClose={() => dispatch(selectFeature(null))}
    >
      {(note) => (
        <>
          {!window.fmEmbedded && <NoteActions note={note} />}

          <OsmNoteThread note={note} />
        </>
      )}
    </DockPanel>
  );
}

/** Where the note stands: its latest comment's action, by whom and when. */
function NoteSummary({ note }: { note: OsmNote }): ReactElement | null {
  const m = useOsmNotesMessages();

  const dateFormat = useDateTimeFormat({ dateStyle: 'medium' });

  const last = note.comments.at(-1);

  return last ? (
    <small className="d-block text-truncate">
      {m?.actions[last.action]} · {last.user ?? m?.anonymous} ·{' '}
      {dateFormat.format(new Date(last.date))}
    </small>
  ) : null;
}

/** Labelled while there is room; the ⋮'s generic one goes first. */
function NoteActions({ note }: { note: OsmNote }): ReactElement {
  const m = useMessages();

  const selected = useAppSelector(
    (state) => selectedOsmNoteId(state) === note.id,
  );

  const { placeActions, openInItems, onSelect } = usePlaceActions({
    at: { lat: note.lat, lon: note.lon },
    osmObject: { url: getOsmNoteUrl(note.id), idUrl: getIdNoteUrl(note.id) },
    selection: selected,
  });

  return (
    <FmModalFooter as={ButtonToolbar} className="gap-2 mb-3">
      <ResponsiveActions
        toggle={<ActionsToggle priority={0} />}
        toggleLabel={m?.general.actions}
        onSelect={onSelect}
      >
        {placeActions}
      </ResponsiveActions>

      <OpenInMenu items={openInItems} onSelect={onSelect} priority={1} />
    </FmModalFooter>
  );
}
