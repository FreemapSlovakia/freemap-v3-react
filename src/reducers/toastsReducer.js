const initialState = {
  toasts: [],
};

export default function main(state = initialState, action) {
  switch (action.type) {
    case 'TOASTS_ADD':
      return { ...state, toasts: [...state.toasts, action.payload] };
    case 'TOASTS_REMOVE':
      return { ...state, toasts: state.toasts.filter(({ id }) => id !== action.payload) };
    default:
      return state;
  }
}
