import {
  galleryRemoveItem,
  gallerySetItemError,
  gallerySetLayerDirty,
  galleryUpload,
} from '../actions/galleryActions.js';
import { setActiveModal } from '../actions/mainActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { parseCoordinates } from '../coordinatesParser.js';
import { httpRequest } from '../httpRequest.js';
import { ProcessorHandler } from '../middlewares/processorMiddleware.js';

const handle: ProcessorHandler = async ({ getState, dispatch }) => {
  const { items, uploadingId } = getState().gallery;

  if (uploadingId === null) {
    dispatch(gallerySetLayerDirty());

    if (getState().gallery.items.length === 0) {
      dispatch(
        toastsAdd({
          id: 'gallery.upload',
          messageKey: 'gallery.uploadModal.success',
          timeout: 5000,
          style: 'info',
        }),
      );

      dispatch(setActiveModal(null));
    }

    return;
  }

  const item = items.find(({ id }) => id === uploadingId);

  if (!item) {
    return; // TODO error
  }

  const formData = new FormData();

  formData.append('image', item.file);

  formData.append(
    'meta',
    JSON.stringify({
      title: item.title,
      description: item.description,
      position: parseCoordinates(item.dirtyPosition),
      takenAt: item.takenAt?.toISOString(),
      tags: item.tags,
    }),
  );

  // TODO doesn't work (at least in Chrome)
  // formData.append('meta', new Blob([JSON.stringify({
  //   title: item.title,
  //   description: item.description,
  //   position: item.position,
  //   takenAt: item.takenAt?.toISOString(),
  //   tags: item.tags,
  // })], { type: 'application/json' }));

  try {
    await httpRequest({
      getState,
      method: 'POST',
      url: '/gallery/pictures',
      body: formData,
      expectedStatus: 200,
      cancelActions: [setActiveModal], // if upload modal is closed
    });

    dispatch(galleryRemoveItem(item.id));

    dispatch(galleryUpload());
  } catch (err) {
    dispatch(
      gallerySetItemError({
        id: item.id,
        error: `~${err instanceof Error ? err.message : String(err)}`,
      }),
    );

    dispatch(galleryUpload());
  }
};

export default handle;
