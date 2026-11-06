import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { getJson } from '../model/article.js';
import {
  fetchWikidataItem,
  isWikidataRef,
  type WikidataItem,
} from '../model/wikidata.js';
import { type Loaded, useCached } from './useCached.js';

/** One request per item, however many components read it; `ref` as `isWikidataRef` takes it. */
export function useWikidataItem(ref: string | undefined): Loaded<WikidataItem> {
  const language = useAppSelector((state) => state.l10n.language);

  return useCached(
    ref && isWikidataRef(ref) ? `wikidata:${language}:${ref}` : null,
    () => fetchWikidataItem(getJson, ref!, language),
  );
}
