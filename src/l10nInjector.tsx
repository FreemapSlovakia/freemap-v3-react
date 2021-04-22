import { useSelector } from 'react-redux';
import { Messages } from './translations/messagesInterface';

export function useMessages(): Messages | undefined {
  // force applying english language on load
  useSelector((state) => state.l10n.counter);

  return window.translations;
}

export function getMessageByKey(m: Messages | undefined, key: string): unknown {
  if (m === undefined) {
    return;
  }

  const path = key.split('.');

  let cur = m as unknown;

  for (const item of path) {
    if (cur instanceof Object) {
      cur = (cur as Record<string, unknown>)[item];
    } else {
      return '…';
    }
  }

  return cur;
}
