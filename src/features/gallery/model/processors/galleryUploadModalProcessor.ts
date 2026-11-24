import { setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { l10nSetLanguage } from '@features/l10n/model/actions.js';
import { galleryEditPicture, galleryTagsNeeded } from '../actions.js';
import { ensureTags, tagsPending } from '../tagList.js';

export const galleryUploadModalProcessor: Processor = {
  actionCreator: [
    setActiveModal,
    galleryEditPicture,
    galleryTagsNeeded,
    l10nSetLanguage,
  ],
  handle: async (ctx) => {
    const { action, getState } = ctx;

    if (galleryTagsNeeded.match(action)) {
      await ensureTags(ctx, false);
    } else if (l10nSetLanguage.match(action)) {
      // Relabeled where a list is loaded or loading.
      if (getState().gallery.tagsLanguage !== null || tagsPending()) {
        await ensureTags(ctx, false);
      }
    } else if (
      // don't load tags when canceling editing
      (galleryEditPicture.match(action) && getState().gallery.editModel) ||
      (setActiveModal.match(action) &&
        (action.payload?.type === 'gallery-filter' ||
          action.payload?.type === 'gallery-upload'))
    ) {
      await ensureTags(ctx, true);
    }
  },
};
