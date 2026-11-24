import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { l10nSetLanguage } from '@features/l10n/model/actions.js';
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

// The photo last asked for, and the language of its tag labels.
let asked: { id: number | null; language: string } | null = null;

// TODO react only on getState().gallery.activeImageId change
export const galleryRequestImageProcessor: Processor = {
  // A language switch relabels an open photo's tags.
  actionCreator: [galleryRequestImage, l10nSetLanguage],
  async handle({ getState, dispatch, toastError, action }) {
    const { activeImageId, editModel } = getState().gallery;

    const { language } = getState().l10n;

    const relabel = l10nSetLanguage.match(action);

    // Not while it is edited: a fetched photo ends the edit.
    if (
      relabel &&
      (activeImageId === null ||
        (asked?.id === activeImageId && asked.language === language) ||
        editModel)
    ) {
      return;
    }

    asked = { id: activeImageId, language };

    // Counted as asked, so a second request meanwhile doesn't count it again.
    const countView = activeImageId != null && !countedViews.has(activeImageId);

    if (countView) {
      countedViews.add(activeImageId);
    }

    const query = new URLSearchParams({ lang: language });

    if (countView) {
      query.set('countView', '1');
    }

    let image: Picture;

    try {
      const res = await httpRequest({
        getState,
        url: `/gallery/pictures/${pictureIdToPath(activeImageId ?? 0)}?${query}`,
        expectedStatus: 200,
      });

      // The user may have moved on to another photo meanwhile.
      if (getState().gallery.activeImageId !== activeImageId) {
        return;
      }

      image = PictureSchema.parse(await res.json());
    } catch (err) {
      if (countView) {
        countedViews.delete(activeImageId);
      }

      if (getState().gallery.activeImageId === activeImageId) {
        dispatch(gallerySetImageFetchFailed());

        await toastError(err, loadGalleryMessages, 'pictureFetchingError');
      }

      return;
    }

    if (
      getState().gallery.activeImageId !== activeImageId ||
      // An edit opened meanwhile outweighs new labels.
      (relabel && getState().gallery.editModel)
    ) {
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
