import { setActiveModal } from '@app/store/actions.js';
import { useConvertToDataViewer } from '@features/dataViewer/hooks/useConvertToDataViewer.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { OpenInExternalAppMenuButton } from '@features/openInExternalApp/components/OpenInExternalAppMenuButton.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { RouteEndpointItems } from '@shared/components/RouteEndpointItems.js';
import { Selection } from '@shared/components/Selection.js';
import { ViewFromHereItems } from '@shared/components/ViewFromHereItems.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { destination } from '@turf/destination';
import { type ReactElement, useCallback, useMemo, useState } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { FaEllipsisV, FaMapMarkerAlt, FaTag } from 'react-icons/fa';
import { MdShapeLine } from 'react-icons/md';
import { TbAngle } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { drawingPointAdd } from '../model/actions/drawingPointActions.js';
import { drawingOsmTags } from '../osmTags.js';
import { useDrawingMessages } from '../translations/useDrawingMessages.js';
import { DrawingToggleButton } from './DrawingToggleButton.js';
import { ProjectPointModal } from './ProjectPointModal.js';

export default function DrawingPointSelection(): ReactElement | null {
  const dispatch = useDispatch();

  const m = useMessages();

  const dm = useDrawingMessages();

  const convertToDataViewer = useConvertToDataViewer();

  const index = useAppSelector((state) =>
    state.main.selection?.type === 'draw-points'
      ? state.main.selection.id
      : undefined,
  );

  const point = useAppSelector((state) =>
    index === undefined ? undefined : state.drawingPoints.points[index],
  );

  const nextId = useAppSelector((state) => state.drawingPoints.points.length);

  const color = useAppSelector((state) => state.drawingSettings.style.color);

  const tags = useMemo(() => drawingOsmTags(point ?? {}), [point]);

  const [projectPointDialogVisible, setProjectPointDialogVisible] =
    useState(false);

  const projectPoint = useCallback(
    (distance: number, azimuth: number) => {
      if (!point) {
        return;
      }

      const { coords } = point;

      setProjectPointDialogVisible(false);

      const p = destination([coords.lon, coords.lat], distance, azimuth, {
        units: 'meters',
      });

      dispatch(
        drawingPointAdd({
          id: nextId,
          coords: {
            lon: p.geometry.coordinates[0],
            lat: p.geometry.coordinates[1],
          },
          color,
          markerType: point.markerType,
          icon: point.icon,
        }),
      );
    },
    [color, dispatch, nextId, point],
  );

  if (!point || index === undefined) {
    return null;
  }

  const { coords } = point;

  return (
    <>
      <ProjectPointModal
        show={projectPointDialogVisible}
        onClose={() => setProjectPointDialogVisible(false)}
        onAdd={projectPoint}
      />

      <Selection
        control={<DrawingToggleButton tool="draw-points" />}
        icon={<FaMapMarkerAlt />}
        label={m?.selections.drawPoints}
        deletable
      >
        <LongPressTooltip breakpoint="sm" label={dm?.modify}>
          {({ label, labelClassName, props }) => (
            <Button
              variant="secondary"
              onClick={() =>
                dispatch(setActiveModal({ type: 'current-drawing-properties' }))
              }
              {...props}
            >
              <FaTag />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>

        {/* Not only "open in": the menu also routes to the point, takes a view
            from it and hands it to an editor. */}
        <LongPressTooltip label={m?.general.actions}>
          {({ props }) => (
            <OpenInExternalAppMenuButton
              lat={coords.lat}
              lon={coords.lon}
              includePoint
              pointTitle={point.label}
              pointTags={tags}
              url={`/?point=${coords.lat}/${coords.lon}`}
              toggleProps={props}
              menuItems={
                <>
                  <Dropdown.Item
                    as="button"
                    onClick={() => setProjectPointDialogVisible(true)}
                  >
                    <TbAngle /> {dm?.projection.projectPoint}
                  </Dropdown.Item>

                  <Dropdown.Item
                    as="button"
                    onClick={() => {
                      convertToDataViewer({ type: 'drawing-point', index });
                    }}
                  >
                    <MdShapeLine />{' '}
                    {m?.general.convertTo({ tool: m?.tools.dataViewer })}
                  </Dropdown.Item>

                  <RouteEndpointItems divider {...coords} />

                  <ViewFromHereItems divider {...coords} />
                </>
              }
            >
              <FaEllipsisV />
            </OpenInExternalAppMenuButton>
          )}
        </LongPressTooltip>
      </Selection>
    </>
  );
}
