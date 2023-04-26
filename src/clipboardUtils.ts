import { Dispatch } from 'redux';
import { toastsAdd } from './actions/toastsActions';

export function copyToClipboard(
  dispatch: Dispatch,
  text: string,
): Promise<void> {
  return window.navigator.clipboard.writeText(text).then(
    () => {
      dispatch(
        toastsAdd({
          messageKey: 'general.copyOk',
          style: 'success',
        }),
      );
    },
    (err) => {
      dispatch(
        toastsAdd({
          messageKey: 'general.operationError',
          messageParams: { err },
          style: 'danger',
        }),
      );
    },
  );
}
