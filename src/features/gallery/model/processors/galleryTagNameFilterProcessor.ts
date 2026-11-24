import { setActiveModal } from '@app/store/actions.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { replacingEntry } from '@app/url/urlUpdating.js';
import { l10nSetLanguage } from '@features/l10n/model/actions.js';
import { tagIndex, tagNameKey } from '../../tagRefs.js';
import {
  galleryFilterTagResolved,
  gallerySetFilter,
  gallerySetTags,
} from '../actions.js';
import { ensureTags } from '../tagList.js';

/**
 * A photo filter holding a tag by its name (an older link, stored state) gets
 * the tag's id, in place of the history entry. Not while the filter modal
 * edits it, nor for a saved map's, which would then look changed.
 */
export const galleryTagNameFilterProcessor: Processor = {
  // l10nSetLanguage: at startup, for the stored filter.
  actionCreator: [
    gallerySetFilter,
    gallerySetTags,
    setActiveModal,
    l10nSetLanguage,
  ],
  handle: async (ctx) => {
    const { getState, dispatch } = ctx;

    const state = getState();

    const { tag } = state.gallerySettings.filter;

    // '' is photos without tags.
    if (
      !tag ||
      state.main.activeModal?.type === 'gallery-filter' ||
      state.myMaps.activeMap
    ) {
      return;
    }

    // The name keeps filtering meanwhile; the loaded list comes back here.
    if (state.gallery.tagsLanguage === null) {
      await ensureTags(ctx, false);

      return;
    }

    // By its name only: a label could name another tag.
    const found = tagIndex(state.gallery.tags).byName.get(tagNameKey(tag));

    if (found) {
      replacingEntry(() => dispatch(galleryFilterTagResolved(found.id)));
    }
  },
};
