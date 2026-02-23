import { setErrorTicketId } from '../actions/mainActions.js';
import { toastsAdd } from '../features/toasts/model/actions.js';
import type { Processor } from '../middlewares/processorMiddleware.js';

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
