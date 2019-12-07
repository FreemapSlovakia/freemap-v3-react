import { deleteFeature } from 'fm3/actions/mainActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const deletefeatureTransformer: Processor<typeof deleteFeature> = {
  actionCreator: deleteFeature,
  transform: ({ getState, action }) => {
    return deleteFeature(action.payload, {
      selection: getState().main.selection,
    });
  },
};
