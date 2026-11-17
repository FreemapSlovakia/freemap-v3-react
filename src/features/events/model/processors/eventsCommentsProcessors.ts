import { httpRequest } from '@app/httpRequest.js';
import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import type { RootState } from '@app/store/store.js';
import { CommentSchema } from '@shared/comments.js';
import { trackMatomo } from '@shared/trackMatomo.js';
import type { Dispatch } from 'redux';
import {
  eventsCommentSaved,
  eventsDeleteComment,
  eventsEditComment,
  eventsPostComment,
  eventsSetCommentDraft,
  eventsSetComments,
  eventsSetSelected,
} from '../actions.js';
import { selectedEventId } from '../selectors.js';

async function loadComments(
  getState: () => RootState,
  dispatch: Dispatch,
  eventId: string,
) {
  // Without a toast, as the participants: the event itself still shows.
  try {
    const res = await httpRequest({
      getState,
      url: `/events/${encodeURIComponent(eventId)}/comments`,
      expectedStatus: 200,
      cancelActions: [eventsSetSelected],
    });

    dispatch(
      eventsSetComments({
        eventId,
        items: CommentSchema.array().parse(await res.json()),
      }),
    );
  } catch (err) {
    console.warn('Event comments not loaded', err);
  }
}

/** Puts a saved comment in the thread, or loads the thread if it isn't. */
async function commentSaved(
  getState: () => RootState,
  dispatch: Dispatch,
  eventId: string,
  res: Response,
) {
  const comment = CommentSchema.parse(await res.json());

  if (getState().events.comments?.eventId === eventId) {
    dispatch(eventsCommentSaved({ eventId, comment }));
  } else {
    await loadComments(getState, dispatch, eventId);
  }
}

/** Loads the discussion whenever the selected event is set, refreshes included. */
export const eventsCommentsLoadProcessor: Processor<typeof eventsSetSelected> =
  {
    actionCreator: eventsSetSelected,
    async handle({ getState, dispatch, action }) {
      if (action.payload) {
        await loadComments(getState, dispatch, action.payload.id);
      }
    },
  };

export const eventsCommentPostProcessor: Processor<typeof eventsPostComment> = {
  actionCreator: eventsPostComment,
  errorKey: 'general.savingError',
  async handle({ getState, dispatch }) {
    const draft = getState().events.commentDraft;

    const eventId = selectedEventId(getState());

    if (!draft || draft.eventId !== eventId || !draft.text.trim()) {
      return;
    }

    trackMatomo(['trackEvent', 'Events', 'postComment']);

    // At once, so a second press finds nothing to post; back if it fails.
    dispatch(eventsSetCommentDraft(null));

    let res: Response;

    try {
      res = await httpRequest({
        getState,
        method: 'POST',
        url: `/events/${encodeURIComponent(eventId)}/comments`,
        data: { comment: draft.text },
        expectedStatus: 200,
      });
    } catch (err) {
      if (!getState().events.commentDraft) {
        dispatch(eventsSetCommentDraft(draft));
      }

      throw err;
    }

    await commentSaved(getState, dispatch, eventId, res);
  },
};

export const eventsCommentChangeProcessor: Processor<
  typeof eventsEditComment | typeof eventsDeleteComment
> = {
  actionCreator: [eventsEditComment, eventsDeleteComment],
  errorKey: 'general.operationError',
  async handle({ getState, dispatch, action }) {
    const eventId = selectedEventId(getState());

    if (eventId === null) {
      return;
    }

    const edit = eventsEditComment.match(action);

    const commentId = edit ? action.payload.id : action.payload;

    trackMatomo([
      'trackEvent',
      'Events',
      edit ? 'editComment' : 'deleteComment',
    ]);

    const res = await httpRequest({
      getState,
      method: edit ? 'PATCH' : 'DELETE',
      url: `/events/${encodeURIComponent(eventId)}/comments/${commentId}`,
      data: edit ? { comment: action.payload.comment } : undefined,
      expectedStatus: 200,
    });

    await commentSaved(getState, dispatch, eventId, res);
  },
};
