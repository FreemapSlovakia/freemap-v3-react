import { toastsAdd } from 'fm3/actions/toastsActions';
import { getNameFromOsmElement } from 'fm3/osm/osmNameResolver';
import 'fm3/styles/search.scss';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export function useOsmNameResolver(
  osmType: 'node' | 'way' | 'relation',
  tags: Record<string, string>,
): [string, string] | undefined {
  const [subjectAndName, setSubjectAndName] = useState<
    [string, string] | undefined
  >();

  const language = useSelector((state) => state.l10n.language);

  const dispatch = useDispatch();

  useEffect(() => {
    getNameFromOsmElement(tags, osmType, language).then(
      setSubjectAndName,
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

  return subjectAndName;
}
