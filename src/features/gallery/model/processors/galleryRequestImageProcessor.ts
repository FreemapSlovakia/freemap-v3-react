import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { pictureIdToPath } from '../../pictureIdPath.js';
import { loadGalleryMessages } from '../../translations/loadGalleryMessages.js';
import {
  galleryRequestImage,
  gallerySetImage,
  PictureSchema,
} from '../actions.js';

// TODO react only on getState().gallery.activeImageId change
export const galleryRequestImageProcessor: Processor = {
  actionCreator: galleryRequestImage,
  async handle({ getState, dispatch, toastError }) {
    const activeImageId = getState().gallery.activeImageId;

    const res = await httpRequest({
      getState,
      url: `/gallery/pictures/${pictureIdToPath(activeImageId ?? 0)}`,
      expectedStatus: 200,
    }).catch(async (err) => {
      await toastError(err, loadGalleryMessages, 'pictureFetchingError');

      return null;
    });

    if (!res) {
      return;
    }

    const image = PictureSchema.parse(await res.json());

    // Wikimedia photos travel through the shared id space as negative ids
    // (`-pageId`); the detail endpoint returns the bare pageId, so re-apply the
    // internal sign to keep it consistent with activeImageId / imageIds.
    dispatch(
      gallerySetImage(
        image.source === 'wikimedia' ? { ...image, id: -image.id } : image,
      ),
    );
  },
};
