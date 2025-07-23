import dict, { type MarkdownEntry } from 'virtual/markdown-dict.js';

export function getDocuments(lang: string) {
  const map = new Map<string, MarkdownEntry>();

  for (const doc of dict) {
    if (doc.lang === 'en') {
      map.set(doc.key, doc);
    }
  }

  for (const doc of dict) {
    if (doc.lang === lang) {
      map.set(doc.key, { ...(map.get(doc.key) ?? {}), ...doc });
    }
  }

  return [...map.values()].sort(
    (a, b) => (a.order ?? 1_000_000) - (b.order ?? 1_000_000),
  );
}
