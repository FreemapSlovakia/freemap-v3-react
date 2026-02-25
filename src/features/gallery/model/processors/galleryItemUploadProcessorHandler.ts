import { httpRequest } from '@app/httpRequest.js';
import { setActiveModal } from '@app/store/actions.js';
import type { ProcessorHandler } from '@app/store/middleware/processorMiddleware.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { parseCoordinates } from '@shared/coordinatesParser.js';
import {
  galleryRemoveItem,
  gallerySetItemError,
  gallerySetLayerDirty,
  galleryUpload,
} from '../actions.js';

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
      azimuth: item.azimuth,
      takenAt: item.takenAt?.toISOString(),
      tags: item.tags,
      premium: item.premium,
    }),
  );

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
