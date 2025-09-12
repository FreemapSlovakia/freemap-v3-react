import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { is } from 'typia';
import { SearchResult } from '../actions/searchActions.js';
import { toastsAdd } from '../actions/toastsActions.js';
import { useEffectiveChosenLanguage } from '../hooks/useEffectiveChosenLanguage.js';
import { getGenericNameFromOsmElement } from '../osm/osmNameResolver.js';
import '../styles/search.scss';
import { OsmFeatureId } from '../types/featureId.js';

export function useOsmNameResolver(result: SearchResult): string | undefined {
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

  return result.genericName || genericName;
}
