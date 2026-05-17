import { setActiveModal } from '@app/store/actions.js';
import {
  elevationChartClose,
  elevationChartSetTrackGeojson,
} from '@features/elevationChart/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { ActionIcon, Button, Menu } from '@mantine/core';
import { MantineLongPressTooltip } from '@shared/components/MantineLongPressTooltip.js';
import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { destination } from '@turf/destination';
import { lineString } from '@turf/helpers';
import { type ReactElement, useCallback, useState } from 'react';
import {
  FaChartArea,
  FaCompressAlt,
  FaDrawPolygon,
  FaEllipsisV,
  FaExchangeAlt,
  FaRegStopCircle,
  FaTag,
} from 'react-icons/fa';
import { TbAngle, TbTimeline } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import {
  drawingLineAddPoint,
  drawingLineReverse,
  drawingLineSimplify,
  drawingLineStopDrawing,
} from '../model/actions/drawingLineActions.js';
import ProjectPointModal from './ProjectPointModal.js';

export default DrawingLineSelection;

export function DrawingLineSelection(): ReactElement | null {
  const dispatch = useDispatch();

  const m = useMessages();

  const drawing = useAppSelector((state) => state.drawingLines.drawing);

  const lineIndex = useAppSelector((state) =>
    state.main.selection?.type === 'draw-line-poly'
      ? state.main.selection.id
      : undefined,
  );

  const line = useAppSelector((state) =>
    state.main.selection?.type === 'draw-line-poly'
      ? state.drawingLines.lines[state.main.selection.id]
      : undefined,
  );

  const showElevationChart = useAppSelector((state) =>
    Boolean(state.elevationChart.elevationProfilePoints),
  );

  const toggleElevationChart = useCallback(() => {
    // TODO to processor

    if (showElevationChart) {
      dispatch(elevationChartClose());
    } else if (line) {
      dispatch(
        elevationChartSetTrackGeojson(
          lineString(line.points.map((p) => [p.lon, p.lat])),
        ),
      );
    }
  }, [line, showElevationChart, dispatch]);

  const [projectPointDialogVisible, setProjectPointDialogVisible] =
    useState(false);

  const projectPoint = useCallback(
    (distance: number, azimuth: number) => {
      if (lineIndex === undefined) {
        return;
      }

      const basePoint = line?.points.at(-1);

      if (!basePoint) {
        return;
      }

      setProjectPointDialogVisible(false);

      const p = destination([basePoint.lon, basePoint.lat], distance, azimuth, {
        units: 'meters',
      });

      dispatch(
        drawingLineAddPoint({
          lineIndex,
          indexOfLineToSelect: lineIndex,
          point: {
            id: basePoint.id + 1,
            lon: p.geometry.coordinates[0],
            lat: p.geometry.coordinates[1],
          },
        }),
      );
    },
    [dispatch, line?.points, lineIndex],
  );

  const handleSimplify = useCallback(() => {
    if (lineIndex === undefined) {
      return;
    }

    const tolerance = window.prompt(m?.general.simplifyPrompt, '50');

    if (tolerance !== null) {
      dispatch(
        drawingLineSimplify({
          lineIndex,
          tolerance: Number(tolerance || '0') / 100000,
        }),
      );
    }
  }, [dispatch, lineIndex, m]);

  if (!line) {
    return null;
  }

  const isLine = line.type === 'line';

  return (
    <>
      <ProjectPointModal
        show={projectPointDialogVisible}
        onClose={() => setProjectPointDialogVisible(false)}
        onAdd={projectPoint}
      />

      <Selection
        icon={isLine ? <TbTimeline /> : <FaDrawPolygon />}
        label={isLine ? m?.selections.drawLines : m?.selections.drawPolygons}
        deletable
      >
        {drawing && (
          <MantineLongPressTooltip
            breakpoint="sm"
            label={m?.drawing.stopDrawing}
            kbd="Esc"
          >
            {({ label, labelHidden, kbdEl, props }) =>
              labelHidden ? (
                <ActionIcon
                  className="ms-1"
                  variant="filled"
                  color="gray"
                  size="input-sm"
                  onClick={() => dispatch(drawingLineStopDrawing())}
                  {...props}
                >
                  <FaRegStopCircle />
                </ActionIcon>
              ) : (
                <Button
                  className="ms-1"
                  color="gray"
                  size="sm"
                  leftSection={<FaRegStopCircle />}
                  rightSection={kbdEl}
                  onClick={() => dispatch(drawingLineStopDrawing())}
                  {...props}
                >
                  {label}
                </Button>
              )
            }
          </MantineLongPressTooltip>
        )}

        <MantineLongPressTooltip breakpoint="sm" label={m?.drawing.modify}>
          {({ label, labelHidden, props }) =>
            labelHidden ? (
              <ActionIcon
                className="ms-1"
                variant="filled"
                color="gray"
                size="input-sm"
                onClick={() =>
                  dispatch(setActiveModal('current-drawing-properties'))
                }
                {...props}
              >
                <FaTag />
              </ActionIcon>
            ) : (
              <Button
                className="ms-1"
                color="gray"
                size="sm"
                leftSection={<FaTag />}
                onClick={() =>
                  dispatch(setActiveModal('current-drawing-properties'))
                }
                {...props}
              >
                {label}
              </Button>
            )
          }
        </MantineLongPressTooltip>

        <Menu>
          <Menu.Target>
            <ActionIcon
              className="ms-1"
              variant="filled"
              color="gray"
              size="input-sm"
            >
              <FaEllipsisV />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            {isLine && line.points.length > 1 && (
              <Menu.Item
                leftSection={<FaChartArea />}
                color={showElevationChart ? 'blue' : undefined}
                onClick={toggleElevationChart}
              >
                {m?.general.elevationProfile ?? '…'}
              </Menu.Item>
            )}

            {isLine && line.points.length > 0 && (
              <Menu.Item
                leftSection={<TbAngle />}
                onClick={() => setProjectPointDialogVisible(true)}
              >
                {m?.drawing.projection.projectPoint ?? '…'}
              </Menu.Item>
            )}

            {line.points.length > 2 && (
              <Menu.Item
                leftSection={<FaCompressAlt />}
                onClick={handleSimplify}
              >
                {m?.drawing.simplify ?? '…'}
              </Menu.Item>
            )}

            {line.points.length > 1 && (
              <Menu.Item
                leftSection={<FaExchangeAlt />}
                onClick={() =>
                  lineIndex !== undefined &&
                  dispatch(drawingLineReverse({ lineIndex }))
                }
              >
                {m?.drawing.reverse ?? '…'}
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      </Selection>
    </>
  );
}
