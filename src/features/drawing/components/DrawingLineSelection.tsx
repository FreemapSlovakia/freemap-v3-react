import { setActiveModal } from '@app/store/actions.js';
import {
  elevationChartClose,
  elevationChartSetTrackGeojson,
} from '@features/elevationChart/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Selection } from '@shared/components/Selection.js';
import { fixedPopperConfig } from '@shared/fixedPopperConfig.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { destination } from '@turf/destination';
import { lineString } from '@turf/helpers';
import { type ReactElement, useCallback, useState } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
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

  const handleMoreSelect = useCallback(
    (eventKey: string | null) => {
      if (lineIndex === undefined) {
        return;
      }

      switch (eventKey) {
        case 'project-point':
          setProjectPointDialogVisible(true);

          break;

        case 'toggle-elevation-chart':
          toggleElevationChart();

          break;

        case 'reverse':
          dispatch(drawingLineReverse({ lineIndex }));

          break;

        case 'simplify': {
          const tolerance = window.prompt(m?.general.simplifyPrompt, '50');

          if (tolerance !== null) {
            dispatch(
              drawingLineSimplify({
                lineIndex,
                tolerance: Number(tolerance || '0') / 100000,
              }),
            );
          }

          break;
        }
      }
    },
    [dispatch, lineIndex, m, toggleElevationChart],
  );

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
          <LongPressTooltip
            breakpoint="sm"
            label={m?.drawing.stopDrawing}
            kbd="Esc"
          >
            {({ label, labelClassName, props }) => (
              <Button
                className="ms-1"
                variant="secondary"
                onClick={() => dispatch(drawingLineStopDrawing())}
                {...props}
              >
                <FaRegStopCircle />
                <span className={labelClassName}> {label}</span>
              </Button>
            )}
          </LongPressTooltip>
        )}

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

        <Dropdown className="ms-1" id="more" onSelect={handleMoreSelect}>
          <Dropdown.Toggle variant="secondary">
            <FaEllipsisV />
          </Dropdown.Toggle>

          <Dropdown.Menu popperConfig={fixedPopperConfig}>
            {isLine && line.points.length > 1 && (
              <Dropdown.Item
                eventKey="toggle-elevation-chart"
                active={showElevationChart}
              >
                <FaChartArea />
                &nbsp;{m?.general.elevationProfile ?? '…'}
              </Dropdown.Item>
            )}

            {isLine && line.points.length > 0 && (
              <Dropdown.Item eventKey="project-point">
                <TbAngle />
                &nbsp;{m?.drawing.projection.projectPoint ?? '…'}
              </Dropdown.Item>
            )}

            {line.points.length > 2 && (
              <Dropdown.Item eventKey="simplify">
                <FaCompressAlt />
                &nbsp;{m?.drawing.simplify ?? '…'}
              </Dropdown.Item>
            )}

            {line.points.length > 1 && (
              <Dropdown.Item eventKey="reverse">
                <FaExchangeAlt />
                &nbsp;{m?.drawing.reverse ?? '…'}
              </Dropdown.Item>
            )}
          </Dropdown.Menu>
        </Dropdown>
      </Selection>
    </>
  );
}
