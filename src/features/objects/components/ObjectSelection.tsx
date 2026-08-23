import { openTool } from '@app/store/actions.js';
import { isToolOpen } from '@app/store/selectors.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import type { SearchResult } from '@features/search/model/actions.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { featureIdsEqual } from '@shared/types/featureId.js';
import { type ReactElement, useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { TbMapPins } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { objectToSearchResult } from '../model/objectToSearchResult.js';
import { DetailsToggle } from './DetailsToggle.js';
import { ObjectsConvertMenu } from './ObjectsConvertMenu.js';
import { useObjectActions } from './useObjectActions.js';

function ObjectsToggleButton(): ReactElement {
  const objectsOpen = useAppSelector((state) => isToolOpen(state, 'objects'));

  const m = useMessages();

  const dispatch = useDispatch();

  return (
    <LongPressTooltip label={m?.tools.objects}>
      {({ props }) => (
        <Button
          {...props}
          variant="dark"
          disabled={objectsOpen}
          onClick={() => dispatch(openTool('objects'))}
        >
          <TbMapPins />
        </Button>
      )}
    </LongPressTooltip>
  );
}

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

  if (!object) {
    return null;
  }

  return (
    <Selection
      control={<ObjectsToggleButton />}
      icon={<FaMapMarkerAlt />}
      label={m?.selections.objects}
    >
      <DetailsToggle />

      <ObjectsConvertMenu object={object} onSelect={onSelect}>
        {actions}
      </ObjectsConvertMenu>
    </Selection>
  );
}
