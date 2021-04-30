import { toastsRemove } from 'fm3/actions/toastsActions';
import { Processor } from 'fm3/middlewares/processorMiddleware';

export const toastsCancelTypeProcessor: Processor = {
  handle: async ({ dispatch, getState, action }) => {
    getState()
      .toasts.toasts.filter(({ cancelType }) =>
        matches(action.type, cancelType),
      )
      .forEach(({ id }) => {
        dispatch(toastsRemove(id));
      });
  },
};

function matches(
  value: string,
  test: string | string[] | RegExp | undefined,
): boolean {
  if (test === undefined) {
    return false;
  }

  if (typeof test === 'string') {
    return value === test;
  }

  if (Array.isArray(test)) {
    return test.some((p) => matches(value, p));
  }

  if (test instanceof RegExp) {
    return test.test(value);
  }

  throw new Error('unsupported test value');
}
