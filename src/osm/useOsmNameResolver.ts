import { getNameFromOsmElement } from 'fm3/osm/osmNameResolver';
import 'fm3/styles/search.scss';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export function useOsmNameResolver(
  osmType: 'node' | 'way' | 'relation',
  tags: Record<string, string>,
): [string, string] | undefined {
  const [subjectAndName, setSubjectAndName] = useState<
    [string, string] | undefined
  >();

  const suppLang = useSelector((state) =>
    ['sk', 'cs'].includes(state.l10n.language) ? 'sk' : 'en',
  );

  useEffect(() => {
    getNameFromOsmElement(tags, osmType, suppLang).then(setSubjectAndName); // TODO catch
  }, [suppLang, tags, osmType]);

  return subjectAndName;
}
