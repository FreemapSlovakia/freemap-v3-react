import { convertToDrawing, setTool } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  routePlannerSetFinish,
  routePlannerSetStart,
} from '@features/routePlanner/model/actions.js';
import { ActionIcon, Button } from '@mantine/core';
import { MantineLongPressTooltip } from '@shared/components/MantineLongPressTooltip.js';
import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { center } from '@turf/center';
import { ReactElement } from 'react';
import { FaPencilAlt, FaPlay, FaSearch, FaStop } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import './SearchMenu.scss';

type Props = {
  hidden?: boolean;
};

export function SearchSelection({ hidden }: Props): ReactElement | null {
  const m = useMessages();

  const dispatch = useDispatch();

  const selectedResult = useAppSelector((state) => state.search.selectedResult);

  return selectedResult && !window.fmEmbedded && !hidden ? (
    <Selection icon={<FaSearch />} label={m?.search.result} deletable>
      <Button.Group className="ms-1">
        <MantineLongPressTooltip label={m?.search.routeFrom}>
          {({ props }) => (
            <Button
              color="gray"
              size="sm"
              leftSection={<FaPlay color="#32CD32" />}
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
              {...props}
            />
          )}
        </MantineLongPressTooltip>

        <MantineLongPressTooltip label={m?.search.routeTo}>
          {({ props }) => (
            <Button
              color="gray"
              size="sm"
              leftSection={<FaStop color="#FF6347" />}
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
            />
          )}
        </MantineLongPressTooltip>
      </Button.Group>

      <MantineLongPressTooltip label={m?.general.convertToDrawing}>
        {({ props }) => (
          <ActionIcon
            className="ms-1"
            variant="filled"
            color="gray"
            size="input-sm"
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
          </ActionIcon>
        )}
      </MantineLongPressTooltip>
    </Selection>
  ) : null;
}
