import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { pictureIdToPath } from '../../pictureIdPath.js';
import { loadGalleryMessages } from '../../translations/loadGalleryMessages.js';
import {
  galleryRequestImage,
  gallerySetImage,
  gallerySetImageFetchFailed,
  PictureSchema,
} from '../actions.js';

// TODO react only on getState().gallery.activeImageId change
export const galleryRequestImageProcessor: Processor = {
  actionCreator: galleryRequestImage,
  async handle({ getState, dispatch, toastError }) {
    const activeImageId = getState().gallery.activeImageId;

    let image;

    try {
      const res = await httpRequest({
        getState,
        url: `/gallery/pictures/${pictureIdToPath(activeImageId ?? 0)}`,
        expectedStatus: 200,
      });

      // The user may have moved on to another photo meanwhile.
      if (getState().gallery.activeImageId !== activeImageId) {
        return;
      }

      image = PictureSchema.parse(await res.json());
    } catch (err) {
      if (getState().gallery.activeImageId === activeImageId) {
        dispatch(gallerySetImageFetchFailed());

        await toastError(err, loadGalleryMessages, 'pictureFetchingError');
      }

      return;
    }

    if (getState().gallery.activeImageId !== activeImageId) {
      return;
    }

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
