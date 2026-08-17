import {
  convertToDrawing,
  openTool,
  setActiveModal,
} from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { DetailsToggle } from '@features/objects/components/DetailsToggle.js';
import {
  routePlannerSetFinish,
  routePlannerSetStart,
} from '@features/routePlanner/model/actions.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import {
  Action,
  ResponsiveActions,
} from '@shared/components/ResponsiveActions.js';
import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import { useSimplifyPrompt } from '@shared/hooks/useSimplifyPrompt.js';
import { convertibleLines } from '@shared/simplifyTolerance.js';
import { center } from '@turf/center';
import type { ReactElement } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import {
  FaPaintBrush,
  FaPencilAlt,
  FaPlay,
  FaSearch,
  FaStop,
  FaThumbtack,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { searchKeepResult } from '../model/actions.js';
import { hasGeometry } from '../model/resultUtils.js';
import {
  activeSearchResultKeptSelector,
  activeSearchResultSelector,
} from '../model/selectors.js';

type Props = {
  hidden?: boolean;
};

export function SearchSelection({ hidden }: Props): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const online = useOnline();

  const askSimplification = useSimplifyPrompt();

  const selectedResult = useAppSelector(activeSearchResultSelector);

  // False for every freshly picked result: it is on the map because it is being
  // looked at, and goes when that stops.
  const kept = useAppSelector(activeSearchResultKeptSelector);

  return selectedResult &&
    !selectedResult.loading &&
    !window.fmEmbedded &&
    !hidden ? (
    // One button says what can be done about the result being on the map, and
    // which one it is says what it is doing there: a result being looked at can
    // be kept, and a kept one can be taken off. They share the slot the delete
    // button holds on every other selection toolbar, right before the ×.
    <Selection icon={<FaSearch />} label={m?.search.result} deletable={kept}>
      <DetailsToggle />

      <ButtonGroup>
        <LongPressTooltip label={m?.search.routeFrom}>
          {({ props }) => (
            <Button
              variant="secondary"
              disabled={!online}
              {...props}
              onClick={() => {
                dispatch(openTool('route-planner'));

                if (hasGeometry(selectedResult)) {
                  const c = center(selectedResult.geojson).geometry.coordinates;

                  dispatch(
                    routePlannerSetStart({
                      lat: c[1],
                      lon: c[0],
                    }),
                  );
                }
              }}
            >
              <FaPlay color="#32CD32" />
            </Button>
          )}
        </LongPressTooltip>

        <LongPressTooltip label={m?.search.routeTo}>
          {({ props }) => (
            <Button
              variant="secondary"
              disabled={!online}
              onClick={() => {
                dispatch(openTool('route-planner'));

                if (hasGeometry(selectedResult)) {
                  const c = center(selectedResult.geojson).geometry.coordinates;

                  dispatch(
                    routePlannerSetFinish({
                      lat: c[1],
                      lon: c[0],
                    }),
                  );
                }
              }}
              {...props}
            >
              <FaStop color="#FF6347" />
            </Button>
          )}
        </LongPressTooltip>
      </ButtonGroup>

      <ResponsiveActions gap={1} align="start" toggleLabel={m?.general.actions}>
        <Action
          icon={<FaPencilAlt />}
          label={m?.general.convertToDrawing}
          onClick={() => {
            const tolerance = askSimplification(
              selectedResult.geojson
                ? convertibleLines(selectedResult.geojson)
                : [],
            );

            if (tolerance !== null) {
              dispatch(convertToDrawing({ type: 'search-result', tolerance }));
            }
          }}
          showFrom="sm"
          showLabelFrom="md"
        />

        <Action
          icon={<FaPaintBrush />}
          label={m?.mapLayers.lookupStyle}
          onClick={() => {
            dispatch(setActiveModal({ type: 'search-result-style' }));
          }}
          showFrom="never"
        />
      </ResponsiveActions>

      {!kept && (
        <LongPressTooltip breakpoint="sm" label={m?.search.keepOnMap}>
          {({ label, labelClassName, props }) => (
            <Button
              variant="secondary"
              onClick={() => {
                dispatch(searchKeepResult(selectedResult.id));
              }}
              {...props}
            >
              <FaThumbtack />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>
      )}
    </Selection>
  ) : null;
}
