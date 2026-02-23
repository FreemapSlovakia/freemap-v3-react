import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { is } from 'typia';
import {
  SearchResult,
  SearchSource,
} from '../features/search/model/actions.js';
import { toastsAdd } from '../features/toasts/model/actions.js';
import { useEffectiveChosenLanguage } from '../hooks/useEffectiveChosenLanguage.js';
import { useMessages } from '../l10nInjector.js';
import '../styles/search.scss';
import { OsmFeatureId } from '../types/featureId.js';
import { getGenericNameFromOsmElement } from './osmNameResolver.js';

export function useGenericNameResolver(
  result: SearchResult,
): string | undefined {
  const [genericName, setGenericName] = useState<string | undefined>();

  const language = useEffectiveChosenLanguage();

  const dispatch = useDispatch();

  useEffect(() => {
    if (!is<OsmFeatureId>(result.id) || result.genericName) {
      return;
    }

    getGenericNameFromOsmElement(
      result.geojson.properties ?? {},
      result.id.elementType,
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
