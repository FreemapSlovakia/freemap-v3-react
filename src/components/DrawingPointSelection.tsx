import { destination } from '@turf/destination';
import { type ReactElement, useCallback, useState } from 'react';
import { Button } from 'react-bootstrap';
import { FaExternalLinkAlt, FaMapMarkerAlt, FaTag } from 'react-icons/fa';
import { TbAngle } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import { drawingPointAdd } from '../actions/drawingPointActions.js';
import { setActiveModal } from '../actions/mainActions.js';
import { useAppSelector } from '../hooks/useAppSelector.js';
import { useMessages } from '../l10nInjector.js';
import { LongPressTooltip } from './LongPressTooltip.js';
import { OpenInExternalAppMenuButton } from './OpenInExternalAppMenuButton.js';
import { ProjectPointModal } from './ProjectPointModal.js';
import { Selection } from './Selection.js';

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

  const color = useAppSelector((state) => state.main.drawingColor);

  const [projectPointDialogVisible, setProjectPointDialogVisible] =
    useState(false);

  const projectPoint = useCallback(
    (distance: number, azimuth: number) => {
      if (!point) {
        return;
      }

      setProjectPointDialogVisible(false);

      const p = destination([point.lon, point.lat], distance, azimuth, {
        units: 'meters',
      });

      dispatch(
        drawingPointAdd({
          id: nextId,
          lon: p.geometry.coordinates[0],
          lat: p.geometry.coordinates[1],
          color,
        }),
      );
    },
    [color, dispatch, nextId, point],
  );

  return !point ? null : (
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
              onClick={() => dispatch(setActiveModal('edit-label'))}
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

        <LongPressTooltip
          breakpoint="sm"
          label={m?.gallery.viewer.openInNewWindow}
        >
          {({ label, labelClassName, props }) => (
            <OpenInExternalAppMenuButton
              className="ms-1"
              lat={point.lat}
              lon={point.lon}
              includePoint
              pointTitle={point.label}
              url={`/?point=${point.lat}/${point.lon}`}
              {...props}
            >
              <FaExternalLinkAlt />
              <span className={labelClassName}> {label}</span>
            </OpenInExternalAppMenuButton>
          )}
        </LongPressTooltip>
      </Selection>
    </>
  );
}
