import { useMessages } from '@features/l10n/l10nInjector.js';
import type { SearchResult } from '@features/search/model/actions.js';
import { useGenericNameParts } from '@osm/useGenericNameResolver.js';
import { Action, ActionDivider } from '@shared/components/ResponsiveActions.js';
import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { featureIdsEqual } from '@shared/types/featureId.js';
import { type ReactElement, useMemo } from 'react';
import { FaEyeSlash, FaMapMarkerAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { objectsSetFilter } from '../model/actions.js';
import { objectToSearchResult } from '../model/objectToSearchResult.js';
import { sameFilter, useMatchedCategories } from '../useMatchedCategories.js';
import { ObjectsConvertMenu } from './ObjectsConvertMenu.js';
import { useObjectActions } from './useObjectActions.js';

export default function ObjectSelection(): ReactElement | null {
  const m = useMessages();

  const object = useAppSelector((state) => {
    const sel = state.main.selection;

    return sel?.type === 'objects'
      ? state.objects.objects.find((o) => featureIdsEqual(o.id, sel.id))
      : undefined;
  });

  const result = useMemo<SearchResult | null>(
    () => (object ? objectToSearchResult(object) : null),
    [object],
  );

  const { actions, onSelect } = useObjectActions({ result });

  const dispatch = useDispatch();

  const active = useAppSelector((state) => state.objects.active);

  // One row per kind of this object that a filter is actually showing — named,
  // because a bare icon here would read as deleting the one object.
  const matched = useMatchedCategories(
    useGenericNameParts(result),
    object?.tags,
  );

  const hideable = matched.flatMap(({ text, category, key }) => {
    const index = category
      ? active.findIndex((item) => sameFilter(item, category.key))
      : -1;

    return index > -1 ? [{ text, index, key }] : [];
  });

  if (!object) {
    return null;
  }

  return (
    // No control to reopen a tool with: the objects toolbar is up whenever a
    // category is on, which a selected object guarantees.
    <Selection icon={<FaMapMarkerAlt />} label={m?.selections.objects}>
      <ObjectsConvertMenu
        object={object}
        onSelect={onSelect}
        leading={[
          ...hideable.map(({ text, index, key }) => (
            <Action
              key={`hide-${key}`}
              icon={<FaEyeSlash />}
              label={m?.general.hideObjectType({ name: text })}
              onClick={() => {
                dispatch(objectsSetFilter(active.toSpliced(index, 1)));
              }}
              showFrom="never"
            />
          )),

          ...(hideable.length > 0
            ? [<ActionDivider key="hide-divider" />]
            : []),
        ]}
      >
        {actions}
      </ObjectsConvertMenu>
    </Selection>
  );
}
