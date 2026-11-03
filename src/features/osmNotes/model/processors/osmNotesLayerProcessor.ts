import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { cancellableDelay } from '@shared/cancelRegister.js';
import { objectToURLSearchParams } from '@shared/stringUtils.js';
import z from 'zod';
import { OSM_NOTES_LAYER, OSM_NOTES_MIN_ZOOM } from '../../api.js';
import { osmNotesSetNotes } from '../actions.js';
import { OsmNoteFeatureSchema, toOsmNote } from '../noteSchema.js';

const NotesSchema = z.object({ features: z.array(OsmNoteFeatureSchema) });

// The bounds arrive once the map exists, so a layer restored at startup loads
// on them like any other change; a resize changes them too.
const viewKey = ({ map: { layers, zoom, bounds } }: RootState) => {
  if (
    !bounds ||
    !layers.includes(OSM_NOTES_LAYER) ||
    zoom < OSM_NOTES_MIN_ZOOM
  ) {
    return null;
  }

  // The API refuses longitudes past ±180 (a view over the antimeridian is cut
  // there, one wholly past it gets nothing) and a box over 25 square degrees.
  const [w, s, e, n] = bounds;

  const west = Math.max(w, -180);

  const east = Math.min(e, 180);

  return east <= west || (east - west) * (n - s) > 25
    ? null
    : [west, s, east, n].join(',');
};

export const osmNotesLayerProcessor: Processor = {
  stateChangePredicate: viewKey,
  errorKey: 'general.loadError',
  async handle({ getState, dispatch, prevState }) {
    const bbox = viewKey(getState());

    if (bbox === null) {
      if (getState().osmNotes.notes.length) {
        dispatch(osmNotesSetNotes([]));
      }

      return;
    }

    // A view just turned on loads at once.
    await cancellableDelay(viewKey(prevState) === null ? 0 : 500, {
      stateChangePredicate: viewKey,
    });

    const res = await httpRequest({
      getState,
      url:
        `${process.env['OSM_API_URL']}/api/0.6/notes.json?` +
        objectToURLSearchParams({ bbox, closed: 0, limit: 1000 }),
      expectedStatus: 200,
      stateChangePredicate: viewKey,
    });

    const { features } = NotesSchema.parse(await res.json());

    // The body outlives the request's cancellation; the view may have moved on.
    if (viewKey(getState()) === bbox) {
      dispatch(osmNotesSetNotes(features.map(toOsmNote)));
    }
  },
};
