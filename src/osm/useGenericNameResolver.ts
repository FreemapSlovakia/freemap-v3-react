import { useMessages } from '@features/l10n/l10nInjector.js';
import '@features/search/components/SearchMenu.scss';
import { SearchResult, SearchSource } from '@features/search/model/actions.js';
import { toastsAdd } from '@features/toasts/model/actions.js';
import { useEffectiveChosenLanguage } from '@shared/hooks/useEffectiveChosenLanguage.js';
import { OsmFeatureIdSchema } from '@shared/types/featureId.js';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getGenericNameFromOsmElement } from './osmNameResolver.js';

export function useGenericNameResolver(
  result: SearchResult,
): string | undefined {
  const [genericName, setGenericName] = useState<string | undefined>();

  const language = useEffectiveChosenLanguage();

  const dispatch = useDispatch();

  useEffect(() => {
    const parsed = OsmFeatureIdSchema.safeParse(result.id);

    if (!parsed.success || result.genericName) {
      return;
    }

    getGenericNameFromOsmElement(
      result.geojson.properties ?? {},
      parsed.data.elementType,
      language,
    ).then(setGenericName, (err) => {
      dispatch(
        toastsAdd({
          style: 'danger',
          id: 'tag-lang-load-err',
          messageKey: 'general.loadError',
          messageParams: { err },
        }),
      );
    });
  }, [language, result, dispatch]);

  const m = useMessages();

  return (['bbox', 'coords', 'tile', 'geojson'] as SearchSource[]).includes(
    result.source,
  )
    ? m?.search.sources[result.source]
    : result.genericName || genericName;
}
