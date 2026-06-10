import { useEffect, useSyncExternalStore } from 'react';

// Per-component document-title contributions (e.g. a modal adding its name to
// the browser-tab title). Modals are mutually exclusive, but we keep a stack
// keyed by id so a brief mount/unmount overlap during a modal switch resolves
// to the most recently mounted title instead of being cleared by the outgoing
// one's cleanup. The base app title and the actual DOM update live in
// `useHtmlMeta`, which reads `useDocumentSubTitle()`.
type Entry = { id: number; title: string };

let entries: Entry[] = [];

let nextId = 0;

const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function getSubTitle(): string | undefined {
  return entries.at(-1)?.title;
}

// Contributes a document-title prefix while the calling component is mounted.
// Pass `undefined` (e.g. messages not loaded yet) to contribute nothing.
export function useDocumentTitle(title: string | undefined): void {
  useEffect(() => {
    if (!title) {
      return;
    }

    const id = nextId++;

    entries.push({ id, title });

    emit();

    return () => {
      entries = entries.filter((entry) => entry.id !== id);

      emit();
    };
  }, [title]);
}

// The current title prefix (most recently mounted contributor), or `undefined`.
export function useDocumentSubTitle(): string | undefined {
  return useSyncExternalStore(subscribe, getSubTitle, getSubTitle);
}
