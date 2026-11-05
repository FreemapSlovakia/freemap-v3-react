import { selectFeature } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import type { SearchResult } from '@features/search/model/actions.js';
import { resultCoords } from '@features/search/model/resultUtils.js';
import { DockPanel } from '@shared/components/DockPanel.js';
import { FmModalFooter } from '@shared/components/FmModalFooter.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { featureIdsEqual } from '@shared/types/featureId.js';
import { type ReactElement, useMemo } from 'react';
import { ButtonToolbar } from 'react-bootstrap';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  type ObjectDetailsData,
  type ObjectsResult,
  setDetailsShown,
} from '../model/actions.js';
import { objectToSearchResult } from '../model/objectToSearchResult.js';
import { objectDetailsSelector } from '../model/selectors.js';
import { ObjectDetails } from './ObjectDetails.js';
import { ObjectsConvertMenu } from './ObjectsConvertMenu.js';
import { ActionsToggle, OpenInMenu } from './OpenInMenu.js';
import { useObjectActions } from './useObjectActions.js';

type Item = {
  object: ObjectsResult;
  result: SearchResult;
  details: ObjectDetailsData;
};

/** The selected object's panel. */
export default function ObjectSelection(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const object = useAppSelector((state) => {
    const sel = state.main.selection;

    return sel?.type === 'objects'
      ? state.objects.objects.find((o) => featureIdsEqual(o.id, sel.id))
      : undefined;
  });

  const details = useAppSelector(objectDetailsSelector);

  // One identity per object and details: the panel takes a new one as new content.
  const item = useMemo<Item | null>(
    () =>
      object && details
        ? { object, result: objectToSearchResult(object), details }
        : null,
    [object, details],
  );

  return (
    <DockPanel
      item={item}
      show={object !== undefined}
      icon={<FaMapMarkerAlt />}
      title={() => m?.selections.objects}
      manual="objects"
      keepVisible={({ result }) => resultCoords(result) ?? undefined}
      onClose={() => {
        // Takes an open history along.
        dispatch(setDetailsShown(false));

        dispatch(selectFeature(null));
      }}
    >
      {({ object, result, details }) => (
        <>
          {!window.fmEmbedded && (
            <ObjectActions object={object} result={result} />
          )}

          <ObjectDetails result={result} details={details} />
        </>
      )}
    </DockPanel>
  );
}

function ObjectActions({
  object,
  result,
}: {
  object: ObjectsResult;
  result: SearchResult;
}): ReactElement {
  const selected = useAppSelector((state) => {
    const sel = state.main.selection;

    return sel?.type === 'objects' && featureIdsEqual(sel.id, object.id);
  });

  const { placeActions, openInItems, onSelect } = useObjectActions({
    result,
    bindKeys: selected,
  });

  // Labelled while there is room; the ⋮'s generic one goes first.
  return (
    <FmModalFooter as={ButtonToolbar} className="gap-2 mb-3">
      <ObjectsConvertMenu
        object={object}
        onSelect={onSelect}
        toggle={<ActionsToggle priority={0} />}
      >
        {placeActions}
      </ObjectsConvertMenu>

      <OpenInMenu items={openInItems} onSelect={onSelect} priority={1} />
    </FmModalFooter>
  );
}
