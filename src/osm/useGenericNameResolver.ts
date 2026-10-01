import { useMessages } from '@features/l10n/l10nInjector.js';
import type {
  SearchResult,
  SearchSource,
} from '@features/search/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { useEffectiveChosenLanguage } from '@shared/hooks/useEffectiveChosenLanguage.js';
import {
  OsmFeatureIdSchema,
  stringifyFeatureId,
} from '@shared/types/featureId.js';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  type GenericNamePart,
  getGenericNamePartsFromOsmElement,
} from './osmNameResolver.js';

/**
 * A kind as the UI shows it. `tags` only where it was resolved from OSM tags,
 * which is what lets a kind be turned into an objects filter; a kind that names
 * the source instead carries none.
 */
export type GenericNameLabel = Partial<GenericNamePart> &
  Pick<GenericNamePart, 'text'>;

/** The kinds the result is, resolved from its OSM tags where it has them. */
export function useGenericNameParts(result: SearchResult): GenericNameLabel[] {
  // Stored with what it was resolved for, so a kind is never shown against the
  // element that follows it — an answer that arrives late simply stops matching.
  const [resolved, setResolved] = useState<{
    key: string;
    parts: GenericNamePart[];
  }>();

  const language = useEffectiveChosenLanguage();

  const dispatch = useDispatch();

  const key = `${stringifyFeatureId(result.id)}\n${language}`;

  useEffect(() => {
    const parsed = OsmFeatureIdSchema.safeParse(result.id);

    if (!parsed.success || result.genericName) {
      return;
    }

    let ignore = false;

    getGenericNamePartsFromOsmElement(
      result.geojson.properties ?? {},
      parsed.data.elementType,
      language,
    ).then(
      (parts) => {
        if (!ignore) {
          setResolved({ key, parts });
        }
      },
      (err) => {
        if (ignore) {
          return;
        }

        dispatch(
          toastsAdd({
            style: 'danger',
            id: 'tag-lang-load-err',
            messageKey: 'general.loadError',
            messageParams: { err },
          }),
        );
      },
    );

    return () => {
      ignore = true;
    };
  }, [key, language, result, dispatch]);

  const m = useMessages();

  const sourceName = (
    ['bbox', 'coords', 'tile', 'geojson'] as SearchSource[]
  ).includes(result.source)
    ? m?.search.sources[result.source]
    : // An empty one is no name at all, and falls back to the OSM tags like a
      // result that carries none.
      result.genericName || undefined;

  return sourceName !== undefined
    ? [{ text: sourceName }]
    : resolved?.key === key
      ? resolved.parts
      : [];
}
