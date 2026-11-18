import { setActiveModal } from '@app/store/actions.js';
import { createReducer } from '@reduxjs/toolkit';
import type { Comment } from '@shared/comments.js';
import {
  type EventItem,
  type EventParticipant,
  type EventPoint,
  type EventSummary,
  eventsCommentSaved,
  eventsConfirmPick,
  eventsOpen,
  eventsOpenDone,
  eventsSave,
  eventsSaveDone,
  eventsSetCommentDraft,
  eventsSetComments,
  eventsSetList,
  eventsSetParticipants,
  eventsSetPickingStart,
  eventsSetPickPosition,
  eventsSetPickRadius,
  eventsSetSelected,
  eventsStartPicked,
} from './actions.js';

export interface EventsState {
  /** Summaries, for the markers and the list; the selected one in full. */
  list: EventSummary[];
  selected: EventItem | null;
  /** Who is going to the selected event and who is interested. */
  participants: { eventId: string; items: EventParticipant[] } | null;
  /** The selected event's discussion, oldest first. */
  comments: { eventId: string; items: Comment[] } | null;
  commentDraft: { eventId: string; text: string } | null;
  /** The event whose map is loading, to select again once it has. */
  opening: { id: string; mapId: string } | null;
  pickingStart: boolean;
  /** The start point being placed while picking. */
  pickPosition: EventPoint | null;
  /** The confirmed pick, until the form takes it. */
  pickedStart: EventPoint | null;
  /** Km around the point, while picking a place to filter by; kept with the pick. */
  pickRadius: number | null;
  saving: boolean;
}

const initialState: EventsState = {
  list: [],
  selected: null,
  participants: null,
  comments: null,
  commentDraft: null,
  opening: null,
  pickingStart: false,
  pickPosition: null,
  pickedStart: null,
  pickRadius: null,
  saving: false,
};

export const eventsReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(eventsSetList, (state, { payload }) => {
      state.list = payload;
    })
    .addCase(eventsSetSelected, (state, { payload }) => {
      state.selected = payload;
    })
    .addCase(eventsSetParticipants, (state, { payload }) => {
      state.participants = payload;
    })
    .addCase(eventsSetComments, (state, { payload }) => {
      state.comments = payload;
    })
    .addCase(eventsCommentSaved, (state, { payload }) => {
      if (state.comments?.eventId !== payload.eventId) {
        return;
      }

      const { items } = state.comments;

      const i = items.findIndex((c) => c.id === payload.comment.id);

      if (i === -1) {
        items.push(payload.comment);
      } else {
        items[i] = payload.comment;
      }
    })
    .addCase(eventsSetCommentDraft, (state, { payload }) => {
      state.commentDraft = payload;
    })
    .addCase(eventsOpen, (state, { payload }) => {
      state.opening = { id: payload.id, mapId: payload.mapId };
    })
    .addCase(eventsSave, (state) => {
      state.saving = true;
    })
    .addCase(eventsSaveDone, (state) => {
      state.saving = false;
    })
    .addCase(eventsOpenDone, (state) => {
      state.opening = null;
    })
    .addCase(eventsSetPickingStart, (state, { payload }) => {
      state.pickingStart = payload;

      if (!payload) {
        state.pickPosition = null;

        state.pickRadius = null;
      }
    })
    .addCase(eventsSetPickPosition, (state, { payload }) => {
      state.pickPosition = payload;
    })
    .addCase(eventsSetPickRadius, (state, { payload }) => {
      state.pickRadius = payload;
    })
    .addCase(eventsConfirmPick, (state) => {
      state.pickedStart = state.pickPosition;

      state.pickPosition = null;

      state.pickingStart = false;
    })
    // Picking belongs to the dialog that asked for it, which stays open
    // throughout; once another one opens (Back, a link) nobody takes the point.
    .addCase(setActiveModal, (state) => {
      state.pickingStart = false;

      state.pickPosition = null;

      state.pickedStart = null;

      state.pickRadius = null;
    })
    .addCase(eventsStartPicked, (state, { payload }) => {
      state.pickedStart = payload;

      if (!payload) {
        state.pickRadius = null;
      }
    });
});
