import type { Messages } from '@/translations/messagesInterface.js';

let messages: Messages | undefined;

const listeners = new Set<() => void>();

export function getMessages(): Messages | undefined {
  return messages;
}

/**
 * The language the messages above are in, for the formatting that has to happen
 * outside React — an exporter writing a label, say, which needs a locale for
 * `Intl` and has no hook to read one from.
 */
let language = 'en';

export function getLanguage(): string {
  return language;
}

export function setLanguage(next: string): void {
  language = next;
}

export function setMessages(next: Messages | undefined): void {
  messages = next;

  for (const listener of listeners) {
    listener();
  }
}

export function subscribeMessages(listener: () => void): () => void {
  listeners.add(listener);

  return () => void listeners.delete(listener);
}
