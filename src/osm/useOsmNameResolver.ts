import { toastsAdd } from 'fm3/actions/toastsActions';
import { useEffectiveChosenLanguage } from 'fm3/hooks/useEffectiveChosenLanguage';
import { getGenericNameFromOsmElement } from 'fm3/osm/osmNameResolver';
import 'fm3/styles/search.scss';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

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
