import type { RootState } from '@app/store/store.js';
import type { PictureModel } from '../components/GalleryEditForm.js';

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
  return (Object.keys(editModel) as (keyof PictureModel)[]).some((key) => {
    const a = editModel[key];

    const b = editSeed[key];

    return Array.isArray(a) && Array.isArray(b)
      ? a.length !== b.length || a.some((item, i) => item !== b[i])
      : a !== b;
  });
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
