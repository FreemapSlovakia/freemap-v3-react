import {
  convertToDrawing,
  deleteFeature,
  selectFeature,
} from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { ObjectDetails } from '@features/objects/components/ObjectDetails.js';
import { useObjectActions } from '@features/objects/components/useObjectActions.js';
import {
  type ObjectDetailsData,
  setDetailsShown,
} from '@features/objects/model/actions.js';
import { objectDetailsSelector } from '@features/objects/model/selectors.js';
import { DockPanel } from '@shared/components/DockPanel.js';
import {
  FmFooterButton,
  FmModalFooter,
} from '@shared/components/FmModalFooter.js';
import { ActionsToggle, OpenInMenu } from '@shared/components/PanelMenus.js';
import {
  Action,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import {
  conversionSeed,
  featuresOf,
  useConvertPrompt,
} from '@shared/convertDialog.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { convertibleLines } from '@shared/simplifyTolerance.js';
import {
  featureIdsEqual,
  OsmFeatureIdSchema,
} from '@shared/types/featureId.js';
import { type ReactElement, useMemo } from 'react';
import { ButtonToolbar } from 'react-bootstrap';
import { FaPencilAlt, FaSearch, FaThumbtack, FaTrash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { type SearchResult, searchKeepResult } from '../model/actions.js';
import { resultCoords } from '../model/resultUtils.js';
import {
  activeSearchResultKeptSelector,
  activeSearchResultSelector,
} from '../model/selectors.js';

type Item = { result: SearchResult; details: ObjectDetailsData };

/**
 * The selected search result's panel. A pick that comes without it — a place
 * found by name, only being looked at — opens it on a click on the map.
 */
export default function SearchResultPanel(): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const result = useAppSelector(activeSearchResultSelector);

  const detailsShown = useAppSelector((state) => state.main.detailsShown);

  const shown = detailsShown && result !== null && !result.loading;

  const details = useAppSelector(objectDetailsSelector);

  // One identity per result and details: the panel takes a new one as new content.
  const item = useMemo<Item | null>(
    () => (result && details ? { result, details } : null),
    [result, details],
  );

  return (
    <DockPanel
      item={item}
      show={shown}
      icon={<FaSearch />}
      title={() => m?.search.result}
      manual="search"
      keepVisible={({ result }) => resultCoords(result) ?? undefined}
      onClose={() => {
        // Takes an open history along.
        dispatch(setDetailsShown(false));

        dispatch(selectFeature(null));
      }}
    >
      {({ result, details }) => (
        <>
          {!window.fmEmbedded && <Actions result={result} />}

          <ObjectDetails result={result} details={details} />
        </>
      )}
    </DockPanel>
  );
}

/**
 * Labelled while there is room; the labels go as it runs out: the delete's
 * first, then the ⋮'s, "Open in…", and "Keep on the map" last.
 */
function Actions({ result }: { result: SearchResult }): ReactElement {
  const m = useMessages();

  const dispatch = useDispatch();

  const askConversion = useConvertPrompt();

  const kept = useAppSelector(activeSearchResultKeptSelector);

  const selected = useAppSelector((state) => {
    const active = activeSearchResultSelector(state);

    return active !== null && featureIdsEqual(active.id, result.id);
  });

  const { placeActions, openInItems, onSelect } = useObjectActions({
    result,
    bindKeys: selected,
  });

  return (
    <FmModalFooter as={ButtonToolbar} className="gap-2 mb-3">
      {!kept && (
        <FmFooterButton
          variant="secondary"
          icon={<FaThumbtack />}
          label={m?.search.keepOnMap}
          priority={3}
          onClick={() => dispatch(searchKeepResult(result.id))}
        />
      )}

      <ResponsiveActions
        align="start"
        toggle={<ActionsToggle priority={1} />}
        toggleLabel={m?.general.actions}
        onSelect={onSelect}
      >
        <Action
          icon={<FaPencilAlt />}
          label={m?.general.convertToDrawing}
          onClick={() => {
            const { geojson } = result;

            void askConversion({
              lines: geojson ? convertibleLines(geojson) : [],
              osm: OsmFeatureIdSchema.safeParse(result.id).success,
              ...conversionSeed(featuresOf(geojson)),
            }).then((choices) => {
              if (!choices) {
                return;
              }

              dispatch(
                convertToDrawing({
                  type: 'search-result',
                  tolerance: choices.tolerance,
                  carry: choices.carry,
                }),
              );
            });
          }}
          showFrom="never"
        />

        {placeActions}
      </ResponsiveActions>

      <OpenInMenu items={openInItems} onSelect={onSelect} priority={2} />

      {kept && (
        <FmFooterButton
          variant="danger"
          icon={<FaTrash />}
          label={m?.general.delete}
          kbd="Del"
          priority={0}
          onClick={() => dispatch(deleteFeature())}
        />
      )}
    </FmModalFooter>
  );
}
