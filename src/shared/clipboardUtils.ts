import { toastsAdd } from '@features/toasts/model/actions.js';
import { Dispatch } from 'redux';

export function copyToClipboard(
  dispatch: Dispatch,
  text: string,
): Promise<void> {
  return window.navigator.clipboard.writeText(text).then(
    () => {
      dispatch(
        toastsAdd({
          messageKey: 'general.copyOk',
          color: 'green',
        }),
      );
    },
    (err) => {
      dispatch(
        toastsAdd({
          messageKey: 'general.operationError',
          messageParams: { err },
          color: 'red',
        }),
      );
    },
  );
}
