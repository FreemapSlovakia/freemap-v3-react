import {
  getIdNoteUrl,
  getOsmNoteUrl,
} from '@features/openInExternalApp/externalUrlUtils.js';
import { PlaceActionsButton } from '@shared/components/PlaceActionsButton.js';
import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { FaStickyNote } from 'react-icons/fa';
import { useOsmNotesMessages } from '../translations/useOsmNotesMessages.js';

export default function OsmNoteSelection(): ReactElement | null {
  const note = useAppSelector((state) => state.osmNotes.selected);

  const m = useOsmNotesMessages();

  if (!note) {
    return null;
  }

  return (
    <Selection icon={<FaStickyNote />} label={m?.selection}>
      <PlaceActionsButton
        lat={note.lat}
        lon={note.lon}
        osmObject={{
          url: getOsmNoteUrl(note.id),
          idUrl: getIdNoteUrl(note.id),
        }}
      />
    </Selection>
  );
}
