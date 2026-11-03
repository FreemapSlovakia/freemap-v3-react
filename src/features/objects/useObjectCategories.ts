import { toastsAdd } from '@features/toasts/model/actions.js';
import { getOsmMapping } from '@osm/osmNameResolver.js';
import { useEffectiveChosenLanguage } from '@shared/hooks/useEffectiveChosenLanguage.js';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { type ObjectCategory, objectCategories } from './objectCategories.js';

/**
 * Per language, and module-level: the walk over the tag-to-name mapping yields
 * ~1800 categories and is the same answer for every caller.
 */
const cache = new Map<string, ObjectCategory[]>();

const EMPTY: ObjectCategory[] = [];

/**
 * Every POI category the objects filter can hold, named in the chosen
 * language. Empty until the mapping chunk lands, so a caller shows no
 * categories rather than waiting on one.
 */
export function useObjectCategories(enabled = true): ObjectCategory[] {
  const language = useEffectiveChosenLanguage();

  const dispatch = useDispatch();

  // Holds what it was loaded for, so a language switch doesn't show the
  // previous language's names until the new ones arrive.
  const [loaded, setLoaded] = useState<
    { language: string; categories: ObjectCategory[] } | undefined
  >(() => {
    // Lazily from the cache, so a caller mounting after someone else has
    // loaded the language renders the categories straight away rather than a
    // frame later.
    const cached = cache.get(language);

    return cached ? { language, categories: cached } : undefined;
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const cached = cache.get(language);

    // Through state even when another caller has already filled the cache: a
    // render-time read of module state is what the React Compiler freezes
    // (see `doc/react-compiler.md`), and nothing here would re-render to undo
    // it — the categories would stay empty for the rest of the session.
    if (cached) {
      setLoaded({ language, categories: cached });

      return;
    }

    let ignore = false;

    getOsmMapping(language).then(
      (mapping) => {
        const categories = objectCategories(mapping);

        cache.set(language, categories);

        if (!ignore) {
          setLoaded({ language, categories });
        }
      },
      (err) => {
        if (!ignore) {
          dispatch(
            toastsAdd({
              style: 'danger',
              id: 'tag-lang-load-err',
              messageKey: 'general.loadError',
              messageParams: { err },
            }),
          );
        }
      },
    );

    return () => {
      ignore = true;
    };
  }, [enabled, language, dispatch]);

  return loaded?.language === language ? loaded.categories : EMPTY;
}
