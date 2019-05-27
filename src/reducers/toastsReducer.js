import * as at from 'fm3/actionTypes';

const initialState = {
  toasts: [],
};

export default function toasts(state = initialState, action) {
  switch (action.type) {
    case at.TOASTS_ADD: {
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
    }
    case at.TOASTS_REMOVE:
      return {
        ...state,
        toasts: state.toasts.filter(({ id }) => id !== action.payload),
      };
    default:
      return state;
  }
}
