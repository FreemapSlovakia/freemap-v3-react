import type { RootState } from '@app/store/store.js';
import type { PictureModel } from '../components/GalleryEditForm.js';
import { isSameTag } from '../tagRefs.js';
import { GALLERY_LAYER, type GalleryFilter } from './actions.js';

const NO_FILTER: GalleryFilter = {};

/** The photo filter in effect: none while the layer, and its mark, is off. */
export const activeGalleryFilterSelector = (state: RootState): GalleryFilter =>
  state.map.layers.includes(GALLERY_LAYER)
    ? state.gallerySettings.filter
    : NO_FILTER;

/** Whether the photo's edit holds changes since it opened. */
export function galleryEditChangedSelector(state: RootState): boolean {
  const { editModel, editSeed } = state.gallery;

  if (editModel === null) {
    return false;
  }

  if (editSeed === null) {
    return true;
  }

  // Field by field: this runs on every action while an edit is open.
  return (Object.keys(editModel) as (keyof PictureModel)[]).some((key) =>
    key === 'tags'
      ? editModel.tags.length !== editSeed.tags.length ||
        editModel.tags.some((tag, i) => !isSameTag(tag, editSeed.tags[i]!))
      : editModel[key] !== editSeed[key],
  );
}

/**
 * Input the photo modals hold in the store, so it outlives them: they unmount
 * while a position is picked on the map.
 */
export function galleryInputPendingSelector(state: RootState): boolean {
  const { items, comment } = state.gallery;

  return (
    items.length > 0 ||
    comment.trim() !== '' ||
    galleryEditChangedSelector(state)
  );
}
