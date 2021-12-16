import {
  galleryRemoveItem,
  gallerySetItemError,
  gallerySetLayerDirty,
  galleryUpload,
} from 'fm3/actions/galleryActions';
import { setActiveModal } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { parseCoordinates } from 'fm3/coordinatesParser';
import { httpRequest } from 'fm3/httpRequest';
import { ProcessorHandler } from 'fm3/middlewares/processorMiddleware';

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
