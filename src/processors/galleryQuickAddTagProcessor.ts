import {
  galleryQuickAddTag,
  galleryRequestImage,
  gallerySetLayerDirty,
} from '../actions/galleryActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { httpRequest } from '../httpRequest.js';
import { Processor } from '../middlewares/processorMiddleware.js';

export const galleryQuickAddTagProcessor: Processor<typeof galleryQuickAddTag> =
  {
    actionCreator: galleryQuickAddTag,
    errorKey: 'gallery.savingError',
    async handle({ getState, dispatch, action }) {
      const { image } = getState().gallery;

      if (!image) {
        return;
      }

      const { id } = image;

      await httpRequest({
        getState,
        method: 'PUT',
        url: `/gallery/pictures/${id}`,
        data: {
          title: image.title,
          description: image.description,
          tags: [...image.tags, action.payload],
          takenAt: image.takenAt?.toISOString() ?? null,
          position: { lat: image.lat, lon: image.lon },
        },
        expectedStatus: 204,
      });

      dispatch(
        toastsAdd({
          style: 'success',
          timeout: 5000,
          messageKey: 'general.saved',
        }),
      );

      dispatch(gallerySetLayerDirty());

      dispatch(galleryRequestImage(id));
    },
  };
