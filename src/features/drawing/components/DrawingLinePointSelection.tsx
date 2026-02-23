import { useMessages } from '@features/l10n/l10nInjector.js';
import { LongPressTooltip } from '@shared/components/LongPressTooltip.js';
import { Selection } from '@shared/components/Selection.js';
import { Toolbar } from '@shared/components/Toolbar.js';
import { useAppSelector } from '@shared/hooks/useAppSelector.js';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { CgArrowsMergeAltH } from 'react-icons/cg';
import { FaDrawPolygon, FaRegPlayCircle, FaTimes } from 'react-icons/fa';
import { MdTimeline } from 'react-icons/md';
import { RiScissorsFill } from 'react-icons/ri';
import { useDispatch } from 'react-redux';
import {
  drawingLineContinue,
  drawingLineJoinStart,
  drawingLineSplit,
} from '../model/actions/drawingLineActions.js';

export default DrawingLinePointSelection;

export function DrawingLinePointSelection(): ReactElement | null {
  const dispatch = useDispatch();

  const m = useMessages();

  const selection = useAppSelector((state) => state.main.selection);

  const line = useAppSelector((state) =>
    state.main.selection?.type === 'line-point'
      ? state.drawingLines.lines[state.main.selection.lineIndex]
      : undefined,
  );

  const joining = useAppSelector(
    (state) => state.drawingLines.joinWith !== undefined,
  );

  if (
    !line ||
    selection?.type !== 'line-point' ||
    joining /* TODO show joining toolbar */
  ) {
    return (
      <Toolbar className="mt-2">
        <span className="me-2">{m?.drawing.selectPointToJoin}</span>

        <LongPressTooltip breakpoint="sm" kbd="Esc" label={m?.general.cancel}>
          {({ label, labelClassName, props }) => (
            <Button
              variant="secondary"
              onClick={() => {
                dispatch(drawingLineJoinStart(undefined));
              }}
              {...props}
            >
              <FaTimes />
              <span className={labelClassName}>{label}</span>
            </Button>
          )}
        </LongPressTooltip>
      </Toolbar>
    );
  }

  const pt = {
    lineIndex: selection.lineIndex,
    pointId: selection.pointId,
  };

  const end =
    selection.pointId === line.points[0].id ||
    selection.pointId === line.points.at(-1)?.id;

  return (
    <Selection
      icon={line.type === 'line' ? <MdTimeline /> : <FaDrawPolygon />}
      label={
        line.type === 'line'
          ? m?.selections.linePoint
          : m?.selections.polygonPoint
      }
      deletable={line.points.length > (line.type === 'line' ? 2 : 3)}
    >
      {line.type === 'line' && !end && (
        <LongPressTooltip breakpoint="sm" label={m?.drawing.split}>
          {({ label, labelClassName, props }) => (
            <Button
              className="ms-1"
              variant="secondary"
              onClick={() => dispatch(drawingLineSplit(pt))}
              {...props}
            >
              <RiScissorsFill />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>
      )}

      {line.type === 'line' && end && (
        <LongPressTooltip breakpoint="sm" label={m?.drawing.join}>
          {({ label, labelClassName, props }) => (
            <Button
              className="ms-1"
              variant="secondary"
              onClick={() => dispatch(drawingLineJoinStart(pt))}
              {...props}
            >
              <CgArrowsMergeAltH />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>
      )}

      {line.type === 'line' && end && (
        <LongPressTooltip breakpoint="sm" label={m?.drawing.continue}>
          {({ label, labelClassName, props }) => (
            <Button
              className="ms-1"
              variant="secondary"
              onClick={() => dispatch(drawingLineContinue(pt))}
              {...props}
            >
              <FaRegPlayCircle />
              <span className={labelClassName}> {label}</span>
            </Button>
          )}
        </LongPressTooltip>
      )}
    </Selection>
  );
}
