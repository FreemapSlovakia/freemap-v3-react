import { openTool } from '@app/store/actions.js';
import { isToolOpen } from '@app/store/selectors.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  routePlannerSetFinish,
  routePlannerSetStart,
} from '@features/routePlanner/model/actions.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { useOnline } from '@shared/hooks/useOnline.js';
import { featureIdsEqual } from '@shared/types/featureId.js';
import type { ReactElement } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { FaMapMarkerAlt, FaPlay, FaStop } from 'react-icons/fa';
import { TbMapPins } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { DetailsToggle } from './DetailsToggle.js';
import { ObjectsConvertMenu } from './ObjectsConvertMenu.js';

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
  const dispatch = useDispatch();

  const online = useOnline();

  const m = useMessages();

  const object = useAppSelector((state) => {
    const sel = state.main.selection;

    return sel?.type === 'objects'
      ? state.objects.objects.find((o) => featureIdsEqual(o.id, sel.id))
      : undefined;
  });

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

      {!window.fmEmbedded && (
        <ButtonGroup>
          <LongPressTooltip label={m?.search.routeFrom}>
            {({ props }) => (
              <Button
                variant="secondary"
                disabled={!online}
                onClick={() => {
                  dispatch(openTool('route-planner'));

                  dispatch(
                    routePlannerSetStart({
                      lat: object.coords.lat,
                      lon: object.coords.lon,
                    }),
                  );
                }}
                {...props}
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

                  dispatch(
                    routePlannerSetFinish({
                      lat: object.coords.lat,
                      lon: object.coords.lon,
                    }),
                  );
                }}
                {...props}
              >
                <FaStop color="#FF6347" />
              </Button>
            )}
          </LongPressTooltip>
        </ButtonGroup>
      )}

      <ObjectsConvertMenu object={object} />
    </Selection>
  );
}
