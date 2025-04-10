import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toastsAdd } from '../actions/toastsActions.js';
import { useEffectiveChosenLanguage } from '../hooks/useEffectiveChosenLanguage.js';
import { getGenericNameFromOsmElement } from '../osm/osmNameResolver.js';
import '../styles/search.scss';

export function useOsmNameResolver(
  osmType: 'node' | 'way' | 'relation',
  tags: Record<string, string>,
): string | undefined {
  const [genericName, setGenericName] = useState<string | undefined>();

  const language = useEffectiveChosenLanguage();

  const dispatch = useDispatch();

  useEffect(() => {
    getGenericNameFromOsmElement(tags, osmType, language).then(
      setGenericName,
      (err) => {
        dispatch(
          toastsAdd({
            id: 'tag-lang-load-err',
            messageKey: 'general.loadError',
            messageParams: { err },
          }),
        );
      },
    );
  }, [language, tags, osmType, dispatch]);

  return genericName;
}
