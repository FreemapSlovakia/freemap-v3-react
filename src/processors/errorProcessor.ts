import { IProcessor } from 'fm3/middlewares/processorMiddleware';
import { setErrorTicketId } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';

export const errorProcessor: IProcessor<typeof setErrorTicketId> = {
  actionCreator: setErrorTicketId,
  handle: async ({ dispatch, action }) => {
    dispatch(
      toastsAdd({
        messageKey: 'general.internalError',
        messageParams: { ticketId: action.payload },
        style: 'danger',
      }),
    );
  },
};
