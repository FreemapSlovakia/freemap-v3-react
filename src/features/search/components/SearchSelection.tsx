import {
  convertToDrawing,
  setActiveModal,
  setTool,
} from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  routePlannerSetFinish,
  routePlannerSetStart,
} from '@features/routePlanner/model/actions.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { center } from '@turf/center';
import { ReactElement } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import {
  FaPaintBrush,
  FaPencilAlt,
  FaPlay,
  FaSearch,
  FaStop,
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';

type Props = {
  hidden?: boolean;
};

export function SearchSelection({ hidden }: Props): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const selectedResult = useAppSelector((state) => state.search.selectedResult);

  return selectedResult && !window.fmEmbedded && !hidden ? (
    <Selection icon={<FaSearch />} label={m?.search.result} deletable>
      <ButtonGroup className="ms-1">
        <LongPressTooltip label={m?.search.routeFrom}>
          {({ props }) => (
            <Button
              variant="secondary"
              {...props}
              onClick={() => {
                dispatch(setTool({ tool: 'route-planner', mode: 'activate' }));

                if (selectedResult.geojson) {
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
                dispatch(setTool({ tool: 'route-planner', mode: 'activate' }));

                if (selectedResult.geojson) {
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
