import type { Messages } from '@/translations/messagesInterface.js';

let messages: Messages | undefined;

const listeners = new Set<() => void>();

export function getMessages(): Messages | undefined {
  return messages;
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
