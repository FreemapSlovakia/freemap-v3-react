import { selectFeature } from '@app/store/actions.js';
import { FEATURES_PANE_CLASS } from '@features/map/hooks/featuresPane.js';
import { RichMarker } from '@shared/components/RichMarker.js';
import { SELECTION_COLOR } from '@shared/halo.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import {
  SwitchableTooltip,
  usePermanentLabels,
} from '@shared/permanentLabels.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { Point } from 'leaflet';
import type { ReactElement } from 'react';
import { FaStickyNote } from 'react-icons/fa';
import { Pane } from 'react-leaflet';
import { useDispatch } from 'react-redux';
import { shownOsmNotesSelector } from '../model/selectors.js';
import { useOsmNotesMessages } from '../translations/useOsmNotesMessages.js';

export default function OsmNotesLayer(): ReactElement {
  const shown = useAppSelector(shownOsmNotesSelector);

  const selectedId = useAppSelector((state) => state.osmNotes.selected?.id);

  const dispatch = useDispatch();

  const m = useOsmNotesMessages();

  const labelled = usePermanentLabels();

  // Faded, or hidden, with the tools' features (⇧D).
  return (
    <Pane name="osmNotes" className={FEATURES_PANE_CLASS}>
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
        >
          {/* The opening comment, as a changeset's marker shows its comment. */}
          <SwitchableTooltip
            className="compact"
            offset={new Point(10, 10)}
            direction="right"
            permanent={labelled || note.id === selectedId}
          >
            <div className="text-truncate" style={{ maxWidth: 200 }}>
              <b>
                {note.comments[0]?.user ?? m?.anonymous}
                {': '}
              </b>
              {note.comments[0]?.text}
            </div>
          </SwitchableTooltip>
        </RichMarker>
      ))}
    </Pane>
  );
}
