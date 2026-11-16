import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { pictureIdToPath } from '../../pictureIdPath.js';
import { loadGalleryMessages } from '../../translations/loadGalleryMessages.js';
import {
  galleryRequestImage,
  gallerySetImage,
  gallerySetImageFetchFailed,
  type Picture,
  PictureSchema,
} from '../actions.js';

// Photos whose view this tab has already counted; page memory, not storage.
const countedViews = new Set<number>();

// TODO react only on getState().gallery.activeImageId change
export const galleryRequestImageProcessor: Processor = {
  actionCreator: galleryRequestImage,
  async handle({ getState, dispatch, toastError }) {
    const { activeImageId } = getState().gallery;

    const countView = activeImageId != null && !countedViews.has(activeImageId);

    let image: Picture;

    try {
      const res = await httpRequest({
        getState,
        url: `/gallery/pictures/${pictureIdToPath(activeImageId ?? 0)}${countView ? '?countView=1' : ''}`,
        expectedStatus: 200,
      });

      if (countView) {
        countedViews.add(activeImageId);
      }

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
