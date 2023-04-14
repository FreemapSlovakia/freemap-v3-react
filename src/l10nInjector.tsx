import { useMemo } from 'react';
import { useAppSelector } from './hooks/reduxSelectHook';
import { useLazy } from './hooks/useLazy';
import { Messages } from './translations/messagesInterface';

export function useLocalMessages<T>(
  factory: (language: string) => Promise<{ default: T }>,
): T | undefined {
  const language = useAppSelector((state) => state.l10n.language);

  // NOTE factory dependenct is disabled for simpler parent code
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const f = useMemo(() => factory.bind(undefined, language), [language]);

  return useLazy(f);
}

export function useMessages(): Messages | undefined {
  // force applying english language on load
  useAppSelector((state) => state.l10n.counter);

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
