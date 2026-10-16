import { useMessages } from '@features/l10n/l10nInjector.js';
import { getNameFromOsmElement, osmTypeAndId } from '@osm/osmNameResolver.js';
import { osmPoiKind } from '@osm/osmPoiKind.js';
import { useOsmMapping } from '@osm/useOsmMapping.js';
import { IconGlyph } from '@shared/components/IconGlyph.js';
import { useEffectiveChosenLanguage } from '@shared/hooks/useEffectiveChosenLanguage.js';
import type { ReactNode } from 'react';
import { currentVersion, type DiffElement } from '../model/changesetDiff.js';
import { diffElementIcon } from './ElementTypeIcon.js';

/**
 * An element named as the Map layers panel lists it: its name (`name`), that
 * or else its kind or else its type and id (`typeAndId`) as `text`, and that
 * after its POI icon or else its type's (`label`).
 */
export function useElementName() {
  const language = useEffectiveChosenLanguage();

  const mapping = useOsmMapping(language);

  const m = useMessages();

  const tags = (element: DiffElement) => currentVersion(element)?.tags ?? {};

  const name = (element: DiffElement): string | undefined =>
    getNameFromOsmElement(tags(element), language) || undefined;

  const typeAndId = (element: DiffElement) =>
    osmTypeAndId(m, element.type, element.id);

  const named = (element: DiffElement, generic: string) =>
    name(element) || generic || typeAndId(element);

  const text = (element: DiffElement): string =>
    named(element, osmPoiKind(tags(element), element.type, mapping).generic);

  const label = (element: DiffElement): ReactNode => {
    const { poi, generic } = osmPoiKind(tags(element), element.type, mapping);

    const Icon = diffElementIcon(element);

    return (
      <>
        {poi ? <IconGlyph poi={poi} /> : <Icon />} {named(element, generic)}
      </>
    );
  };

  return { name, typeAndId, text, label };
}
