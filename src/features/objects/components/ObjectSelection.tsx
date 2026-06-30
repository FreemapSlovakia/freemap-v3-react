import { convertToDrawing, setTool } from '@app/store/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import {
  routePlannerSetFinish,
  routePlannerSetStart,
} from '@features/routePlanner/model/actions.js';
import { searchSelectResult } from '@features/search/model/actions.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Selection } from '@shared/components/Selection.js';
import { fixedPopperConfig } from '@shared/fixedPopperConfig.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { featureIdsEqual } from '@shared/types/featureId.js';
import { point } from '@turf/helpers';
import type { ReactElement } from 'react';
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap';
import {
  FaMapMarkerAlt,
  FaPencilAlt,
  FaPlay,
  FaSearch,
  FaStop,
} from 'react-icons/fa';
import { TbMapPins } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { useObjectsMessages } from '../translations/useObjectsMessages.js';

function ObjectsToggleButton(): ReactElement {
  const objectsOpen = useAppSelector((state) =>
    state.main.tools.includes('objects'),
  );

  const m = useMessages();

  const dispatch = useDispatch();

  return (
    <LongPressTooltip label={m?.tools.objects}>
      {({ props }) => (
        <Button
          {...props}
          variant="dark"
          disabled={objectsOpen}
          onClick={() => dispatch(setTool({ tool: 'objects', mode: 'open' }))}
        >
          <TbMapPins />
        </Button>
      )}
    </LongPressTooltip>
  );
}

export default function ObjectSelection(): ReactElement | null {
  const dispatch = useDispatch();

  const m = useMessages();

  const om = useObjectsMessages();

  const object = useAppSelector((state) => {
    const sel = state.main.selection;

    return sel?.type === 'objects'
      ? state.objects.objects.find((o) => featureIdsEqual(o.id, sel.id))
      : undefined;
  });

  if (!object) {
    return null;
  }

  const hasGeometry = object.id.elementType !== 'node';

  return (
    <Selection
      icon={
        <>
          <ObjectsToggleButton /> <FaMapMarkerAlt />
        </>
      }
      label={m?.selections.objects}
      noLeftMargin
    >
      {!window.fmEmbedded && (
        <ButtonGroup className="ms-1">
          <LongPressTooltip label={m?.search.routeFrom}>
            {({ props }) => (
              <Button
                variant="secondary"
                onClick={() => {
                  dispatch(
                    setTool({ tool: 'route-planner', mode: 'activate' }),
                  );

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
                onClick={() => {
                  dispatch(
                    setTool({ tool: 'route-planner', mode: 'activate' }),
                  );

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

      <Dropdown as={ButtonGroup} className="ms-1">
        <LongPressTooltip breakpoint="lg" label={m?.general.convertToDrawing}>
          {({ label, labelClassName, props }) => (
            <Button
              variant="secondary"
              onClick={() => {
                dispatch(convertToDrawing({ type: 'objects', id: object.id }));
              }}
              {...props}
            >
              <FaPencilAlt />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>

        <Dropdown.Toggle split variant="secondary" id="object-convert-split" />

        <Dropdown.Menu popperConfig={fixedPopperConfig}>
          <Dropdown.Item
            onClick={() => {
              dispatch(convertToDrawing({ type: 'objects', id: object.id }));
            }}
          >
            <FaPencilAlt /> {om?.convertAsPoint}
          </Dropdown.Item>

          {hasGeometry && (
            <Dropdown.Item
              onClick={() => {
                dispatch(
                  convertToDrawing({
                    type: 'objects-geometry',
                    id: object.id,
                  }),
                );
              }}
            >
              <FaPencilAlt /> {om?.convertWithGeometry}
            </Dropdown.Item>
          )}

          <Dropdown.Divider />

          <Dropdown.Item
            onClick={() => {
              dispatch(
                searchSelectResult({
                  result: {
                    source: 'osm',
                    id: object.id,
                    geojson: point(
                      [object.coords.lon, object.coords.lat],
                      object.tags,
                    ),
                    incomplete: true,
                  },
                  showToast: true,
                }),
              );
            }}
          >
            <FaSearch /> {om?.showAsLookup}
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Selection>
  );
}
