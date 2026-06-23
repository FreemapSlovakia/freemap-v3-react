import type { Processor } from '@app/store/middleware/processorMiddleware.js';
import { combineResults } from '@shared/cancelRegister.js';
import { toastsRemove } from '../actions.js';

export const toastsCancelTypeProcessor: Processor = {
  handle: async ({ dispatch, getState, prevState, action }) => {
    const state = getState();

    const toCancel = Object.values(state.toasts.toasts).filter((toast) =>
      combineResults(
        [
          toast.cancelType === undefined
            ? undefined
            : matches(action.type, toast.cancelType),
          toast.actionPredicate?.(action),
          toast.statePredicate?.(state),
          toast.stateChangePredicate
            ? toast.stateChangePredicate(state) !==
              toast.stateChangePredicate(prevState)
            : undefined,
        ],
        toast.predicatesOperation,
      ),
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
