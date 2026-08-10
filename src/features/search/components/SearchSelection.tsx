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
import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
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

  const selectedResult = useAppSelector(activeSearchResultSelector);

  // Off for every freshly picked result: it is on the map because it is being
  // looked at, and goes when that stops. Switching it on keeps it there.
  const kept = useAppSelector(activeSearchResultKeptSelector);

  return selectedResult &&
    !selectedResult.loading &&
    !window.fmEmbedded &&
    !hidden ? (
    // No delete button: a search result is an element that exists whether it is
    // looked at or not, so there is nothing of the user's to destroy — the same
    // reason objects and route legs offer none. The two controls are presence
    // (the toggle below) and attention (the × in the toolbar); taking a result
    // off the map is the two of them together, and Del is the shortcut for it.
    <Selection icon={<FaSearch />} label={m?.search.result}>
      <DetailsToggle />

      <LongPressTooltip breakpoint="md" label={m?.search.keepOnMap}>
        {({ label, labelClassName, props }) => (
          <Button
            className="ms-1"
            variant="secondary"
            active={kept}
            aria-pressed={kept}
            onClick={() => {
              dispatch(
                searchKeepResult({ id: selectedResult.id, keep: !kept }),
              );
            }}
            {...props}
          >
            <FaThumbtack />
            <span className={labelClassName}> {label}</span>
          </Button>
        )}
      </LongPressTooltip>

      <ButtonGroup className="ms-1">
        <LongPressTooltip label={m?.search.routeFrom}>
          {({ props }) => (
            <Button
              variant="secondary"
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

      <LongPressTooltip label={m?.general.convertToDrawing}>
        {({ props }) => (
          <Button
            className="ms-1"
            variant="secondary"
            onClick={() => {
              dispatch(convertToDrawing({ type: 'search-result' }));
            }}
            {...props}
          >
            <FaPencilAlt />
          </Button>
        )}
      </LongPressTooltip>

      <LongPressTooltip label={m?.mapLayers.searchResultStyle}>
        {({ props }) => (
          <Button
            className="ms-1"
            variant="secondary"
            onClick={() => {
              dispatch(setActiveModal({ type: 'search-result-style' }));
            }}
            {...props}
          >
            <FaPaintBrush />
          </Button>
        )}
      </LongPressTooltip>
    </Selection>
  ) : null;
}
