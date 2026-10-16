import { getNameFromOsmElement } from '@osm/osmNameResolver.js';
import { useEffectiveChosenLanguage } from '@shared/hooks/useEffectiveChosenLanguage.js';
import { currentVersion, type DiffElement } from '../model/changesetDiff.js';
import { useChangesetsMessages } from '../translations/useChangesetsMessages.js';

/**
 * An element's name as the map names it (`name`), and the kind with the name
 * or else the id (`label`), as a heading reads.
 */
export function useElementName() {
  const language = useEffectiveChosenLanguage();

  const cm = useChangesetsMessages();

  const name = (element: DiffElement): string | undefined =>
    getNameFromOsmElement(currentVersion(element)?.tags ?? {}, language) ||
    undefined;

  const label = (element: DiffElement): string =>
    `${cm?.element.types[element.type] ?? ''} ${name(element) ?? element.id}`;

  return { name, label };
}
