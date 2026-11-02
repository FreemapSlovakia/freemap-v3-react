import { selectFeature } from '@app/store/actions.js';
import {
  FEATURES_PANE_CLASS,
  useOwnPaneOpacity,
} from '@features/map/hooks/featuresPane.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { SELECTION_COLOR } from '@shared/halo.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { ReactElement } from 'react';
import { FaStickyNote } from 'react-icons/fa';
import { Pane } from 'react-leaflet';
import { useDispatch } from 'react-redux';

interface Props {
  opacity: number;
}

export default function OsmNotesLayer({ opacity }: Props): ReactElement {
  const notes = useAppSelector((state) => state.osmNotes.notes);

  const selected = useAppSelector((state) => state.osmNotes.selected);

  const selectedId = selected?.id;

  // A note from a link may lie outside what the layer loaded.
  const shown =
    selected && !notes.some((n) => n.id === selected.id)
      ? [...notes, selected]
      : notes;

  const dispatch = useDispatch();

  // Faded, or hidden, with the tools' features (⇧D) as well as by its own opacity.
  const paneRef = useOwnPaneOpacity(opacity);

  return (
    <Pane name="osmNotes" className={FEATURES_PANE_CLASS} ref={paneRef}>
      {shown.map((note) => (
        <RichMarker
          key={note.id}
          position={{ lat: note.lat, lng: note.lon }}
          faIcon={<FaStickyNote />}
          halo={note.id === selectedId ? SELECTION_COLOR : undefined}
          zIndexOffset={note.id === selectedId ? 1000 : 0}
          eventHandlers={{
            click() {
              trackMatomo(['trackEvent', 'OsmNotes', 'show']);

              dispatch(selectFeature({ type: 'osm-note', id: note.id }));
            },
          }}
        />
      ))}
    </Pane>
  );
}
