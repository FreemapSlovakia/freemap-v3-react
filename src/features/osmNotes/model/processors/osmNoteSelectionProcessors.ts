import { httpRequest } from '@app/httpRequest.js';
import { selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { userLayersSelector } from '@app/store/selectors.js';
import type { RootState } from '@app/store/store.js';
import { OSM_NOTES_LAYER } from '../../api.js';
import { type OsmNote, osmNotesSetSelected } from '../actions.js';
import { OsmNoteFeatureSchema, toOsmNote } from '../noteSchema.js';
import { selectedOsmNoteId } from '../selectors.js';

const layerOn = (state: RootState) =>
  userLayersSelector(state).includes(OSM_NOTES_LAYER);

/** Puts the selected note in the store, for its panel. */
export const osmNoteSelectionProcessor: Processor = {
  stateChangePredicate: selectedOsmNoteId,
  errorKey: 'general.loadError',
  async handle({ getState, dispatch }) {
    const id = selectedOsmNoteId(getState());

    // At once, or the halo would mark the previous note while this one loads;
    // the panel greys the previous one's content meanwhile.
    if (getState().osmNotes.selected) {
      dispatch(osmNotesSetSelected(null));
    }

    if (id === null) {
      return;
    }

    let note: OsmNote | undefined = getState().osmNotes.notes.find(
      (n) => n.id === id,
    );

    // A link may name a note the layer hasn't loaded.
    if (!note) {
      try {
        const res = await httpRequest({
          getState,
          url: `${process.env['OSM_API_URL']}/api/0.6/notes/${id}.json`,
          expectedStatus: 200,
          stateChangePredicate: selectedOsmNoteId,
        });

        note = toOsmNote(OsmNoteFeatureSchema.parse(await res.json()));
      } catch (err) {
        // Nothing would show the selection, so nothing could dismiss it.
        if (selectedOsmNoteId(getState()) === id) {
          dispatch(selectFeature(null));
        }

        throw err;
      }
    }

    dispatch(osmNotesSetSelected(note));
  },
};

/** Turning the layer off lets go of its note; a link naming one without it keeps it. */
export const osmNotesLayerOffProcessor: Processor = {
  stateChangePredicate: layerOn,
  handle({ getState, dispatch }) {
    if (!layerOn(getState()) && selectedOsmNoteId(getState()) !== null) {
      dispatch(selectFeature(null));
    }
  },
};
