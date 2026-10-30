import dict from 'virtual/manual-dict.js';
import { localizeEntries } from '@/documents/index.js';

export function getManualChapters(lang: string) {
  return localizeEntries(dict, lang);
}
