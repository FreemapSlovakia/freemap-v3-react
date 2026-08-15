import { openTool, setActiveModal } from '@app/store/actions.js';
import {
  elevationChartClose,
  elevationChartOpen,
} from '@features/elevationChart/model/actions.js';
import { useMessages } from '@features/l10n/l10nInjector.js';
import { type ToastAction, toastsAdd } from '@features/toasts/model/actions.js';
import { FmDropdownMenu } from '@shared/components/FmDropdownMenu.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Selection } from '@shared/components/Selection.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import { area } from '@turf/area';
import { booleanContains } from '@turf/boolean-contains';
import { destination } from '@turf/destination';
import { polygon } from '@turf/helpers';
import { type ReactElement, useCallback, useMemo, useState } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import {
  FaChartArea,
  FaCompressAlt,
  FaDrawPolygon,
  FaEllipsisV,
  FaExchangeAlt,
  FaObjectGroup,
  FaObjectUngroup,
  FaRegStopCircle,
  FaTag,
  FaTimes,
} from 'react-icons/fa';
import { RiScissorsFill } from 'react-icons/ri';
import { TbAngle, TbTimeline } from 'react-icons/tb';
import { useDispatch } from 'react-redux';
import {
  type DrawnLine,
  drawingLineAddPoint,
  drawingLineCutHole,
  drawingLineReverse,
  drawingLineSetHoleOf,
  drawingLineSimplify,
  drawingLineStopDrawing,
  drawingPreventCutHoleHint,
} from '../model/actions/drawingLineActions.js';
import { loadDrawingMessages } from '../translations/loadDrawingMessages.js';
import { useDrawingMessages } from '../translations/useDrawingMessages.js';
import { DrawingToggleButton } from './DrawingToggleButton.js';
import { ProjectPointModal } from './ProjectPointModal.js';

// Drawing rings are stored open; turf needs them closed.
function toTurfPolygon(line: DrawnLine) {
  return polygon([
    [...line.points, line.points[0]!].map((p) => [p.lon, p.lat]),
  ]);
}

export default function DrawingLineSelection(): ReactElement | null {
  const dispatch = useDispatch();

  const m = useMessages();

  const dm = useDrawingMessages();

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

  const lines = useAppSelector((state) => state.drawingLines.lines);

  const cuttingHole = useAppSelector(
    (state) => line !== undefined && state.drawingLines.holeFor === line.id,
  );

  const preventCutHoleHint = useAppSelector(
    (state) => state.drawingSettings.preventCutHoleHint,
  );

  // Offering "don't show next time" only once the pref can outlive the session.
  const canRememberHintPref = useAppSelector(
    (state) => state.cookieConsent.cookieConsentResult !== null,
  );

  const isHole = line?.holeOfId !== undefined;

  const [moreOpen, setMoreOpen] = useState(false);

  // The polygon a "make this a hole" would attach to: the smallest one that
  // fully contains this ring, so a ring inside nested polygons joins the one it
  // visually sits in.
  //
  // Only while the menu offering it is open: `lines` changes on every mousemove
  // of a vertex drag, and a containment test against every polygon on each of
  // those would be felt on a drawing of any size.
  const enclosingIndex = useMemo(() => {
    if (
      !moreOpen ||
      lineIndex === undefined ||
      line?.type !== 'polygon' ||
      isHole ||
      line.points.length < 3
    ) {
      return undefined;
    }

    const inner = toTurfPolygon(line);

    let best: number | undefined;

    let bestArea = Number.POSITIVE_INFINITY;

    for (const [i, other] of lines.entries()) {
      if (
        i === lineIndex ||
        other.type !== 'polygon' ||
        other.holeOfId !== undefined ||
        other.points.length < 3
      ) {
        continue;
      }

      const outer = toTurfPolygon(other);

      if (!booleanContains(outer, inner)) {
        continue;
      }

      const a = area(outer);

      if (a < bestArea) {
        bestArea = a;

        best = i;
      }
    }

    return best;
  }, [isHole, line, lineIndex, lines, moreOpen]);

  // The chart is of this line by id, so it stays with the line once the
  // selection goes — and lights this button only for the line it is of.
  const showElevationChart = useAppSelector(
    (state) =>
      state.elevationChart.target?.type === 'drawing' &&
      state.elevationChart.target.lineId === line?.id,
  );

  const toggleElevationChart = useCallback(() => {
    if (showElevationChart || !line) {
      dispatch(elevationChartClose());
    } else {
      dispatch(elevationChartOpen({ type: 'drawing', lineId: line.id }));
    }
  }, [showElevationChart, line, dispatch]);

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
        case 'cut-hole': {
          // Opening a map-click tool disarms hole mode the same way it drops a
          // line being drawn, so arm it only once the tool is open.
          dispatch(openTool('draw-polygons'));

          dispatch(drawingLineCutHole({ parentLineIndex: lineIndex }));

          if (!preventCutHoleHint) {
            const actions: ToastAction[] = [{ nameKey: 'general.ok' }];

            if (canRememberHintPref) {
              actions.push({
                nameKey: 'general.preventShowingAgain',
                action: drawingPreventCutHoleHint(),
                variant: 'dark',
              });
            }

            dispatch(
              toastsAdd({
                id: 'drawing.cutHoleHint',
                messageKey: 'cutHoleHint',
                messageLoader: loadDrawingMessages,
                style: 'info',
                actions,
                // Hole mode is spent once the hole's first point lands, and
                // dropped when it is cancelled — either way the hint is done.
                statePredicate: (state) =>
                  state.drawingLines.holeFor === undefined,
              }),
            );
          }

          break;
        }

        case 'make-hole':
          dispatch(
            drawingLineSetHoleOf({
              lineIndex,
              parentLineIndex: enclosingIndex,
            }),
          );

          break;

        case 'detach-hole':
          dispatch(
            drawingLineSetHoleOf({ lineIndex, parentLineIndex: undefined }),
          );

          break;

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
    [
      canRememberHintPref,
      dispatch,
      enclosingIndex,
      lineIndex,
      m,
      preventCutHoleHint,
      toggleElevationChart,
    ],
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
        control={
          <DrawingToggleButton tool={isLine ? 'draw-lines' : 'draw-polygons'} />
        }
        icon={isLine ? <TbTimeline /> : <FaDrawPolygon />}
        label={
          isHole
            ? m?.selections.drawPolygonHole
            : isLine
              ? m?.selections.drawLines
              : m?.selections.drawPolygons
        }
        deletable
      >
        {cuttingHole && (
          <LongPressTooltip breakpoint="sm" label={m?.general.cancel} kbd="Esc">
            {({ label, labelClassName, props }) => (
              <Button
                variant="secondary"
                onClick={() => dispatch(drawingLineStopDrawing())}
                {...props}
              >
                <FaTimes />
                <span className={labelClassName}> {label}</span>
              </Button>
            )}
          </LongPressTooltip>
        )}

        {drawing && (
          <LongPressTooltip breakpoint="sm" label={dm?.stopDrawing} kbd="Esc">
            {({ label, labelClassName, props }) => (
              <Button
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

        {/* A hole carries no label or style of its own — it is drawn as part of
            its parent — so there is nothing here to edit. */}
        {!isHole && (
          <LongPressTooltip breakpoint="sm" label={dm?.modify}>
            {({ label, labelClassName, props }) => (
              <Button
                variant="secondary"
                onClick={() =>
                  dispatch(
                    setActiveModal({ type: 'current-drawing-properties' }),
                  )
                }
                {...props}
              >
                <FaTag />
                <span className={labelClassName}> {label}</span>
              </Button>
            )}
          </LongPressTooltip>
        )}

        <Dropdown id="more" onSelect={handleMoreSelect} onToggle={setMoreOpen}>
          <Dropdown.Toggle variant="secondary">
            <FaEllipsisV />
          </Dropdown.Toggle>

          <FmDropdownMenu>
            {!isLine && !isHole && line.points.length > 2 && (
              <Dropdown.Item
                as="button"
                eventKey="cut-hole"
                active={cuttingHole}
              >
                <RiScissorsFill />
                &nbsp;{dm?.cutHole ?? '…'}
              </Dropdown.Item>
            )}

            {enclosingIndex !== undefined && (
              <Dropdown.Item as="button" eventKey="make-hole">
                <FaObjectGroup />
                &nbsp;{dm?.makeHole ?? '…'}
              </Dropdown.Item>
            )}

            {isHole && (
              <Dropdown.Item as="button" eventKey="detach-hole">
                <FaObjectUngroup />
                &nbsp;{dm?.detachHole ?? '…'}
              </Dropdown.Item>
            )}

            {isLine && line.points.length > 1 && (
              <Dropdown.Item
                as="button"
                eventKey="toggle-elevation-chart"
                active={showElevationChart}
              >
                <FaChartArea />
                &nbsp;{m?.general.elevationProfile ?? '…'}
              </Dropdown.Item>
            )}

            {line.points.length > 0 && (
              <Dropdown.Item as="button" eventKey="project-point">
                <TbAngle />
                &nbsp;{dm?.projection.projectPoint ?? '…'}
              </Dropdown.Item>
            )}

            {line.points.length > 2 && (
              <Dropdown.Item as="button" eventKey="simplify">
                <FaCompressAlt />
                &nbsp;{dm?.simplify ?? '…'}
              </Dropdown.Item>
            )}

            {line.points.length > 1 && (
              <Dropdown.Item as="button" eventKey="reverse">
                <FaExchangeAlt />
                &nbsp;{dm?.reverse ?? '…'}
              </Dropdown.Item>
            )}
          </FmDropdownMenu>
        </Dropdown>
      </Selection>
    </>
  );
}
