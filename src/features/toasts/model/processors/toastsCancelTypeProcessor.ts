import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { toastsRemove } from '../actions.js';

export const toastsCancelTypeProcessor: Processor = {
  handle: async ({ dispatch, getState, action }) => {
    const toCancel = Object.values(getState().toasts.toasts).filter(
      ({ cancelType }) => matches(action.type, cancelType),
    );

    for (const { id } of toCancel) {
      dispatch(toastsRemove(id));
    }
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
