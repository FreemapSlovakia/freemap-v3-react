import { Processor } from 'fm3/middlewares/processorMiddleware';
import { setErrorTicketId } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

export const errorProcessor: Processor<typeof setErrorTicketId> = {
  actionCreator: setErrorTicketId,
  handle: async ({ dispatch, action }) => {
    dispatch(
      toastsAdd({
        id: Math.random().toString(36).slice(2),
        messageKey: 'general.internalError',
        messageParams: { ticketId: action.payload },
        style: 'danger',
      }),
    );
  },
};
