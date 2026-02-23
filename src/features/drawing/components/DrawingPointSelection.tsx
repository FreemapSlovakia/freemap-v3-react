import { destination } from '@turf/destination';
import { type ReactElement, useCallback, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaExternalLinkAlt, FaMapMarkerAlt, FaTag } from 'react-icons/fa';
import { TbAngle } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { drawingPointAdd } from '../model/actions/drawingPointActions.js';
import { setActiveModal } from '../../../actions/mainActions.js';
import { useAppSelector } from '../../../hooks/useAppSelector.js';
import { useMessages } from '../../../l10nInjector.js';
import { LongPressTooltip } from '../../../components/LongPressTooltip.js';
import { OpenInExternalAppMenuButton } from '../../../components/OpenInExternalAppMenuButton.js';
import { ProjectPointModal } from './ProjectPointModal.js';
import { Selection } from '../../../components/Selection.js';

export default DrawingPointSelection;

export function DrawingPointSelection(): ReactElement | null {
  const dispatch = useDispatch();

  const m = useMessages();

  const point = useAppSelector((state) =>
    state.main.selection?.type === 'draw-points'
      ? state.drawingPoints.points[state.main.selection.id]
      : undefined,
  );

  const nextId = useAppSelector((state) => state.drawingPoints.points.length);

  const color = useAppSelector((state) => state.drawingSettings.drawingColor);

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
        }),
      );
    },
    [color, dispatch, nextId, point],
  );

  if (!point) {
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
        icon={<FaMapMarkerAlt />}
        label={m?.selections.drawPoints}
        deletable
      >
        <LongPressTooltip breakpoint="sm" label={m?.drawing.modify}>
          {({ label, labelClassName, props }) => (
            <Button
              className="ms-1"
              variant="secondary"
              onClick={() =>
                dispatch(setActiveModal('current-drawing-properties'))
              }
              {...props}
            >
              <FaTag />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>

        <LongPressTooltip
          breakpoint="sm"
          label={m?.drawing.projection.projectPoint}
        >
          {({ label, labelClassName, props }) => (
            <Button
              className="ms-1"
              variant="secondary"
              onClick={() => setProjectPointDialogVisible(true)}
              {...props}
            >
              <TbAngle />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>

        <OpenInExternalAppMenuButton
          className="ms-1"
          lat={coords.lat}
          lon={coords.lon}
          includePoint
          pointTitle={point.label}
          url={`/?point=${coords.lat}/${coords.lon}`}
        >
          <FaExternalLinkAlt />
          <span className="d-none d-sm-inline">
            {' '}
            {m?.gallery.viewer.openInNewWindow}
          </span>
        </OpenInExternalAppMenuButton>
      </Selection>
    </>
  );
}
