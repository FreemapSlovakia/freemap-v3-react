import { center } from '@turf/center';
import { ReactElement } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { FaPencilAlt, FaPlay, FaSearch, FaStop } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { convertToDrawing, setTool } from '../../../actions/mainActions.js';
import {
  routePlannerSetFinish,
  routePlannerSetStart,
} from '../../routePlanner/model/actions.js';
import { useAppSelector } from '../../../hooks/useAppSelector.js';
import { useMessages } from '../../../l10nInjector.js';
import '../../../styles/search.scss';
import { LongPressTooltip } from '../../../components/LongPressTooltip.js';
import { Selection } from '../../../components/Selection.js';

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
                dispatch(setTool('route-planner'));

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
                dispatch(setTool('route-planner'));

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
              const ask =
                (selectedResult.geojson?.type === 'FeatureCollection' &&
                  selectedResult.geojson.features.some(
                    (feature) => !feature.geometry.type.endsWith('Point'),
                  )) ||
                (selectedResult.geojson?.type === 'Feature' &&
                  !selectedResult.geojson.geometry.type.endsWith('Point'));

              const tolerance = ask
                ? window.prompt(m?.general.simplifyPrompt, '50')
                : '50';

              if (tolerance !== null) {
                dispatch(
                  convertToDrawing({
                    type: 'search-result',
                    tolerance: Number(tolerance || '0') / 100_000,
                  }),
                );
              }
            }}
            {...props}
          >
            <FaPencilAlt />
          </Button>
        )}
      </LongPressTooltip>
    </Selection>
  ) : null;
}
