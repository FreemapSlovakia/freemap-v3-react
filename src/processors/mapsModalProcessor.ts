import { setActiveModal } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const mapdModalTransformer: Processor<typeof setActiveModal> = {
  actionCreator: setActiveModal,
  transform: ({ getState, action }) => {
    return action.payload !== 'maps' || getState().auth.user
      ? action
      : toastsAdd({
          messageKey: 'maps.unauthenticatedError',
          style: 'danger',
        });
  },
};
