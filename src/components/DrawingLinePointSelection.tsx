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
} from '../actions/drawingLineActions.js';
import { useAppSelector } from '../hooks/reduxSelectHook.js';
import { useMessages } from '../l10nInjector.js';
import { Selection } from './Selection.js';
import { Toolbar } from './Toolbar.js';

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

        <Button
          variant="secondary"
          onClick={() => {
            dispatch(drawingLineJoinStart(undefined));
          }}
        >
          <FaTimes />
          <span className="d-none d-sm-inline"> {m?.general.cancel}</span>{' '}
          <kbd>Esc</kbd>
        </Button>
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
      title={
        line.type === 'line'
          ? m?.selections.linePoint
          : m?.selections.polygonPoint
      }
      deletable={line.points.length > (line.type === 'line' ? 2 : 3)}
    >
      {line.type === 'line' && !end && (
        <Button
          className="ms-1"
          variant="secondary"
          onClick={() => dispatch(drawingLineSplit(pt))}
        >
          <RiScissorsFill />
          <span className="d-none d-sm-inline"> {m?.drawing.split}</span>
        </Button>
      )}

      {line.type === 'line' && end && (
        <Button
          className="ms-1"
          variant="secondary"
          onClick={() => dispatch(drawingLineJoinStart(pt))}
        >
          <CgArrowsMergeAltH />
          <span className="d-none d-sm-inline"> {m?.drawing.join}</span>
        </Button>
      )}

      {line.type === 'line' && end && (
        <Button
          className="ms-1"
          variant="secondary"
          onClick={() => dispatch(drawingLineContinue(pt))}
        >
          <FaRegPlayCircle />
          <span className="d-none d-sm-inline"> {m?.drawing.continue}</span>
        </Button>
      )}
    </Selection>
  );
}
