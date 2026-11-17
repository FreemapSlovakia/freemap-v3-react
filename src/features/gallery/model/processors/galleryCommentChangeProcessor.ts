import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import {
  mailWatchLoad,
  pictureMailWatch,
} from '@features/mailWatch/model/actions.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import { pictureIdToPath } from '../../pictureIdPath.js';
import {
  galleryDeleteComment,
  galleryEditComment,
  galleryRequestImage,
} from '../actions.js';

/** Edits or deletes a comment on the shown photo, then shows the photo again. */
export const galleryCommentChangeProcessor: Processor<
  typeof galleryEditComment | typeof galleryDeleteComment
> = {
  actionCreator: [galleryEditComment, galleryDeleteComment],
  errorKey: 'general.operationError',
  async handle({ getState, dispatch, action }) {
    const { image } = getState().gallery;

    if (!image) {
      return;
    }

    const edit = galleryEditComment.match(action);

    const commentId = edit ? action.payload.id : action.payload;

    trackMatomo([
      'trackEvent',
      'Gallery',
      edit ? 'editComment' : 'deleteComment',
    ]);

    await httpRequest({
      getState,
      method: edit ? 'PATCH' : 'DELETE',
      url: `/gallery/pictures/${pictureIdToPath(image.id)}/comments/${commentId}`,
      data: edit ? { comment: action.payload.comment } : undefined,
      expectedStatus: 200,
    });

    // Deleting a last own comment may end taking part.
    if (!edit) {
      dispatch(mailWatchLoad(pictureMailWatch(image.id)));
    }

    if (getState().gallery.activeImageId === image.id) {
      dispatch(galleryRequestImage(image.id));
    }
  },
};
