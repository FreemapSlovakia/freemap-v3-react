import { useMessages } from '@features/l10n/l10nInjector.js';
import { elementTypeIcon } from '@osm/elementTypeIcons.js';
import { GlyphMarker } from '@shared/components/GlyphMarker.js';
import { isClosedRing } from '@shared/geoutils.js';
import type { ReactElement } from 'react';
import type { IconType } from 'react-icons';
import { currentVersion, type DiffElement } from '../model/changesetDiff.js';

/** The element's type glyph; a way ending where it starts as closed. */
export function diffElementIcon(element: DiffElement): IconType {
  return elementTypeIcon(
    element.type,
    isClosedRing(currentVersion(element)?.coords ?? []),
  );
}

type Props = { element: DiffElement };

/**
 * An element's type as its glyph, named on hover or long press; at the size of
 * the line it is in.
 */
export function ElementTypeIcon({ element }: Props): ReactElement {
  const m = useMessages();

  const Icon = diffElementIcon(element);

  return (
    <GlyphMarker
      hint={m?.search.osmElementTypes[element.type]}
      color={null}
      size="inherit"
    >
      <Icon />
    </GlyphMarker>
  );
}
