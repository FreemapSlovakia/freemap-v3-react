import { httpRequest } from '@app/httpRequest.js';
import { selectFeature } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { userLayersSelector } from '@app/store/selectors.js';
import type { RootState } from '@app/store/store.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { OSM_NOTES_LAYER } from '../../api.js';
import { loadOsmNotesMessages } from '../../translations/loadOsmNotesMessages.js';
import { type OsmNote, osmNotesSetSelected } from '../actions.js';
import { OsmNoteFeatureSchema, toOsmNote } from '../noteSchema.js';
import { selectedOsmNoteId } from '../selectors.js';

const layerOn = (state: RootState) =>
  userLayersSelector(state).includes(OSM_NOTES_LAYER);

/** Puts the selected note in the store and its thread in a toast, which goes with the selection. */
export const osmNoteSelectionProcessor: Processor = {
  stateChangePredicate: selectedOsmNoteId,
  errorKey: 'general.loadError',
  async handle({ getState, dispatch }) {
    const id = selectedOsmNoteId(getState());

    // At once, or the toolbar and the halo would show the previous note while
    // this one loads.
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

    dispatch(
      toastsAdd({
        id: 'osmNote',
        style: 'info',
        messageKey: 'note',
        messageLoader: loadOsmNotesMessages,
        messageParams: { note },
        statePredicate: (state) => selectedOsmNoteId(state) !== id,
        onClose: selectFeature(null),
      }),
    );
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
