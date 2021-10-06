import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Messages } from './translations/messagesInterface';

export function useLocalMessages<T>(
  factory: (language: string) => Promise<{ default: T }>,
): T | undefined {
  const language = useSelector((state) => state.l10n.language);

  const [messages, setMessages] = useState<T>();

  useEffect(() => {
    factory(language).then((m) => {
      setMessages(m.default);
    });
    // NOTE factory is missing in the dependencies for simpler parent code
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  return messages;
}

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
