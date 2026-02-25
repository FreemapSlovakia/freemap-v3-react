import { createReducer } from '@reduxjs/toolkit';
import { documentShow } from './actions.js';

export interface DocumentState {
  documentKey: string | null;
}

export const documentInitialState: DocumentState = {
  documentKey: null,
};

export const mainReducer = createReducer(documentInitialState, (builder) => {
  builder.addCase(documentShow, (state, action) => {
    state.documentKey = action.payload;
  });
});
