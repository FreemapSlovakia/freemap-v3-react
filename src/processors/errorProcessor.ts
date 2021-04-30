import { setErrorTicketId } from 'fm3/actions/mainActions';
import { toastsAdd } from 'fm3/actions/toastsActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const errorProcessor: Processor<typeof setErrorTicketId> = {
  actionCreator: setErrorTicketId,
  async handle({ dispatch, action }) {
    dispatch(
      toastsAdd({
        messageKey: 'general.internalError',
        messageParams: { ticketId: action.payload },
        style: 'danger',
      }),
    );
  },
};
