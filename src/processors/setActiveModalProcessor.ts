import { setActiveModal } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const setActiveModalTransformer: Processor<typeof setActiveModal> = {
  actionCreator: setActiveModal,
  transform: ({ getState, action }) => {
    const anonymous = !getState().auth.user;

    return action.payload === 'maps' && anonymous
      ? toastsAdd({
          messageKey: 'maps.unauthenticatedError',
          style: 'danger',
        })
      : action.payload === 'gallery-upload' && anonymous
      ? toastsAdd({
          messageKey: 'gallery.unauthenticatedError',
          style: 'danger',
        })
      : action;
  },
};
