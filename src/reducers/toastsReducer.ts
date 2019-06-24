import { createReducer } from 'typesafe-actions';
import { RootAction } from 'fm3/actions';
import { toastsAdd, toastsRemove } from 'fm3/actions/toastsActions';

export interface IToast {
  id: number;
  collapseKey?: string;
}

export interface IToastsState {
  toasts: IToast[];
}

const initialState: IToastsState = {
  toasts: [],
};

export const toastsReducer = createReducer<IToastsState, RootAction>(
  initialState,
)
  .handleAction(toastsAdd, (state, action) => {
    const { collapseKey } = action.payload;
    if (collapseKey) {
      const toast = state.toasts.find(t => t.collapseKey === collapseKey);
      if (toast) {
        return {
          ...state,
          toasts: [
            ...state.toasts.filter(t => t.id !== toast.id),
            action.payload,
          ],
        };
      }
    }
    return { ...state, toasts: [...state.toasts, action.payload] };
  })
  .handleAction(toastsRemove, (state, action) => ({
    ...state,
    toasts: state.toasts.filter(({ id }) => id !== action.payload),
  }));
